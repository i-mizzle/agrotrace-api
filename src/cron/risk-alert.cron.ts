import cron from 'node-cron';
import log from '../logger';
import { mongoose } from '../db/connect';
import Batch from '../model/batch.model';
import Certification from '../model/certification.model';
import Producer from '../model/producer.model';
import RiskAlert from '../model/risk-alert.model';
import { enqueueRiskAlert } from '../queues/risk-alert.queue';

export const scheduleRiskAlerts = () => {
  // Daily check at 6 AM for expiring certifications and batches
  cron.schedule('0 6 * * *', async () => {
    if (mongoose.connection.readyState !== 1) {
      log.warn('MongoDB connection not ready for risk alert check');
      return;
    }

    try {
      await checkCertificationExpirations();
      await checkBatchExpirations();
    } catch (error) {
      log.error('Risk alert check failed:', error);
    }
  });

  log.info('Risk alert checks scheduled');
};

/**
 * Check for certifications expiring within 7 days or already expired
 */
async function checkCertificationExpirations() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Find expired certifications
  const expiredCerts = await Certification.find({
    expiry: { $lte: now },
  });

  for (const cert of expiredCerts) {
    // Check if alert already exists
    const existingAlert = await RiskAlert.findOne({
      refModel: 'Certification',
      ref: cert._id,
      alertType: 'certification_expired',
      status: { $ne: 'resolved' },
    });

    if (!existingAlert) {
      await enqueueRiskAlert({
        producerId: cert._id.toString(), // Link to producer via cert
        alertType: 'certification_expired',
        severity: 'high',
        message: `Certification ${cert.certificateNumber} has expired`,
        refId: cert._id.toString(),
        refModel: 'Certification',
      });
    }
  }

  // Find certifications expiring soon
  const expiringCerts = await Certification.find({
    expiry: { $gt: now, $lte: sevenDaysFromNow },
  });

  for (const cert of expiringCerts) {
    const existingAlert = await RiskAlert.findOne({
      refModel: 'Certification',
      ref: cert._id,
      alertType: 'certification_expiring',
      status: { $ne: 'resolved' },
    });

    if (!existingAlert) {
      await enqueueRiskAlert({
        producerId: cert._id.toString(),
        alertType: 'certification_expiring',
        severity: 'medium',
        message: `Certification ${cert.certificateNumber} expires in less than 7 days`,
        refId: cert._id.toString(),
        refModel: 'Certification',
      });
    }
  }
}

/**
 * Check for expired batches
 */
async function checkBatchExpirations() {
  const now = new Date();

  const expiredBatches = await Batch.find({
    expiryDate: { $lte: now },
    status: { $ne: 'closed' },
  });

  for (const batch of expiredBatches) {
    const existingAlert = await RiskAlert.findOne({
      refModel: 'Batch',
      ref: batch._id,
      alertType: 'batch_expired',
      status: { $ne: 'resolved' },
    });

    if (!existingAlert) {
      await enqueueRiskAlert({
        producerId: batch.producer.toString(),
        alertType: 'batch_expired',
        severity: 'high',
        message: `Batch ${batch.batchCode} has expired`,
        refId: batch._id.toString(),
        refModel: 'Batch',
      });
    }
  }
}
