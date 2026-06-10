import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { AssetEvents } from '../static/asset-events';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface EventDocument extends mongoose.Document {
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

const EventSchema = new mongoose.Schema(
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
        eventCategory: {
            type: String,
            enum: ['production', 'health', 'movement', 'processing', 'quality', 'export'],
            required: true
        },
        eventTypeCategory: {
            type: String,
            enum: AssetEvents.map(event => event.category),
            required: true 
        },
        eventType: {
            type: String,
            enum: AssetEvents.flatMap(e => e.types),
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        recordedOffline: {
            type: Boolean,
            default: false
        },
        notes: [
            {
                note: {
                    type: String
                },
                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ],
        attachments: [
            {
                type: String
            }
        ],
        quantityAffected: {
            type: Number
        },
        weightAffected: {
            type: Number
        },
        costEstimate: {
            type: Number
        },
        mortalityCount: {
            type: Number
        },
        nextDueDate: {
            type: Date
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(EventSchema);

const Event = mongoose.model<EventDocument>('Event', EventSchema);

export default Event;