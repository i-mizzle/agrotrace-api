import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Shipment, { ShipmentDocument } from '../model/shipment.model';

export async function createShipment(input: DocumentDefinition<ShipmentDocument>) {
    return Shipment.create(input);
}

export async function findShipments(
    query: FilterQuery<ShipmentDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Shipment.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Shipment.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Shipment.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findShipment(
    query: FilterQuery<ShipmentDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Shipment.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateShipment(
    query: FilterQuery<ShipmentDocument>,
    update: UpdateQuery<ShipmentDocument>,
    options: QueryOptions
) {
    return Shipment.findOneAndUpdate(query, update, options);
}

export async function deleteShipment(query: FilterQuery<ShipmentDocument>) {
    return Shipment.deleteOne(query);
}