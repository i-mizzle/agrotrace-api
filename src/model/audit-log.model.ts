import mongoose from 'mongoose';
import { UserDocument } from './user.model';

export interface AuditLogDocument extends mongoose.Document {
    actionType: string;
    description: string;
    actor: UserDocument["_id"];
    item?: any    
    requestPayload?: object
    responseObject?: object
    createdAt?: Date;
    updatedAt?: Date;
}

const AuditLogSchema = new mongoose.Schema(
    {
        actionType: {
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'approve', 'cancel', 'reject'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        requestPayload: {},
        responseObject: {},
        actor: {
            type:  mongoose.Schema.Types.ObjectId, 
            ref: 'User',
        },
        item: {
            type:  mongoose.Schema.Types.ObjectId, 
        },
    },
    { timestamps: true }
);

const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;