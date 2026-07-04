import Bull from 'bull';
import log from '../logger';
import auditLogQueue from '../queues/audit-log.queue';
import emailQueue from '../queues/email.queue';
import qrCodeQueue from '../queues/qrcode.queue';

const retryFailedJobs = async (queue: Bull.Queue<any>) => {
  const failedJobs = await queue.getFailed();

  if (failedJobs.length === 0) {
    log.info(`No failed jobs found in ${queue.name}.`);
    return;
  }

  let retriedJobs = 0;

  for (const job of failedJobs) {
    try {
      await job.retry();
      retriedJobs += 1;
    } catch (error) {
      log.error(`Failed to retry job ${job.id} in ${queue.name}.`, error);
    }
  }

  log.info(`Retried ${retriedJobs} of ${failedJobs.length} failed jobs in ${queue.name}.`);
};

export const retryAllFailedJobsOnStartup = async () => {
  await Promise.all([
    retryFailedJobs(emailQueue),
    retryFailedJobs(auditLogQueue),
    retryFailedJobs(qrCodeQueue),
  ]);
};