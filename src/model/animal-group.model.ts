import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

export interface AnimalGroupDocument extends mongoose.Document {
    name: string;
    slug: string;
    description: string;
    permissions: string[]
    deleted: Boolean
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
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['poultry', 'fish', 'goats', 'cattle', 'others'],
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
                        type: String
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

const AnimalGroup = mongoose.model<AnimalGroupDocument>('AnimalGroup', AnimalGroupSchema);

export default AnimalGroup;