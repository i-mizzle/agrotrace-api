import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import ProducerUser, { ProducerUserDocument } from '../model/producer-user.model';

export async function createProducerUser(input: DocumentDefinition<ProducerUserDocument>) {
    return ProducerUser.create(input);
}

export async function findProducerUsers(
    query: FilterQuery<ProducerUserDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await ProducerUser.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await ProducerUser.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await ProducerUser.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findProducerUser(
    query: FilterQuery<ProducerUserDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return ProducerUser.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateProducerUser(
    query: FilterQuery<ProducerUserDocument>,
    update: UpdateQuery<ProducerUserDocument>,
    options: QueryOptions
) {
    return ProducerUser.findOneAndUpdate(query, update, options);
}

export async function deleteProducerUser(query: FilterQuery<ProducerUserDocument>) {
    return ProducerUser.deleteOne(query);
}