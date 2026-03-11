import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import BatchAsset, { BatchAssetDocument } from '../model/batch-asset.model';

export async function createBatchAsset(input: DocumentDefinition<BatchAssetDocument>) {
    return BatchAsset.create(input);
}

export async function findBatchAssets(
    query: FilterQuery<BatchAssetDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await BatchAsset.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await BatchAsset.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await BatchAsset.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findBatchAsset(
    query: FilterQuery<BatchAssetDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return BatchAsset.findOne(query, {}, options).populate(expand);
}

export async function findAndUpdateBatchAsset(
    query: FilterQuery<BatchAssetDocument>,
    update: UpdateQuery<BatchAssetDocument>,
    options: QueryOptions
) {
    return BatchAsset.findOneAndUpdate(query, update, options);
}

export async function deleteBatchAsset(query: FilterQuery<BatchAssetDocument>) {
    return BatchAsset.deleteOne(query);
}