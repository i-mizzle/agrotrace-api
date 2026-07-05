import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import log from "../logger";
import { enqueueAuditLog } from "../queues/audit-log.queue";
import { findUser } from "../service/user.service";
import { createEvent, findAndUpdateEvent, findEvent, findEvents } from "../service/event.service";
import { createAsset, findAndUpdateAsset, findAsset } from "../service/asset.service";
import { createAnimalGroup, findAndUpdateAnimalGroup, findAnimalGroup } from "../service/animal-group.service";
import { findLocation } from "../service/location.service";
import { createProduct } from "../service/product.service";

const parseEventsFilters = async (query: any) => {
    const { minDateCreated, maxDateCreated, asset, recorderOffline, eventCategory, eventTypeCategory, eventType, event, searchTerm, producer, performedBy, minNextDueDate, maxNextDueDate } = query; 

    const filters: any = {}; 

    if (searchTerm) {
        filters.$or = [
            { addressDescription: { $regex: searchTerm, $options: "i" } },
            { name: { $regex: searchTerm, $options: "i" } },
        ];
    }
    
    if (performedBy) {
        filters.performedBy = performedBy;
    }

    if (producer) {
        filters.producer = producer;
    }

    if (asset) {
        const assetInfo = await findAsset({ id: asset });
        // console.log('assetInfo: ', assetInfo)   
        filters.asset = assetInfo?._id;
    }

    if (recorderOffline) {
        filters.recorderOffline = recorderOffline;
    }

    if (event) {
        filters.event = event;
    }
    
    if (eventCategory) {
        filters.eventCategory = eventCategory;
    }

    if (eventTypeCategory) {
        filters.eventTypeCategory = eventTypeCategory;
    }
    
    if (eventType) {
        filters.eventType = eventType;
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.createdAt = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }

    if (minNextDueDate && !maxNextDueDate) {
        filters.nextDueDate = { $gte: (getJsDate(minNextDueDate)) };
    }

    if (maxNextDueDate && !minNextDueDate) {
        filters.nextDueDate = { $lte: getJsDate(maxNextDueDate) };
    }

    if (minNextDueDate && maxNextDueDate) {
        filters.nextDueDate = { $gte: getJsDate(minNextDueDate), $lte: getJsDate(maxNextDueDate) };
    }
  
    return filters
}

export const createEventHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        const eventAsset = await findAsset({ id: body.asset, deleted: false }, 'currentLocation')
        if(!eventAsset) {
            return response.notFound(res, {message: "Asset not found"})
        }

        let animalGroup = null
        if(eventAsset.type === 'animal-group'){
            animalGroup = await findAnimalGroup({ _id: eventAsset._id });
        }

        if(currentUser.userType === 'producer' && currentUser.organizationRoles!.organization._id.toString() !== eventAsset.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to create an event for this asset"})
        }

        if(currentUser.userType === 'exporter' && body.eventCategory !== 'export') {
            return response.forbidden(res, {message: "You are only authorized to create export events"})
        }   

        let newLocationDetails = null
        if(body.newLocation){
            newLocationDetails = await findLocation({ id: body.newLocation, deleted: false })
            if(!newLocationDetails) {
                return response.notFound(res, {message: "New location not found"})
            }
        }

        const performer = await findUser({ id: body.performedBy });

        const event = await createEvent({
            ...body, 
            newLocation: newLocationDetails?._id,
            asset: eventAsset._id,
            createdBy: userId,
            location: eventAsset.currentLocation,
            performedBy: performer ? performer._id : userId,
            producer: currentUser.organizationRoles!.organization._id
        })

        if(newLocationDetails) {
            // update the asset location to the new location if it's a single animal
            if (eventAsset.type === 'animal') {
                await findAndUpdateAsset({_id: eventAsset._id}, {
                   currentLocation: newLocationDetails._id
               }, {new: true})
            }
            // if it's an animal group and not all are moved, create a new animal group based on the moved animals and an asset at the new location and update the count of the current asset 
            if (eventAsset.type === 'animal-group') {
                if (body.quantityAffected && body.quantityAffected < animalGroup!.size) {
                    const newAsset = await createAsset({
                        name: eventAsset.name+" (moved from "+eventAsset.currentLocation.name+")",
                        type: eventAsset.type,
                        producer: currentUser.organizationRoles!.organization._id,
                        currentLocation: newLocationDetails._id,
                        ownershipStatus: eventAsset.ownershipStatus,
                        status: eventAsset.status,
                        statusHistory: eventAsset.statusHistory || [],
                        createdBy: userId})

                    await createAnimalGroup({
                        size: animalGroup!.size - body.quantityAffected,
                        producer: currentUser.organizationRoles!.organization._id,
                        createdBy: userId,
                        asset: newAsset?._id,
                        type: animalGroup!.type,
                        species: animalGroup!.species,
                        breed: animalGroup!.breed,
                        startDate: animalGroup!.startDate,
                        expectedHarvestDate: animalGroup!.expectedHarvestDate,
                        feedTypes: animalGroup!.feedTypes
                    })

                    await findAndUpdateAnimalGroup({_id: eventAsset._id}, {
                        size: animalGroup!.size - body.quantityAffected
                    }, {new: true})

                } else {
                    await findAndUpdateAsset({_id: eventAsset._id}, {
                       currentLocation: newLocationDetails._id
                   }, {new: true})
                }
            }

        }

        if(event && eventAsset.type === 'animal-group' && body.eventType === 'death') {
            const prevMortalityCount = animalGroup?.mortality?.total || 0;
            const incidents = animalGroup?.mortality?.incidents || [];
            await findAndUpdateAnimalGroup({_id: eventAsset._id}, {
                mortality: {
                    total: prevMortalityCount + (event.quantityAffected || 0),
                    incidents: [...incidents, {
                        count: body.quantityAffected || 0,
                        reasonDescription: body.notes?.[0]?.note || '',
                        date: new Date()
                    }]
                }
            }, {new: true})
        }

        // create a product if the event is a processing event and the asset is an animal or animal group 
        if(event && body.eventCategory === 'processing' && (eventAsset.type === 'animal' || eventAsset.type === 'animal-group')) {
            await Promise.all(body.products.map(async (product: any) => {
                await createProduct({
                    ...product,
                    createdBy: userId,
                    producer: currentUser.organizationRoles!.organization._id,
                    sourceAsset: eventAsset._id,
                    sourceEvent: event._id
                })
            }))
        }
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'create',
            description: `created event ${event.eventCategory || 'unknown'}`,
            actor: userId,
            item: event._id,
            requestPayload: body,
            responseObject: event
        }).catch((error) => {
            log.error('Failed to enqueue audit log for event creation', error);
        });
        
        return response.created(res, event)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEventsHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const queryObject: any = req.query;
        const filters = await parseEventsFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const events = await findEvents( {...filters, ...{ producer: currentUser.organizationRoles!.organization._id }}, resPerPage, page, expand)

        const responseObject = {
            total: events.total,
            events: events.data
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEventHandler = async (req: Request, res: Response) => {
    try {
        const eventId = get(req, 'params.eventId');
        const queryObject: any = req.query;
        
        const userId = get(req, 'user._id');
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const event = await findEvent({ id: eventId, producer: currentUser.organizationRoles!.organization._id }, expand)

        if(!event) {
            return response.notFound(res, {message: 'event not found'})
        }

        return response.ok(res, event)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateEventHandler = async (req: Request, res: Response) => {
    try {
        const eventId = get(req, 'params.eventId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const event = await findEvent({_id: eventId})
        if(!event) {
            return response.notFound(res, {message: 'event not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== event.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to update this event"})
        }
        let update = req.body


        const updated = await findAndUpdateEvent({_id: event._id}, update, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `updated event ${event.eventCategory || 'unknown'}`,
            actor: userId,
            item: eventId,
            requestPayload: update,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for event update', error);
        });

        return response.ok(res, {message: 'event updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteEventHandler = async (req: Request, res: Response) => {
    try {
        const eventId = get(req, 'params.eventId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const event = await findEvent({_id: eventId})
        if(!event) {
            return response.notFound(res, {message: 'event not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== event.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to delete this event"})
        }
        let body = req.body


        const updated = await findAndUpdateEvent({_id: event._id}, {
            deleted: true,
            deleteReason: body.deleteReason,
            deletedBy: userId
        }, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'delete',
            description: `deleted event ${event.eventCategory || 'unknown'}`,
            actor: userId,
            item: eventId,
            requestPayload: body,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for event delete', error);
        });

        return response.ok(res, {message: 'event deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
