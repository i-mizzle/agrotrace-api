import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

export interface CropDocument extends mongoose.Document {
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

const Crop = mongoose.model<CropDocument>('Crop', CropSchema);

export default Crop;