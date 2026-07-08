import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate, slugify } from "../utils/utils";
import log from "../logger";
import { enqueueAuditLog } from "../queues/audit-log.queue";
import { findUser } from "../service/user.service";
import { findLocation } from "../service/location.service";
import { sendQrCodeJob } from "../queues/qrcode.queue";
import { createQrTrace, findQrTrace } from "../service/qr-trace.service";
import { createProduct, createAndEnqueueProductQr, findProducts, findProduct, findAndUpdateProduct } from "../service/product.service";
import { findAsset } from "../service/asset.service";
import { findProducer } from "../service/producer.service";

const parseProductsFilters = async (query: any) => {
    const { minDateCreated, maxDateCreated, sourceAsset, batch, category, type, sourceEvent, location, searchTerm, producer } = query; 

    const filters: any = {}; 

    if (searchTerm) {
        filters.$or = [
            // { addressDescription: { $regex: searchTerm, $options: "i" } },
            { name: { $regex: searchTerm, $options: "i" } },
        ];
    }

    if (producer) {
        const producerData = await findProducer({ id: producer, deleted: false });
        filters.producer = producerData?._id || null;
    }

    if (sourceAsset) {
        const asset = await findAsset({ id: sourceAsset, deleted: false });
        filters.sourceAsset = asset ? asset._id : null;
    }

    if (batch) {
        filters.batch = batch;
    }

    if (category) {
        filters.category = category;
    }

    if (sourceEvent) {
        filters.sourceEvent = sourceEvent;
    }

    if (location) {
        filters.location = location;
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

export const createProductHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body as any;

        const currentUser = await findUser({ _id: userId });
        if (!currentUser) {
            return response.notFound(res, { message: "User not found" });
        }

        let location = null;

        if(body.location) {
            location = await findLocation({ id: body.location, deleted: false, producer: currentUser.organizationRoles!.organization._id });
        }

        if (body.location && !location) {
            return response.notFound(res, { message: 'Location not found. Please ensure it exists and belongs to your organization' });
        }

        const organizationId = currentUser.organizationRoles!.organization._id;
        const productPayload: any = {
            ...body,
            slug: `${slugify(body.name)}-${new Date().getTime()}`,
            location: location?._id,
            createdBy: userId,
            producer: organizationId,
        };

        const product = await createProduct(productPayload);
        if(!product) {
            return response.error(res, {message: 'Failed to create product'})
        }

        await createAndEnqueueProductQr(product, currentUser);
        
        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'create',
            description: `created product ${product.name || 'unknown'}`,
            actor: userId,
            item: product._id,
            requestPayload: body,
            responseObject: product
        }).catch((error) => {
            log.error('Failed to enqueue audit log for asset creation', error);
        });
        
        return response.created(res, product)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getProductsHandler = async (req: Request, res: Response) => {
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
        const filters = await parseProductsFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const products = await findProducts( {...filters, ...{ deleted: false, producer: currentUser.organizationRoles!.organization._id }}, resPerPage, page, expand)

        const responseObject = {
            total: products.total,
            products: products.data
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getProductHandler = async (req: Request, res: Response) => {
    try {
        const productId = get(req, 'params.productId');
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

        const product = await findProduct({ id: productId, deleted: false, producer: currentUser.organizationRoles!.organization._id }, expand)

        if(!product) {
            return response.notFound(res, {message: 'product not found'})
        }

        const productQr = await findQrTrace({referenceItem: product._id, referenceType: 'product', producer: currentUser.organizationRoles!.organization._id})

        return response.ok(res, {...product, productQr})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateProductHandler = async (req: Request, res: Response) => {
    try {
        const productId = get(req, 'params.productId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const product = await findProduct({id: productId, deleted: false, producer: currentUser.organizationRoles!.organization._id})
        if(!product) {
            return response.notFound(res, {message: 'product not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== product.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to update this product"})
        }

        const body = req.body as any;
        const update: any = { ...body };

        const updated = await findAndUpdateProduct({_id: product._id}, update, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'update',
            description: `updated product ${product.name || 'unknown'}`,
            actor: userId,
            item: productId,
            requestPayload: update,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for product update', error);
        });

        return response.ok(res, {message: 'product updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteProductHandler = async (req: Request, res: Response) => {
    try {
        const productId = get(req, 'params.productId');
        const userId = get(req, 'user._id');
        
        const currentUser = await findUser({ _id: userId });
        if(!currentUser){
            return response.notFound(res, {message: "User not found"})
        }

        if(currentUser.userType !== 'producer') {
            return response.forbidden(res, {message: "You are not authorized to access this resource"})
        }

        const product = await findProduct({id: productId, deleted: false, producer: currentUser.organizationRoles!.organization._id})
        if(!product) {
            return response.notFound(res, {message: 'product not found'})
        }

        if(currentUser.organizationRoles!.organization._id.toString() !== product.producer.toString()) {
            return response.forbidden(res, {message: "You are not authorized to delete this product"})
        }
        let body = req.body


        const updated = await findAndUpdateProduct({_id: product._id}, {
            deleted: true,
            deleteReason: body.deleteReason,
            deletedBy: userId
        }, {new: true})

        // Enqueue audit log (non-blocking)
        enqueueAuditLog({
            actionType: 'delete',
            description: `deleted product ${product.name || 'unknown'}`,
            actor: userId,
            item: productId,
            requestPayload: body,
            responseObject: updated
        }).catch((error) => {
            log.error('Failed to enqueue audit log for product delete', error);
        });

        return response.ok(res, {message: 'product deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
