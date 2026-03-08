import mongoose from 'mongoose';
import log from '../logger';
import auditLogQueue from '../queues/audit-log.queue';
import connectToDatabase from './db-connect';
import { createAuditLog } from '../service/audit-log.service';

// Initialize the worker
(async () => {
    await connectToDatabase();

    log.info('Audit log worker started. Waiting for jobs...');

    auditLogQueue.process(async (job: any) => {
        try {
            console.log('Audit log job received: ', job.data);
            await createAuditLog(job.data); // Make sure this function uses the worker's Mongoose connection
            log.info(`Audit log created: ${JSON.stringify(job.data)}`);
        } catch (error) {
            log.error(`Audit log creation failed ${JSON.stringify(job.data)}: ${error}`);
            throw error; // Allows Bull to handle retries and logging
        }
    });
})();

