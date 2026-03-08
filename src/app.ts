import express from 'express';
import { createServer } from 'http';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
process.env["NODE_CONFIG_DIR"] =  path.join(__dirname, '..', 'config')
const config = require("config");

import log from "./logger";
import routes from './routes'
import { deserializeUser } from "./middleware";
import enableCors from './middleware/enableCors';

import { scheduleBackup } from './cron/backup.cron';
import { connect, mongoose } from './db/connect';
// import { schedulePromotionsStatusToggler } from './cron/promotion-status.cron';
import { subdomainParser } from './middleware/subdomainParser';
import { seedRoles } from './seeds/role.seed';
import { seedUsers } from './seeds/users.seed';
import { websocketService } from './service/websocket.service';

const port = config.get('port') as number;
const host = config.get('host') as string;

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(enableCors);
app.use(deserializeUser)
app.use(express.json({ limit: '75mb' }));
app.use(express.urlencoded({ limit: '75mb', extended: true }));
app.use(subdomainParser);

connect().then(() => {
    // Start the server and schedule the cron job after MongoDB is connected
    httpServer.listen(port, () => {
        log.info(`Server is listening at http://localhost:${port}`);
        
        // Initialize WebSocket server
        websocketService.initialize(httpServer);
        
        scheduleBackupWithRetries();
        // schedulePromotionsStatusToggler()
        routes(app);
    });

    // Schedule the cron job
}).catch(err => {
    log.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const maxRetries = 5; // Maximum number of retries for scheduling the cron job
const retryInterval = 5000; // Retry interval in milliseconds (5 seconds)

// Function to schedule the cron job with retries
const scheduleBackupWithRetries = (retries = 0) => {
    if (mongoose.connection.readyState === 1) {
        scheduleBackup();
        seedRoles()
        seedUsers()
    } else {
        if (retries < maxRetries) {
            log.warn(`Database not ready. Retrying to schedule backup in ${retryInterval / 1000} seconds...`);
            setTimeout(() => scheduleBackupWithRetries(retries + 1), retryInterval);
        } else {
            log.error('Max retries reached. Failed to schedule backups.');
        }
    }
};