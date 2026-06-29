import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
import { ProducerDocument } from './producer.model';
// import { BusinessDocument } from './business.model';

export interface LocationDocument extends mongoose.Document {
    producer: ProducerDocument["_id"];
    name: string;
    type: 'farm' | 'processing-plant' | 'warehouse' | 'distribution-center' | 'retail-outlet' | 'other';
    latitude: number;
    longitude: number;
    state: string;
    lga: string;
    addressDescription: string;
    landSize?: number; // in hectares
    waterSourceType?: 'rain-fed' | 'borehole' | 'well' | 'river' | 'stream' | 'lake' | 'dam' | 'irrigation-canal' | 'municipal-supply' | 'harvested-rainwater' | 'pond' | 'other';
    soilType?: 'sandy' | 'loamy' | 'silty' | 'sandy-loam' | 'clay-loam' | 'silt-loam' | 'peaty' | 'chalky' | 'laterite' | 'organic' | 'mixed' | 'unknown' | 'other';
    deleted: boolean
    deleteReason?: string
    deletedBy?: UserDocument["_id"]
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const LocationSchema = new mongoose.Schema(
    {
        producer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producer',
            required: true
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        state: {
            type: String,
            required: true
        },
        lga: {
            type: String,
            required: true
        },
        addressDescription: {
            type: String,
            required: true
        },
        landSize: {
            type: Number // in hectares
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['farm', 'processing-plant', 'warehouse', 'distribution-center', 'retail-outlet', 'other'],
            required: true
        },
        waterSourceType: {
            type: String,
            enum: ['rain-fed', 'borehole', 'well', 'river', 'stream', 'lake', 'dam', 'irrigation-canal', 'municipal-supply', 'harvested-rainwater', 'pond', 'other']
        },
        soilType: {
            type: String,
            enum: ['sandy', 'loamy', 'silty', 'sandy-loam', 'clay-loam', 'silt-loam', 'peaty', 'chalky', 'laterite', 'organic', 'mixed', 'unknown', 'other']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deleteReason: {
            type: String
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(LocationSchema);

const Location = mongoose.model<LocationDocument>('Location', LocationSchema);

export default Location;