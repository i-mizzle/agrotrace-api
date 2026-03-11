import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import QrTrace, { QrTraceDocument } from '../model/qr-trace.model';

export async function createQrTrace(input: DocumentDefinition<QrTraceDocument>) {
    return QrTrace.create(input);
}

export async function findQrTraces(
    query: FilterQuery<QrTraceDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await QrTrace.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await QrTrace.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await QrTrace.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findQrTrace(
    query: FilterQuery<QrTraceDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return QrTrace.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateQrTrace(
    query: FilterQuery<QrTraceDocument>,
    update: UpdateQuery<QrTraceDocument>,
    options: QueryOptions
) {
    return QrTrace.findOneAndUpdate(query, update, options);
}

export async function deleteQrTrace(query: FilterQuery<QrTraceDocument>) {
    return QrTrace.deleteOne(query);
}