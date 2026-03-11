import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import ExporterUser, { ExporterUserDocument } from '../model/exporter-user.model';

export async function createExporterUser(input: DocumentDefinition<ExporterUserDocument>) {
    return ExporterUser.create(input);
}

export async function findExporterUsers(
    query: FilterQuery<ExporterUserDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await ExporterUser.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await ExporterUser.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await ExporterUser.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findExporterUser(
    query: FilterQuery<ExporterUserDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return ExporterUser.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateExporterUser(
    query: FilterQuery<ExporterUserDocument>,
    update: UpdateQuery<ExporterUserDocument>,
    options: QueryOptions
) {
    return ExporterUser.findOneAndUpdate(query, update, options);
}

export async function deleteExporterUser(query: FilterQuery<ExporterUserDocument>) {
    return ExporterUser.deleteOne(query);
}