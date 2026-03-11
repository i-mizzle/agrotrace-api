import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Producer, { ProducerDocument } from '../model/producer.model';

export async function createProducer(input: DocumentDefinition<ProducerDocument>) {
    return Producer.create(input);
}

export async function findProducers(
    query: FilterQuery<ProducerDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Producer.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Producer.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Producer.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findProducer(
    query: FilterQuery<ProducerDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Producer.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateProducer(
    query: FilterQuery<ProducerDocument>,
    update: UpdateQuery<ProducerDocument>,
    options: QueryOptions
) {
    return Producer.findOneAndUpdate(query, update, options);
}

export async function deleteProducer(query: FilterQuery<ProducerDocument>) {
    return Producer.deleteOne(query);
}