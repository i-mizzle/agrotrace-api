import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { CropDocument } from './crop.model';
import { AnimalDocument } from './animal.model';
import { AnimalGroupDocument } from './animal-group.model';
import { LocationDocument } from './location.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

const assetStatuses = ['active', 'growing', 'ready-for-harvest', 'harvested', 'slaughtered', 'sold', 'transferred', 'lost', 'dead', 'closed']

export interface AssetDocument extends mongoose.Document {
    id?: string;
    name: string;
    producer: string;
    type: 'crop' | 'animal' | 'animal-group';
    crop?: CropDocument["_id"];
    animal?: AnimalDocument["_id"];
    animalGroup?: AnimalGroupDocument["_id"];
    // species: string;
    // breed: string;
    currentLocation: LocationDocument["_id"];
    ownershipStatus: 'owned' | 'contracted' | 'aggregated';
    status: typeof assetStatuses[number];
    statusHistory: {
        status: typeof assetStatuses[number];
        date: Date;
        changedBy: UserDocument["_id"];
    }[];
    deleted?: boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const AssetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        type: {
            type: String,
            enum: ['crop', 'animal', 'animal-group'],
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
        deleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

applyPublicIdPlugin(AssetSchema);

const Asset = mongoose.model<AssetDocument>('Asset', AssetSchema);

export default Asset;