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
    failures: AuditIntegrityFailure[];
    brokenLinks: AuditIntegrityBrokenLink[];
    firstBrokenSequence: number | null;
}

export type AuditIntegrityFailureType =
    | 'sequence_mismatch'
    | 'previous_hash_mismatch'
    | 'hash_mismatch';

export interface AuditIntegrityFailure {
    type: AuditIntegrityFailureType;
    sequence: number;
    recordId: string;
    itemId: string | null;
    expected: string | number | null;
    actual: string | number | null;
    previousSequence: number | null;
    previousRecordId: string | null;
    message: string;
}

export interface AuditIntegrityBrokenLink {
    fromSequence: number | null;
    toSequence: number;
    fromRecordId: string | null;
    toRecordId: string;
    reason: Extract<AuditIntegrityFailureType, 'sequence_mismatch' | 'previous_hash_mismatch'>;
}
