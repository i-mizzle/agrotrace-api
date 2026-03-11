import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import InspectorUser, { InspectorUserDocument } from '../model/inspector-user.model';

export async function createInspectorUser(input: DocumentDefinition<InspectorUserDocument>) {
    return InspectorUser.create(input);
}

export async function findInspectorUsers(
    query: FilterQuery<InspectorUserDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await InspectorUser.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await InspectorUser.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await InspectorUser.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findInspectorUser(
    query: FilterQuery<InspectorUserDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return InspectorUser.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateInspectorUser(
    query: FilterQuery<InspectorUserDocument>,
    update: UpdateQuery<InspectorUserDocument>,
    options: QueryOptions
) {
    return InspectorUser.findOneAndUpdate(query, update, options);
}

export async function deleteInspectorUser(query: FilterQuery<InspectorUserDocument>) {
    return InspectorUser.deleteOne(query);
}