import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface LocationDocument extends mongoose.Document {
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
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(LocationSchema);

const Location = mongoose.model<LocationDocument>('Location', LocationSchema);

export default Location;