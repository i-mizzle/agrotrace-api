import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import ShipmentBatch, { ShipmentBatchDocument } from '../model/shipment-batch.model';

export async function createShipmentBatch(input: DocumentDefinition<ShipmentBatchDocument>) {
    return ShipmentBatch.create(input);
}

export async function findShipmentBatches(
    query: FilterQuery<ShipmentBatchDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await ShipmentBatch.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await ShipmentBatch.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await ShipmentBatch.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findShipmentBatch(
    query: FilterQuery<ShipmentBatchDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return ShipmentBatch.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateShipmentBatch(
    query: FilterQuery<ShipmentBatchDocument>,
    update: UpdateQuery<ShipmentBatchDocument>,
    options: QueryOptions
) {
    return ShipmentBatch.findOneAndUpdate(query, update, options);
}

export async function deleteShipmentBatch(query: FilterQuery<ShipmentBatchDocument>) {
    return ShipmentBatch.deleteOne(query);
}