import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Crop, { CropDocument } from '../model/crop.model';

export async function createCrop(input: DocumentDefinition<CropDocument>) {
    return Crop.create(input);
}

export async function findCrops(
    query: FilterQuery<CropDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Crop.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Crop.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Crop.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findCrop(
    query: FilterQuery<CropDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Crop.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateCrop(
    query: FilterQuery<CropDocument>,
    update: UpdateQuery<CropDocument>,
    options: QueryOptions
) {
    return Crop.findOneAndUpdate(query, update, options);
}

export async function deleteCrop(query: FilterQuery<CropDocument>) {
    return Crop.deleteOne(query);
}