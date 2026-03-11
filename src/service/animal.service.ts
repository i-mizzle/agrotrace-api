import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Animal, { AnimalDocument } from '../model/animal.model';

export async function createAnimal(input: DocumentDefinition<AnimalDocument>) {
    return Animal.create(input);
}

export async function findAnimals(
    query: FilterQuery<AnimalDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Animal.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Animal.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Animal.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findAnimal(
    query: FilterQuery<AnimalDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Animal.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateAnimal(
    query: FilterQuery<AnimalDocument>,
    update: UpdateQuery<AnimalDocument>,
    options: QueryOptions
) {
    return Animal.findOneAndUpdate(query, update, options);
}

export async function deleteAnimal(query: FilterQuery<AnimalDocument>) {
    return Animal.deleteOne(query);
}