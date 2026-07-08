import { omit } from 'lodash';
import { DocumentDefinition, FilterQuery, ObjectId, QueryOptions, UpdateQuery } from 'mongoose';
import Notification, { NotificationDocument } from '../model/notification.model';
// import { applyPopulateWithUserSelect } from '../utils/populate';
// import { publishRealtimeEvent } from './integrations/realtime-redis';
// import { UserDocument } from '../model/user.model';
// import { NotificationTypes } from '../static/types';
import { NotificationItemModel } from '../model/notification.model';
import { UserDocument } from '../model/user.model';

// const NOTIFICATION_ITEM_MODEL_BY_TYPE: Partial<Record<NotificationTypes, NotificationItemModel>> = {
//     message: 'Message',
//     follow: 'Follow',
//     'follow-request': 'FollowRequest',
//     like: 'Like',
//     comment: 'UserPostComment',
//     mention: 'UserPostComment',
//     'community-invitation': 'CommunityInvitation',
//     'community-membership-request': 'CommunityMembershipRequest',
// };


export async function createNotification(input: DocumentDefinition<NotificationDocument>) {
    try {
        const notification = await Notification.create(input)

        // await publishRealtimeEvent('notification:new', {
        //     userId: String(notification.user),
        //     notification,
        // })

        return notification
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findNotification( query: FilterQuery<NotificationDocument>, expand?: string) {
    let q = Notification.findOne(query).lean();
    // q = applyPopulateWithUserSelect(q, expand);
    return q;
}

export async function findNotifications(
    query: FilterQuery<NotificationDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Notification.find(query).countDocuments()
    // const unread = await Notification.find({read: false}).countDocuments()
    let listQuery = Notification.find(query, {}, options).select('-password');
    // listQuery = applyPopulateWithUserSelect(listQuery, expand);
    const notifications = await listQuery
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        // unread,
        notifications
    }
}

export async function findAndUpdateNotification(
    query: FilterQuery<NotificationDocument>,
    update: UpdateQuery<NotificationDocument>,
    options: QueryOptions
) {
    try {
        const updatedNotification = await Notification.findOneAndUpdate(query, update, options)
        return updatedNotification;
    } catch (error:any ) {
        throw new Error(error)
    }
}

export async function findNotificationsForSync(
    userId: string,
    lastNotificationId?: string,
    limit = 100
) {
    const query: FilterQuery<NotificationDocument> = {
        user: userId,
        deleted: { $ne: true },
    }

    if (lastNotificationId) {
        query._id = { $gt: lastNotificationId as any }
    }

    return Notification.find(query)
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
}

export interface SendNotificationInterface {
    type: string
    title: string
    item?: ObjectId
    itemModel?: NotificationItemModel
    receiver: UserDocument['_id']
    message: string
    sender?: UserDocument['_id']
    holdPush?: boolean
}

export const createAndSendNotification = async (input: SendNotificationInterface) => {
    if (!input || !input.type || !input.receiver) {
        throw new Error('Invalid notification payload: "type" and "receiver" are required.')
    }
    
    const itemModel = input.itemModel // || NOTIFICATION_ITEM_MODEL_BY_TYPE[input.type];

    // Notification 
    const notification = await createNotification({
        type: input.type,
        user: input.receiver,
        item: input.item,
        itemModel,
        fromUser: input.sender
    });

    if(input.holdPush) return

    // sendPushNotificationJob({
    //     user: input.receiver,
    //     title: input.title,
    //     body: input.message,
    //     data: {
    //         type: input.type,
    //         notification,
    //     },
    // });
}
