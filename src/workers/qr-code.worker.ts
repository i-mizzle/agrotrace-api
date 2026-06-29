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
    const qrCodeUrl = await generateAndUploadQRCode(job.data.traceId, job.data.data)

    log.info(`qr-code created for ${job.data.traceId}: ${qrCodeUrl}`);
  } catch (error) {
    const targetUrl = job.data?.data?.traceUrl ?? job.data?.traceUrl ?? 'unknown';
    log.error(`qr-code creation failed to send to ${targetUrl}: `, error);
    throw error; // Allows Bull to handle retries and logging
  }
});
