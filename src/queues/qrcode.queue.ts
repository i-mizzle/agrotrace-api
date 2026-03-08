import Bull from 'bull';

// Initialize the queue with Redis
const qrCodeQueue = new Bull('qrCodeQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Function to add a slack message job to the queue
export const sendQrCodeJob = (messageData: { 
    tableId: string
    data: {
        tableUrl: string
        // businessFrontUrl: string
    } 
}) => {
    qrCodeQueue.add(messageData, {
        attempts: 5, // retry 3 times if job fails
        backoff: 10000, // wait 5 seconds before retrying
        removeOnComplete: 1000, // Keep the last 1000 completed jobs
        removeOnFail: 100, // Keep the last 100 failed jobs for review
    });
};

export default qrCodeQueue;
