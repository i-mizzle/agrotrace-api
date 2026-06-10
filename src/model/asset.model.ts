import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { generateUniquePublicId } from '../utils/public-id';
// import { BusinessDocument } from './business.model';

const assetStatuses = ['active', 'growing', 'ready-for-harvest', 'harvested', 'slaughtered', 'sold', 'transferred', 'lost', 'dead', 'closed']

export interface AssetDocument extends mongoose.Document {
    id: string;
    name: string;
    slug: string;
    // bussiness: BusinessDocument["_id"]
    description: string;
    permissions: string[]
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const transformSerializedAsset = (_doc: any, ret: any) => {
    ret.publicId = ret.id;
    delete ret._id;
    delete ret.__v;

    return ret;
};

const AssetSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            index: true,
            immutable: true,
            required: true
        },
        assetCode: {
            type: String,
            required: true,
            unique: true
        },
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        type: {
            type: String,
            enum: ['crop', 'animal', 'animalGroup'],
            required: true
        },
        crop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop'
        },
        animal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Animal'
        },
        animalGroup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AnimalGroup'
        },
        species: {
            type: String,
            required: true
        },
        breed: {
            type: String,
            required: true
        },
        currentLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        ownershipStatus: {
            type: String,
            enum: ['owned', 'contracted', 'aggregated'],
            required: true
        },
        status: {
            type: String,
            enum: assetStatuses,
            default: 'active',
            required: true
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: assetStatuses
                },
                date: {
                    type: Date
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User',
                }
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
        id: false,
        toJSON: {
            virtuals: true,
            transform: transformSerializedAsset
        },
        toObject: {
            virtuals: true,
            transform: transformSerializedAsset
        }
    }
);

AssetSchema.pre('validate', async function (next: mongoose.HookNextFunction) {
    try {
        const asset = this as AssetDocument;

        if (!asset.id) {
            asset.id = await generateUniquePublicId(Asset, 'Asset');
        }

        return next();
    } catch (error: any) {
        return next(error);
    }
});

const Asset = mongoose.model<AssetDocument>('Asset', AssetSchema);

export default Asset;