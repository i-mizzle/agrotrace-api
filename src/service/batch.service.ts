import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Batch, { BatchDocument } from '../model/batch.model';

export async function createBatch(input: DocumentDefinition<BatchDocument>) {
    return Batch.create(input);
}

export async function findBatches(
    query: FilterQuery<BatchDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Batch.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Batch.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Batch.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findBatch(
    query: FilterQuery<BatchDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Batch.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateBatch(
    query: FilterQuery<BatchDocument>,
    update: UpdateQuery<BatchDocument>,
    options: QueryOptions
) {
    return Batch.findOneAndUpdate(query, update, options);
}

export async function deleteBatch(query: FilterQuery<BatchDocument>) {
    return Batch.deleteOne(query);
}