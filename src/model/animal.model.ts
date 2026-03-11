import mongoose from 'mongoose';
import { UserDocument } from './user.model';
// import { BusinessDocument } from './business.model';

export interface AnimalDocument extends mongoose.Document {
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

const AnimalSchema = new mongoose.Schema(
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
        sex: {
            type: String,
            enum: ['male', 'female'],
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        idMethod: {
            type: String,
            enum: ['ear-tag', 'rfid', 'visual'],
            required: true
        },
        idNumber: {
            type: String
        },
        origin: {
            type: String,
            enum: ['born-on-farm', 'purchased'],
            required: true
        },
        acquisitionDate: {
            type: Date
        },
        weightAtRegistration: { //KG
            type: String
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

const Animal = mongoose.model<AnimalDocument>('Animal', AnimalSchema);

export default Animal;