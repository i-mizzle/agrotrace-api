import mongoose, { Document, Model } from 'mongoose';

export interface ResolvePublicIdsResult<T extends Document> {
    objectIds: mongoose.Types.ObjectId[];
    idMap: Map<string, mongoose.Types.ObjectId>;
    documents: T[];
    missingPublicIds: string[];
}

export interface ResolvePublicIdsOptions {
    fieldName?: string;
    throwOnMissing?: boolean;
}

export const resolvePublicIdsToObjectIds = async <T extends Document>(
    model: Model<T>,
    publicIds: string[],
    options: ResolvePublicIdsOptions = {}
): Promise<ResolvePublicIdsResult<T>> => {
    const fieldName = options.fieldName || 'id';
    const throwOnMissing = Boolean(options.throwOnMissing);

    const normalizedIds = Array.from(
        new Set(
            publicIds
                .filter(Boolean)
                .map((value) => value.trim())
                .filter((value) => value.length > 0)
        )
    );

    if (normalizedIds.length === 0) {
        return {
            objectIds: [],
            idMap: new Map<string, mongoose.Types.ObjectId>(),
            documents: [],
            missingPublicIds: []
        };
    }

    const documents = await model
        .find({ [fieldName]: { $in: normalizedIds } } as any)
        .select(`_id ${fieldName}`);

    const idMap = new Map<string, mongoose.Types.ObjectId>();

    documents.forEach((document: any) => {
        idMap.set(document[fieldName], document._id);
    });

    const missingPublicIds = normalizedIds.filter((publicId) => !idMap.has(publicId));

    if (throwOnMissing && missingPublicIds.length > 0) {
        throw new Error(`Could not resolve the following public IDs: ${missingPublicIds.join(', ')}`);
    }

    return {
        objectIds: Array.from(idMap.values()),
        idMap,
        documents,
        missingPublicIds
    };
};

export const resolvePublicIdToObjectId = async <T extends Document>(
    model: Model<T>,
    publicId: string,
    options: ResolvePublicIdsOptions = {}
): Promise<mongoose.Types.ObjectId | null> => {
    const result = await resolvePublicIdsToObjectIds(model, [publicId], options);

    if (result.objectIds.length === 0) {
        return null;
    }

    return result.objectIds[0];
};
