import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { applyPublicIdPlugin } from './plugins/public-id.plugin';
// import { BusinessDocument } from './business.model';

export interface AnimalDocument extends mongoose.Document {
    producer: mongoose.Schema.Types.ObjectId;
    asset: mongoose.Schema.Types.ObjectId;
    sex: 'male' | 'female';
    dateOfBirth: Date;
    idMethod?: 'ear-tag' | 'rfid' | 'visual';
    idNumber?: string;
    origin: 'born-on-farm' | 'purchased';
    acquisitionDate?: Date;
    weightAtRegistration?: string; //KG
    species: string;
    breed: string;
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
            enum: ['ear-tag', 'rfid', 'visual']
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
        species: {
            type: String,
            required: true
        },
        breed: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

applyPublicIdPlugin(AnimalSchema);

const Animal = mongoose.model<AnimalDocument>('Animal', AnimalSchema);

export default Animal;