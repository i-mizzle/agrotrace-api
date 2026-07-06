import crypto from 'crypto';
import config from 'config';
import { FilterQuery, QueryOptions } from 'mongoose';
import { getAuditLogModel, AuditLogDocument } from '../model/audit-log.model';
import { AuditIntegrityCheckResult, AuditLogPayload } from '../types/audit-log';

const hashSecret = (config.get('auditIntegrity.hashSecret') as string) || 'audit-hash-secret-not-set';

const toCanonicalJson = (value: unknown): string => {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => toCanonicalJson(item)).join(',')}]`;
    }

    const objectValue = value as Record<string, unknown>;
    const sortedKeys = Object.keys(objectValue).sort();
    const properties = sortedKeys.map((key) => `${JSON.stringify(key)}:${toCanonicalJson(objectValue[key])}`);
    return `{${properties.join(',')}}`;
};

const buildAuditHash = (input: {
    sequence: number;
    previousHash: string | null;
    actionType: string;
    description: string;
    actor?: string;
    item?: string;
    requestPayload?: unknown;
    responseObject?: unknown;
    createdAt: Date;
}): string => {
    const digestPayload = {
        v: 1,
        sequence: input.sequence,
        previousHash: input.previousHash,
        actionType: input.actionType,
        description: input.description,
        actor: input.actor || null,
        item: input.item || null,
        requestPayload: input.requestPayload || null,
        responseObject: input.responseObject || null,
        createdAt: input.createdAt.toISOString(),
    };

    return crypto
        .createHmac('sha256', hashSecret)
        .update(toCanonicalJson(digestPayload))
        .digest('hex');
};

export async function appendAuditLog(payload: AuditLogPayload) {
    const AuditLogReader = await getAuditLogModel('reader');
    const AuditLogWriter = await getAuditLogModel('writer');
    const lastLog = await AuditLogReader.findOne({}, {}, { lean: true }).sort({ sequence: -1 });

    const sequence = (lastLog?.sequence || 0) + 1;
    const previousHash = lastLog?.hash || null;
    const createdAt = new Date();

    const hash = buildAuditHash({
        sequence,
        previousHash,
        actionType: payload.actionType,
        description: payload.description,
        actor: payload.actor ? String(payload.actor) : undefined,
        item: payload.item ? String(payload.item) : undefined,
        requestPayload: payload.requestPayload,
        responseObject: payload.responseObject,
        createdAt,
    });

    return AuditLogWriter.create({
        ...payload,
        sequence,
        previousHash,
        hash,
        createdAt,
    });
}

export async function findAuditLog(
    query: FilterQuery<AuditLogDocument>,
    options: QueryOptions = { lean: true }
) {
    const AuditLog = await getAuditLogModel('reader');
    return AuditLog.findOne(query, {}, options);
}

export async function findAuditLogs(
    query: FilterQuery<AuditLogDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const AuditLog = await getAuditLogModel('reader');
    const total = await AuditLog.find(query, {}, options).countDocuments();
    const auditLogs = await AuditLog.find(query, {}, options)
        .select('-__v')
        .populate(expand)
        .sort({ createdAt: -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);

    return {
        total,
        logs: auditLogs,
    };
}

export async function verifyAuditChainIntegrity(): Promise<AuditIntegrityCheckResult> {
    const AuditLog = await getAuditLogModel('reader');
    const logs = await AuditLog.find({}, {}, { lean: true }).sort({ sequence: 1 });
    const errors: string[] = [];
    const failures: AuditIntegrityCheckResult['failures'] = [];
    const brokenLinks: AuditIntegrityCheckResult['brokenLinks'] = [];

    let expectedSequence = 1;
    let previousHash: string | null = null;
    let previousRecordId: string | null = null;
    let firstBrokenSequence: number | null = null;

    for (const log of logs) {
        const recordId = String(log._id);
        const itemId = log.item ? String(log.item) : null;

        if (log.sequence !== expectedSequence) {
            const message = `Sequence mismatch at record ${recordId}: expected ${expectedSequence}, got ${log.sequence}`;
            errors.push(message);
            failures.push({
                type: 'sequence_mismatch',
                sequence: log.sequence,
                recordId,
                itemId,
                expected: expectedSequence,
                actual: log.sequence,
                previousSequence: expectedSequence - 1,
                previousRecordId,
                message,
            });
            brokenLinks.push({
                fromSequence: expectedSequence - 1,
                toSequence: log.sequence,
                fromRecordId: previousRecordId,
                toRecordId: recordId,
                reason: 'sequence_mismatch',
            });

            if (firstBrokenSequence === null) {
                firstBrokenSequence = log.sequence;
            }
        }

        if ((log.previousHash || null) !== previousHash) {
            const message = `Previous hash mismatch at sequence ${log.sequence}`;
            errors.push(message);
            failures.push({
                type: 'previous_hash_mismatch',
                sequence: log.sequence,
                recordId,
                itemId,
                expected: previousHash,
                actual: log.previousHash || null,
                previousSequence: expectedSequence - 1,
                previousRecordId,
                message,
            });
            brokenLinks.push({
                fromSequence: expectedSequence - 1,
                toSequence: log.sequence,
                fromRecordId: previousRecordId,
                toRecordId: recordId,
                reason: 'previous_hash_mismatch',
            });

            if (firstBrokenSequence === null) {
                firstBrokenSequence = log.sequence;
            }
        }

        const computedHash = buildAuditHash({
            sequence: log.sequence,
            previousHash: log.previousHash || null,
            actionType: log.actionType,
            description: log.description,
            actor: log.actor ? String(log.actor) : undefined,
            item: log.item ? String(log.item) : undefined,
            requestPayload: log.requestPayload,
            responseObject: log.responseObject,
            createdAt: new Date(log.createdAt),
        });

        if (computedHash !== log.hash) {
            const message = `Hash mismatch at sequence ${log.sequence}`;
            errors.push(message);
            failures.push({
                type: 'hash_mismatch',
                sequence: log.sequence,
                recordId,
                itemId,
                expected: computedHash,
                actual: log.hash,
                previousSequence: expectedSequence - 1,
                previousRecordId,
                message,
            });

            if (firstBrokenSequence === null) {
                firstBrokenSequence = log.sequence;
            }
        }

        expectedSequence += 1;
        previousHash = log.hash;
        previousRecordId = recordId;
    }

    return {
        valid: errors.length === 0,
        checkedRecords: logs.length,
        lastSequence: logs.length === 0 ? 0 : logs[logs.length - 1].sequence,
        errors,
        failures,
        brokenLinks,
        firstBrokenSequence,
    };
}