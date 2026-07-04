import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import log from "../logger";
import { enqueueAuditLog } from "../queues/audit-log.queue";
import { geocodeAddress } from "../service/integrations/geocode.service";
import { findUser } from "../service/user.service";
import { createAsset, findAndUpdateAsset, findAsset, findAssets } from "../service/asset.service";
import { findLocation } from "../service/location.service";
import { createAnimal, findAndUpdateAnimal, deleteAnimal } from "../service/animal.service";
import { createCrop, findAndUpdateCrop, deleteCrop } from "../service/crop.service";
import { createAnimalGroup, findAndUpdateAnimalGroup, deleteAnimalGroup } from "../service/animal-group.service";
import { sendQrCodeJob } from "../queues/qrcode.queue";
import { createQrTrace, findQrTrace } from "../service/qr-trace.service";

const parseAssetsFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, location, searchTerm, producer } = query; 

    const filters: any = {}; 

    if (searchTerm) {
        filters.$or = [
            // { addressDescription: { $regex: searchTerm, $options: "i" } },
            { name: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (producer) {
        filters.producer = producer;
    }

    if (location) {
        filters.currentLocation = location;
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

export const createAssetHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body as any;

        const currentUser = await findUser({ _id: userId });
        if (!currentUser) {
            return response.notFound(res, { message: "User not found" });
        }

        const assetType = body?.type;
        const currentLocationId = body?.location ?? body?.currentLocation;

        if (!assetType || !['animal', 'crop', 'animal-group'].includes(assetType)) {
            return response.badRequest(res, { message: 'Invalid or missing asset type' });
        }

        if (!currentLocationId) {
            return response.badRequest(res, { message: 'Missing asset location' });
        }

        const location = await findLocation({ _id: currentLocationId, deleted: false, producer: currentUser.organizationRoles!.organization._id });
        if (!location) {
            return response.notFound(res, { message: 'Location not found. Please ensure it exists and belongs to your organization' });
        }

        const organizationId = currentUser.organizationRoles!.organization._id;
        const assetPayload: any = {
            ...body,
            currentLocation: currentLocationId,
            createdBy: userId,
            producer: organizationId,
        };

        delete assetPayload.location;
        delete assetPayload.animal;
        delete assetPayload.crop;
        delete assetPayload.animalGroup;

        let createdAnimal: any = null;
        let createdCrop: any = null;
        let createdAnimalGroup: any = null;
        let asset: any = null;

        try {
            if (assetType === 'animal') {
                if (!body.animal) {
                    return response.badRequest(res, { message: 'Missing animal payload for asset type animal' });
                }
                createdAnimal = await createAnimal({ ...body.animal, producer: organizationId, createdBy: userId });
                assetPayload.animal = createdAnimal._id;
            }

            if (assetType === 'crop') {
                if (!body.crop) {
                    return response.badRequest(res, { message: 'Missing crop payload for asset type crop' });
                }
                createdCrop = await createCrop({ ...body.crop, producer: organizationId, createdBy: userId });
                assetPayload.crop = createdCrop._id;
            }

            if (assetType === 'animal-group') {
                if (!body.animalGroup) {
                    return response.badRequest(res, { message: 'Missing animalGroup payload for asset type animal-group' });
                }
                createdAnimalGroup = await createAnimalGroup({ ...body.animalGroup, producer: organizationId, createdBy: userId });
                assetPayload.animalGroup = createdAnimalGroup._id;
            }

            asset = await createAsset(assetPayload);

            if (createdAnimal) {
                await findAndUpdateAnimal({ _id: createdAnimal._id }, { asset: asset._id }, { new: true });
            }

            if (createdCrop) {
                await findAndUpdateCrop({ _id: createdCrop._id }, { asset: asset._id }, { new: true });
            }

            if (createdAnimalGroup) {
                await findAndUpdateAnimalGroup({ _id: createdAnimalGroup._id }, { asset: asset._id }, { new: true });
            }
        } catch (error: any) {
            if (!asset) {
                if (createdAnimal) {
                    await deleteAnimal({ _id: createdAnimal._id }).catch(() => {});
                }
                if (createdCrop) {
                    await deleteCrop({ _id: createdCrop._id }).catch(() => {});
                }
                if (createdAnimalGroup) {
                    await deleteAnimalGroup({ _id: createdAnimalGroup._id }).catch(() => {});
                }
            }
            throw error;
        }

        const traceUrl = `https://agrotraceng.cloud/trace/${asset.id}`;

        // create QR trace for the asset
        const qrTracePayload = {
            referenceType: 'asset' as const, 
            referenceItem: asset._id,
            producer: currentUser.organizationRoles!.organization._id,
            traceUrl,
        }

        const qrTrace = await createQrTrace(qrTracePayload)
        
        if(qrTrace) {
           // send qr code job to queue
            sendQrCodeJob({
                traceId: qrTrace._id!,
                data: {
                    traceUrl: qrTrace.traceUrl!,
                    referenceItem: asset._id,
                    producer: currentUser.organizationRoles!.organization._id,
                }
            })
        }
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'create',
            description: `created asset ${asset.name || 'unknown'}`,
            actor: userId,
            item: asset._id,
            requestPayload: body,
            responseObject: asset
        }).catch((error) => {
            log.error('Failed to enqueue audit log for asset creation', error);
        });
        
        return response.created(res, asset)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAssetsHandler = async (req: Request, res: Response) => {
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
        const filters = parseAssetsFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const assets = await findAssets( {...filters, ...{ deleted: false, producer: currentUser.organizationRoles!.organization._id }}, resPerPage, page, expand)

        const responseObject = {
            total: assets.total,
            assets: assets.data
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAssetHandler = async (req: Request, res: Response) => {
    try {
        const assetId = get(req, 'params.assetId');
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

        const asset = await findAsset({ id: assetId, deleted: false, producer: currentUser.organizationRoles!.organization._id }, expand)

        if(!asset) {
            return response.notFound(res, {message: 'asset not found'})
        }

        const assetQr = await findQrTrace({referenceItem: asset._id, referenceType: 'asset', producer: currentUser.organizationRoles!.organization._id})

        return response.ok(res, {...asset, assetQr})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateAssetHandler = async (req: Request, res: Response) => {
    try {
        const assetId = get(req, 'params.assetId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const asset = await findAsset({_id: assetId})
        if(!asset) {
            return response.notFound(res, {message: 'asset not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== asset.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to update this asset"})
        }

        const body = req.body as any;
        const update: any = { ...body };

        if (body.status && body.status !== asset.status) {
            update.$push = {
                statusHistory: {
                    status: body.status,
                    date: new Date(),
                    changedBy: userId
                }
            };

            delete update.statusHistory;
        }


        const updated = await findAndUpdateAsset({_id: asset._id}, update, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `updated asset ${asset.name || 'unknown'}`,
            actor: userId,
            item: assetId,
            requestPayload: update,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for asset update', error);
        });

        return response.ok(res, {message: 'asset updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteAssetHandler = async (req: Request, res: Response) => {
    try {
        const assetId = get(req, 'params.assetId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const asset = await findAsset({_id: assetId})
        if(!asset) {
            return response.notFound(res, {message: 'asset not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== asset.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to delete this asset"})
        }
        let body = req.body


        const updated = await findAndUpdateAsset({_id: asset._id}, {
            deleted: true,
            deleteReason: body.deleteReason,
            deletedBy: userId
        }, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'delete',
            description: `deleted asset ${asset.name || 'unknown'}`,
            actor: userId,
            item: assetId,
            requestPayload: body,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for asset delete', error);
        });

        return response.ok(res, {message: 'asset deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
