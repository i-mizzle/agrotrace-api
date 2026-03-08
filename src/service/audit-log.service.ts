import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import AuditLog, { AuditLogDocument } from '../model/audit-log.model';

export async function createAuditLog (input: DocumentDefinition<AuditLogDocument>) {
    return AuditLog.create(input)
}

export async function findAuditLog(
    query: FilterQuery<AuditLogDocument>,
    options: QueryOptions = { lean: true }
) {
    return AuditLog.findOne(query, {}, options)
}

export async function findAuditLogs(
    query: FilterQuery<AuditLogDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await AuditLog.find(query, {}, options).countDocuments()
    const auditLogs = await AuditLog.find(query, {}, options).select('-body').populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);
    return {
        total,
        logs: auditLogs
    }
}

// export async function findAndUpdateBanner(
//     query: FilterQuery<AuditLogDocument>,
//     update: UpdateQuery<AuditLogDocument>,
//     options: QueryOptions
// ) {
//     return AuditLog.findOneAndUpdate(query, update, options)
// }

// export async function deleteBanner(
//     query: FilterQuery<AuditLogDocument>
// ) {
//     return AuditLog.deleteOne(query)
// }