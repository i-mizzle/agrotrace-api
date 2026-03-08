import { Types } from 'mongoose';

export type AuditActionType = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'cancel' | 'reject';

export interface AuditLogPayload {
    actionType: AuditActionType;
    description: string;
    actor?: Types.ObjectId | string;
    item?: Types.ObjectId | string;
    requestPayload?: unknown;
    responseObject?: unknown;
}

export interface AuditIntegrityCheckResult {
    valid: boolean;
    checkedRecords: number;
    lastSequence: number;
    errors: string[];
}
