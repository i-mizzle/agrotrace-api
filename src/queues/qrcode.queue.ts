import Bull from 'bull';
import { ProducerDocument } from '../model/producer.model';
import { mongoose } from '../db/connect';

// Initialize the queue with Redis
const qrCodeQueue = new Bull('qrCodeQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Function to add a slack message job to the queue
export const sendQrCodeJob = (messageData: { 
    traceId: string
    data: {
        traceUrl: string
        referenceItem: mongoose.Schema.Types.ObjectId;
        producer: ProducerDocument["_id"]
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
