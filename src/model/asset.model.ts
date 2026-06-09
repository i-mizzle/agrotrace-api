import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

const assetStatuses = ['active', 'growing', 'ready-for-harvest', 'harvested', 'slaughtered', 'sold', 'transferred', 'lost', 'dead', 'closed']

export interface AssetDocument extends mongoose.Document {
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

const AssetSchema = new mongoose.Schema(
    {
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
    { timestamps: true }
);

const Asset = mongoose.model<AssetDocument>('Asset', AssetSchema);

export default Asset;