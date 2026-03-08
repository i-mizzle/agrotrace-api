import Bull from 'bull';

// Initialize the queue with Redis
const emailQueue = new Bull('emailQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Function to add an email job to the queue
export const sendEmailJob = (emailData: { action: string; data: any }) => {
    emailQueue.add(emailData, {
        attempts: 5, // retry 3 times if job fails
        backoff: 10000, // wait 5 seconds before retrying
        removeOnComplete: 1000, // Keep the last 1000 completed jobs
        removeOnFail: 100, // Keep the last 100 failed jobs for review
    });
};

export default emailQueue;
