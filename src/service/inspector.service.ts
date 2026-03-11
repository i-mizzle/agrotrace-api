import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Inspector, { InspectorDocument } from '../model/inspector.model';

export async function createInspector(input: DocumentDefinition<InspectorDocument>) {
    return Inspector.create(input);
}

export async function findInspectors(
    query: FilterQuery<InspectorDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Inspector.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Inspector.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Inspector.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findInspector(
    query: FilterQuery<InspectorDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Inspector.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateInspector(
    query: FilterQuery<InspectorDocument>,
    update: UpdateQuery<InspectorDocument>,
    options: QueryOptions
) {
    return Inspector.findOneAndUpdate(query, update, options);
}

export async function deleteInspector(query: FilterQuery<InspectorDocument>) {
    return Inspector.deleteOne(query);
}