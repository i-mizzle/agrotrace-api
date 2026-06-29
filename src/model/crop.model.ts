import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface CropDocument extends mongoose.Document {
    species: string;
    breed: string;
    plantingDate: Date;
    season: 'wet' | 'dry' | 'perennial';
    expectedHarvestDate: Date;
    seedSource: string;
    irrigationSource?: string;
    fertilizersUsed?: string[];
    pesticidesUsed?: string[];
    producer: mongoose.Schema.Types.ObjectId;
    asset: mongoose.Schema.Types.ObjectId;
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const CropSchema = new mongoose.Schema(
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
        species: {
            type: String,
            required: true
        },
        breed: {
            type: String,
            required: true
        },
        plantingDate: {
            type: Date,
            required: true
        },
        season: {
            type: String,
            enum: ['wet', 'dry', 'perennial']
        },
        expectedHarvestDate: {
            type: Date,
            required: true
        },
        seedSource: {
            type: String,
            required: true
        },
        irrigationSource: {
            type: String
        },
        fertilizersUsed: [{
            type: String
        }],
        pesticidesUsed:[{
            type: String
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(CropSchema);

const Crop = mongoose.model<CropDocument>('Crop', CropSchema);

export default Crop;