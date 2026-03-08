import Bull from 'bull';
import { AuditLogDocument } from '../model/audit-log.model';
import { DocumentDefinition } from 'mongoose';

// Initialize the queue with Redis
const auditLogQueue = new Bull('auditLogQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Function to add an email job to the queue
export const sendAuditLogJob = (logData: DocumentDefinition<AuditLogDocument>) => {
    auditLogQueue.add(logData, {
        attempts: 5, // retry 3 times if job fails
        backoff: 10000, // wait 5 seconds before retrying
        removeOnComplete: 1000, // Keep the last 1000 completed jobs
        removeOnFail: 100, // Keep the last 100 failed jobs for review
    });
};

export default auditLogQueue;
