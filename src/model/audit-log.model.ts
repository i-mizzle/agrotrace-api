import mongoose, { Connection, Model, Schema } from 'mongoose';
import { getAuditConnection, AuditConnectionMode } from '../db/audit-connect';

export interface AuditLogDocument extends mongoose.Document {
    actionType: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'cancel' | 'reject';
    description: string;
    actor?: mongoose.Types.ObjectId;
    item?: mongoose.Types.ObjectId;
    requestPayload?: Record<string, unknown>;
    responseObject?: Record<string, unknown>;
    sequence: number;
    previousHash: string | null;
    hash: string;
    createdAt: Date;
}

const immutableField = { immutable: true, required: true };

const AuditLogSchema = new Schema(
    {
        actionType: {
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'approve', 'cancel', 'reject'],
            ...immutableField,
        },
        description: {
            type: String,
            trim: true,
            ...immutableField,
        },
        requestPayload: {
            type: Schema.Types.Mixed,
            immutable: true,
        },
        responseObject: {
            type: Schema.Types.Mixed,
            immutable: true,
        },
        actor: {
            type: Schema.Types.ObjectId,
            immutable: true,
        },
        item: {
            type: Schema.Types.ObjectId,
            immutable: true,
        },
        sequence: {
            type: Number,
            unique: true,
            index: true,
            ...immutableField,
        },
        previousHash: {
            type: String,
            default: null,
            immutable: true,
        },
        hash: {
            type: String,
            unique: true,
            index: true,
            ...immutableField,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

const rejectMutation = function(next: (error?: Error) => void) {
    next(new Error('Audit logs are append-only and cannot be modified or deleted'));
};

AuditLogSchema.pre('update', rejectMutation);
AuditLogSchema.pre('updateOne', rejectMutation);
AuditLogSchema.pre('updateMany', rejectMutation);
AuditLogSchema.pre('findOneAndUpdate', rejectMutation);
AuditLogSchema.pre('replaceOne', rejectMutation);
AuditLogSchema.pre('findOneAndReplace', rejectMutation);
AuditLogSchema.pre('deleteOne', rejectMutation);
AuditLogSchema.pre('deleteMany', rejectMutation);
AuditLogSchema.pre('findOneAndDelete', rejectMutation);
AuditLogSchema.pre('remove', rejectMutation);

const modelByConnection = new WeakMap<Connection, Model<AuditLogDocument>>();

export const getAuditLogModel = async (mode: AuditConnectionMode): Promise<Model<AuditLogDocument>> => {
    const connection = await getAuditConnection(mode);
    const existingModel = modelByConnection.get(connection);

    if (existingModel) {
        return existingModel;
    }

    const model = connection.model<AuditLogDocument>('AuditLog', AuditLogSchema);
    modelByConnection.set(connection, model);

    return model;
};