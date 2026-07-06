import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface AnimalGroupDocument extends mongoose.Document {
    producer: mongoose.Schema.Types.ObjectId;
    asset: mongoose.Schema.Types.ObjectId;
    size: number;
    type: 'poultry' | 'fish' | 'goats' | 'cattle' | 'sheep' | 'others';
    species: string;
    breed: string;
    startDate: Date;
    expectedHarvestDate: Date;
    mortality?: {
        total: number;
        incidents: {
            count: number;
            reasonDescription: string;
            date: Date;
        }[];
    };
    feedTypes?: string[];
    deleted?: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const AnimalGroupSchema = new mongoose.Schema(
    {
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Asset',
        },
        size: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['poultry', 'fish', 'goats', 'cattle', 'sheep', 'others'],
            required: true
        },
        species: {
            type: String,
            required: true
        },
        breed: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        expectedHarvestDate: {
            type: Date,
            required: true
        },
        mortality: {
            total: {
                type: Number,
                default: 0
            },
            incidents: [
                {
                    count: {
                        type: Number
                    },
                    reasonDescription: {
                        type: String
                    },
                    date: {
                        type: Date
                    }
                }
            ]
        },
        feedTypes: [
            {
                type: String
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

applyPublicIdPlugin(AnimalGroupSchema);

const AnimalGroup = mongoose.model<AnimalGroupDocument>('AnimalGroup', AnimalGroupSchema);

export default AnimalGroup;