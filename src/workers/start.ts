import dotenv from 'dotenv';
dotenv.config();

import { connect } from '../db/connect';

const startWorkers = async () => {
  await connect();

  await Promise.all([
    import('./email.worker'),
    import('./audit-log.worker'),
    import('./qr-code.worker'),
  ]);
};

startWorkers().catch((error) => {
  console.error('Failed to start workers', error);
  process.exit(1);
});
