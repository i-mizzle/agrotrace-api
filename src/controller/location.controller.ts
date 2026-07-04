import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import log from "../logger";
import { enqueueAuditLog } from "../queues/audit-log.queue";
import { createCategory, findAndUpdateCategory, findCategories, findCategory } from "../service/category.service";
import { createLocation, findAndUpdateLocation, findLocation, findLocations } from "../service/location.service";
import { geocodeAddress } from "../service/integrations/geocode.service";
import { findUser } from "../service/user.service";

const parseLocationFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, lga, state, searchTerm, waterSource, soilType, producer } = query; 

    const filters: any = {}; 

    if (searchTerm) {
        filters.$or = [
            { addressDescription: { $regex: searchTerm, $options: "i" } },
            { name: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (producer) {
        filters.producer = producer;
    }

    if (lga) {
        filters.lga = lga;
    }

    if (state) {
        filters.state = state;
    }

    if (waterSource) {
        filters.waterSourceType = waterSource;
    }

    if (soilType) {
        filters.soilType = soilType;
    }
    
    if (type) {
        filters.type = type
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
  
    return filters
}

export const createLocationHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(!body.longitude || !body.latitude) {
            // geocode the address to get the latitude and longitude
            const address = `${body.addressDescription}, ${body.lga}, ${body.state}`;
            const geocodeData = await geocodeAddress(address);

            if (!geocodeData) {
                return response.error(res, new Error('Unable to geocode the provided address'));
            }

            body.latitude = geocodeData.latitude;
            body.longitude = geocodeData.longitude;
        }

        const location = await createLocation({...body, ...{
            createdBy: userId,
            producer: currentUser.organizationRoles!.organization._id
        }})
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'create',
            description: `created location ${location.name || 'unknown'}`,
            actor: userId,
            item: location._id,
            requestPayload: body,
            responseObject: location
        }).catch((error) => {
            log.error('Failed to enqueue audit log for location creation', error);
        });
        
        return response.created(res, location)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getLocationsHandler = async (req: Request, res: Response) => {
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
        const filters = parseLocationFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const locations = await findLocations( {...filters, ...{ deleted: false, producer: currentUser.organizationRoles!.organization._id }}, resPerPage, page, expand)

        const responseObject = {
            total: locations.total,
            locations: locations.data
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getLocationHandler = async (req: Request, res: Response) => {
    try {
        const locationId = get(req, 'params.locationId');
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

        const location = await findLocation({ id: locationId, deleted: false, producer: currentUser.organizationRoles!.organization._id }, expand)

        if(!location) {
            return response.notFound(res, {message: 'location not found'})
        }

        return response.ok(res, location)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateLocationHandler = async (req: Request, res: Response) => {
    try {
        const locationId = get(req, 'params.locationId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const location = await findLocation({_id: locationId})
        if(!location) {
            return response.notFound(res, {message: 'location not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== location.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to update this location"})
        }
        let update = req.body


        const updated = await findAndUpdateLocation({_id: location._id}, update, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `updated location ${location.name || 'unknown'}`,
            actor: userId,
            item: locationId,
            requestPayload: update,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for location update', error);
        });

        return response.ok(res, {message: 'location updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteLocationHandler = async (req: Request, res: Response) => {
    try {
        const locationId = get(req, 'params.locationId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const location = await findLocation({_id: locationId})
        if(!location) {
            return response.notFound(res, {message: 'location not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== location.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to delete this location"})
        }
        let body = req.body


        const updated = await findAndUpdateLocation({_id: location._id}, {
            deleted: true,
            deleteReason: body.deleteReason,
            deletedBy: userId
        }, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'delete',
            description: `deleted location ${location.name || 'unknown'}`,
            actor: userId,
            item: locationId,
            requestPayload: body,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for location delete', error);
        });

        return response.ok(res, {message: 'location deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
