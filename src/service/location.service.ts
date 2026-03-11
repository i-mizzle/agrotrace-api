import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Location, { LocationDocument } from '../model/location.model';

export async function createLocation(input: DocumentDefinition<LocationDocument>) {
    return Location.create(input);
}

export async function findLocations(
    query: FilterQuery<LocationDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Location.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Location.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Location.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findLocation(
    query: FilterQuery<LocationDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Location.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateLocation(
    query: FilterQuery<LocationDocument>,
    update: UpdateQuery<LocationDocument>,
    options: QueryOptions
) {
    return Location.findOneAndUpdate(query, update, options);
}

export async function deleteLocation(query: FilterQuery<LocationDocument>) {
    return Location.deleteOne(query);
}