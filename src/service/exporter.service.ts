import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { Exporter, ExporterDocument } from '../model/exporter.model';

export async function createExporter(input: DocumentDefinition<ExporterDocument>) {
    return Exporter.create(input);
}

export async function findExporters(
    query: FilterQuery<ExporterDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Exporter.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Exporter.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Exporter.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findExporter(
    query: FilterQuery<ExporterDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Exporter.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateExporter(
    query: FilterQuery<ExporterDocument>,
    update: UpdateQuery<ExporterDocument>,
    options: QueryOptions
) {
    return Exporter.findOneAndUpdate(query, update, options);
}

export async function deleteExporter(query: FilterQuery<ExporterDocument>) {
    return Exporter.deleteOne(query);
}