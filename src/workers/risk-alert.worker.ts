import dotenv from 'dotenv';
dotenv.config();

import log from '../logger';
import riskAlertQueue from '../queues/risk-alert.queue';
import { createRiskAlert, getAlertWeight } from '../service/risk-alert.service';
import { RiskAlertType } from '../model/risk-alert.model';

log.info('risk-alert worker started. waiting for jobs...');

riskAlertQueue.process(async (job: any) => {
  try {
    const { producerId, alertType, severity, message, refId, refModel } = job.data;

    // Get weight for this alert
    const weight = getAlertWeight(alertType as RiskAlertType, severity);

    // Create the risk alert
    await createRiskAlert({
      producer: producerId,
      alertType,
      severity,
      weight,
      message,
      ref: refId,
      refModel,
    });

    log.info(`Risk alert created for producer ${producerId}: ${alertType} (${severity})`);
  } catch (error) {
    log.error(`Risk alert processing failed: `, error);
    throw error; // Allows Bull to handle retries
  }
});
