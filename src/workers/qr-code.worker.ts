import dotenv from 'dotenv'
dotenv.config()

import log from '../logger';
import qrCodeQueue from '../queues/qrcode.queue';
import { generateAndUploadQRCode } from '../service/qrcode.service';

log.info('qr-code worker started. waiting for jobs...')

// Process the email jobs from the queue
qrCodeQueue.process(async (job: any) => {
  try {
    console.log('.....................................................................')
    console.log('Processing QR job: ', job.id, job.data)
    const qrCodeUrl = await generateAndUploadQRCode(job.data.tableId, job.data.data)

    log.info(`qr-code created for ${job.data.tableId}: ${qrCodeUrl}`);
  } catch (error) {
    log.error(`qr-code creation failed to send to ${job.data.storeFrontUrl}: `, error);
    throw error; // Allows Bull to handle retries and logging
  }
});
