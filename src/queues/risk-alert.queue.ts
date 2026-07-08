import Bull from 'bull';

export interface RiskAlertJobData {
  producerId: string;
  alertType: string;
  severity: string;
  message: string;
  refId?: string;
  refModel?: string;
}

const riskAlertQueue = new Bull('riskAlertQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

export const enqueueRiskAlert = (jobData: RiskAlertJobData) => {
  return riskAlertQueue.add(jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: 1000,
    removeOnFail: 100,
  });
};

export default riskAlertQueue;
