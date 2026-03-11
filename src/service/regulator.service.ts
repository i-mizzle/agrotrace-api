import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { Regulator, RegulatorDocument } from '../model/regulator.model';

export async function createRegulator(input: DocumentDefinition<RegulatorDocument>) {
    return Regulator.create(input);
}

export async function findRegulators(
    query: FilterQuery<RegulatorDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Regulator.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Regulator.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Regulator.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findRegulator(
    query: FilterQuery<RegulatorDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Regulator.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateRegulator(
    query: FilterQuery<RegulatorDocument>,
    update: UpdateQuery<RegulatorDocument>,
    options: QueryOptions
) {
    return Regulator.findOneAndUpdate(query, update, options);
}

export async function deleteRegulator(query: FilterQuery<RegulatorDocument>) {
    return Regulator.deleteOne(query);
}