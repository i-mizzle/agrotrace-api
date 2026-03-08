import cron from 'node-cron';
import log from "../logger";
import { mongoose } from '../db/connect';
import { exportCollections } from '../service/backup.service';


export const scheduleBackup = () => {
    // every friday at 3AM
    cron.schedule('0 3 * * 5', async () => {
        if (mongoose.connection.readyState === 1) {
            log.info('exporting backups...');
            await exportCollections().catch((error: any) => console.error(error));
        } else {
            log.warn('MongoDB connection is not ready for export job');
        }
    });

    log.info('weekly backups scheduled');
};

