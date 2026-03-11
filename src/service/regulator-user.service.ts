import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import RegulatorUser, { RegulatorUserDocument } from '../model/regulator-user.model';

export async function createRegulatorUser(input: DocumentDefinition<RegulatorUserDocument>) {
    return RegulatorUser.create(input);
}

export async function findRegulatorUsers(
    query: FilterQuery<RegulatorUserDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await RegulatorUser.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await RegulatorUser.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await RegulatorUser.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findRegulatorUser(
    query: FilterQuery<RegulatorUserDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return RegulatorUser.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateRegulatorUser(
    query: FilterQuery<RegulatorUserDocument>,
    update: UpdateQuery<RegulatorUserDocument>,
    options: QueryOptions
) {
    return RegulatorUser.findOneAndUpdate(query, update, options);
}

export async function deleteRegulatorUser(query: FilterQuery<RegulatorUserDocument>) {
    return RegulatorUser.deleteOne(query);
}