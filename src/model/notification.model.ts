import mongoose from 'mongoose';
import { UserDocument } from './user.model';
import { EventDocument } from './event.model';

export type NotificationItemModel =
    | 'Event'
    | 'Follow'
    | 'FollowRequest'
    | 'Like'
    | 'UserPostComment'
    | 'UserStory'
    | 'CommunityInvitation'
    | 'CommunityMembership'
    | 'CommunityMembershipRequest';

export interface NotificationDocument extends mongoose.Document {
    type: string;
    user: UserDocument["_id"];
    fromUser?: UserDocument['_id']
    item: EventDocument['_id']
    itemModel?: NotificationItemModel
    read?: boolean
    deleted?: boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['message', 'system', 'risk-alert' ], 
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'itemModel'
        },
        itemModel: {
            type: String,
            enum: ['Event'],
            default: 'Event'
        },
        message: {
            type: String
        },
        read: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema)

export default Notification;