import mongoose from 'mongoose';
import { generateUniquePublicId } from '../../utils/public-id';

const transformWithPublicId = (_doc: any, ret: any) => {
    ret.publicId = ret.id;
    delete ret._id;
    delete ret.__v;

    return ret;
};

const mergeTransform = (existingTransform?: (doc: any, ret: any, options: any) => any) => {
    return (doc: any, ret: any, options: any) => {
        const transformed = existingTransform ? existingTransform(doc, ret, options) || ret : ret;
        return transformWithPublicId(doc, transformed);
    };
};

export const applyPublicIdPlugin = (schema: mongoose.Schema<any>) => {
    if (!schema.path('id')) {
        schema.add({
            id: {
                type: String,
                immutable: true,
                required: true
            }
        });
    }

    schema.index(
        { id: 1 },
        {
            unique: true,
            partialFilterExpression: {
                id: { $type: 'string' }
            }
        }
    );

    schema.set('id', false);

    const existingToJSON = schema.get('toJSON') || {};
    schema.set('toJSON', {
        ...existingToJSON,
        virtuals: true,
        transform: mergeTransform(existingToJSON.transform)
    });

    const existingToObject = schema.get('toObject') || {};
    schema.set('toObject', {
        ...existingToObject,
        virtuals: true,
        transform: mergeTransform(existingToObject.transform)
    });

    schema.pre('validate', async function (next: mongoose.HookNextFunction) {
        try {
            const document = this as any;

            if (!document.id) {
                const model = document.constructor as mongoose.Model<any>;
                document.id = await generateUniquePublicId(model, model.modelName);
            }

            return next();
        } catch (error: any) {
            return next(error);
        }
    });
};
