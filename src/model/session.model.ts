import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import config from 'config';
import { UserDocument } from "./user.model";
// import { BusinessDocument } from './business.model';

export interface SessionDocument extends mongoose.Document {
    user: UserDocument['_id'];
    // business: BusinessDocument['_id']
    valid: boolean;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        },
        valid: {
            type: Boolean,
            default: true
        },
        // business: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Business'
        // },
        userAgent: {
            type: String
        }
    },
    { timestamps: true }
);

const Session = mongoose.model<SessionDocument>('Session', SessionSchema);

export default Session;