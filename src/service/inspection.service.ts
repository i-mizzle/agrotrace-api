import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Inspection, { InspectionDocument } from '../model/inspection.model';

export async function createInspection(input: DocumentDefinition<InspectionDocument>) {
    return Inspection.create(input);
}

export async function findInspections(
    query: FilterQuery<InspectionDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Inspection.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Inspection.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Inspection.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findInspection(
    query: FilterQuery<InspectionDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Inspection.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateInspection(
    query: FilterQuery<InspectionDocument>,
    update: UpdateQuery<InspectionDocument>,
    options: QueryOptions
) {
    return Inspection.findOneAndUpdate(query, update, options);
}

export async function deleteInspection(query: FilterQuery<InspectionDocument>) {
    return Inspection.deleteOne(query);
}