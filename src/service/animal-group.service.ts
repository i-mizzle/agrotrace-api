import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import AnimalGroup, { AnimalGroupDocument } from '../model/animal-group.model';

export async function createAnimalGroup(input: DocumentDefinition<AnimalGroupDocument>) {
    return AnimalGroup.create(input);
}

export async function findAnimalGroups(
    query: FilterQuery<AnimalGroupDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await AnimalGroup.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await AnimalGroup.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await AnimalGroup.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findAnimalGroup(
    query: FilterQuery<AnimalGroupDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return AnimalGroup.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateAnimalGroup(
    query: FilterQuery<AnimalGroupDocument>,
    update: UpdateQuery<AnimalGroupDocument>,
    options: QueryOptions
) {
    return AnimalGroup.findOneAndUpdate(query, update, options);
}

export async function deleteAnimalGroup(query: FilterQuery<AnimalGroupDocument>) {
    return AnimalGroup.deleteOne(query);
}