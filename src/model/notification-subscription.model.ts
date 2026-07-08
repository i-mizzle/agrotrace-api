import mongoose from 'mongoose';
import { UserDocument } from './user.model';

export interface NotificationSubscriptionDocument extends mongoose.Document {
    paused?: boolean
    types: Array<'message' | 'follow' | 'follow-request' | 'like' | 'comment' | 'system'>;
    user: UserDocument["_id"];
    createdAt?: Date;
    updatedAt?: Date;
}

const NotificationSubscriptionSchema = new mongoose.Schema(
    {
        paused: {
            type: Boolean,
            default: false
        },
        types: [{
            type: String,
            enum: ['message', 'follow', 'follow-request', 'like', 'comment', 'system'], 
            required: true,
        }],
        channels: [{
            type: String,
            enum: ['push', 'email', 'sms'], 
            required: true,
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,
        },
        
    },
    { timestamps: true }
);

const NotificationSubscription = mongoose.model<NotificationSubscriptionDocument>('NotificationSubscription', NotificationSubscriptionSchema)

export default NotificationSubscription;