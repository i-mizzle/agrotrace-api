import dotenv from 'dotenv';
dotenv.config();

import { connect } from '../db/connect';
import { retryAllFailedJobsOnStartup } from './retry-failed-jobs';

const startWorkers = async () => {
  await connect();

  await Promise.all([
    import('./email.worker'),
    import('./audit-log.worker'),
    import('./qr-code.worker'),
    import('./risk-alert.worker'),
  ]);

  // await retryAllFailedJobsOnStartup();
};

startWorkers().catch((error) => {
  console.error('Failed to start workers', error);
  process.exit(1);
});
