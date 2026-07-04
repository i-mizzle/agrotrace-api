import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { AssetEvents } from '../static/asset-events';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
import { ProducerDocument } from './producer.model';
import { AssetDocument } from './asset.model';
import { LocationDocument } from './location.model';

export interface EventDocument extends mongoose.Document {
    producer: ProducerDocument['_id']
    asset: AssetDocument['_id']
    eventCategory: 'production' | 'health' | 'movement' | 'processing' | 'quality' | 'export';
    eventTypeCategory: string;
    newLocation?: LocationDocument['_id']
    eventType: string;
    date: Date;
    location: LocationDocument['_id'];
    performedBy: UserDocument["_id"];
    recordedOffline?: boolean;
    notes?: {
        note: string;
        createdBy: UserDocument["_id"];
    }[];
    attachments?: {
        type: 'image' | 'video' | 'document';
        url: string;
    }[];
    quantityAffected?: number;
    weightAffected?: number;
    costEstimate?: number;
    mortalityCount?: number;
    nextDueDate?: Date;
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
                type: {
                    type: String,
                    enum: ['image', 'video', 'document'],
                },
                url: {
                    type: String
                }
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
        newLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location'
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