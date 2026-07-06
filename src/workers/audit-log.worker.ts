import config from 'config';
import cron from 'node-cron';
import log from '../logger';
import { getAuditConnection } from '../db/audit-connect';
import auditLogQueue from '../queues/audit-log.queue';
import { appendAuditLog, verifyAuditChainIntegrity } from '../service/audit-log.service';

// Initialize the worker
(async () => {
    await getAuditConnection('writer');

    log.info('Audit log worker started. Waiting for jobs...');

    auditLogQueue.process(1, async (job: any) => {
        try {
            console.log('Audit log job received: ', job.data);
            await appendAuditLog(job.data);
            log.info(`Audit log created: ${JSON.stringify(job.data)}`);
        } catch (error) {
            log.error(`Audit log creation failed ${JSON.stringify(job.data)}: ${error}`);
            throw error; // Allows Bull to handle retries and logging
        }
    });

    const integritySchedule = config.get('auditIntegrity.schedule') as string;

    cron.schedule(integritySchedule, async () => {
        try {
            const integrity = await verifyAuditChainIntegrity();

            if (!integrity.valid) {
                const failedItemIds = Array.from(
                    new Set(
                        integrity.failures
                            .map((failure) => failure.itemId)
                            .filter((itemId): itemId is string => Boolean(itemId))
                    )
                );

                log.error('Audit integrity check failed', {
                    checkedRecords: integrity.checkedRecords,
                    errorCount: integrity.errors.length,
                    firstBrokenSequence: integrity.firstBrokenSequence,
                    failedItemIds,
                    brokenLinks: integrity.brokenLinks,
                    failures: integrity.failures,
                    errors: integrity.errors,
                });
                return;
            }

            log.info(`Audit integrity check passed for ${integrity.checkedRecords} records`);
        } catch (error) {
            log.error('Audit integrity check execution failed', error);
        }
    });

    log.info(`Audit integrity checks scheduled with cron: ${integritySchedule}`);
})();

