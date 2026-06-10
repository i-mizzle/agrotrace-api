import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Asset, { AssetDocument } from '../model/asset.model';
import { resolvePublicIdToObjectId, resolvePublicIdsToObjectIds } from '../utils/public-id-resolver';

export async function createAsset(input: DocumentDefinition<AssetDocument>) {
    return Asset.create(input);
}

export async function findAssets(
    query: FilterQuery<AssetDocument>,
    perPage: number,
    page: number,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    const total = await Asset.find(query, {}, options).countDocuments();
    let data = null;

    if (perPage === 0 && page === 0) {
        data = await Asset.find(query, {}, options).populate(expand).sort({ createdAt: -1 });
    } else {
        data = await Asset.find(query, {}, options)
            .populate(expand)
            .sort({ createdAt: -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return { total, data };
}

export async function findAsset(
    query: FilterQuery<AssetDocument>,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return Asset.findOne(query, {}, options).populate(expand);
}

export async function findAssetByPublicId(
    publicId: string,
    expand?: string | string[],
    options: QueryOptions = { lean: true }
) {
    return findAsset({ id: publicId }, expand, options);
}

export async function resolveAssetPublicIdToObjectId(
    publicId: string,
    throwOnMissing = true
) {
    return resolvePublicIdToObjectId(Asset, publicId, { throwOnMissing });
}

export async function resolveAssetPublicIdsToObjectIds(
    publicIds: string[],
    throwOnMissing = true
) {
    return resolvePublicIdsToObjectIds(Asset, publicIds, { throwOnMissing });
}

export async function findAndUpdateAsset(
    query: FilterQuery<AssetDocument>,
    update: UpdateQuery<AssetDocument>,
    options: QueryOptions
) {
    return Asset.findOneAndUpdate(query, update, options);
}

export async function deleteAsset(query: FilterQuery<AssetDocument>) {
    return Asset.deleteOne(query);
}