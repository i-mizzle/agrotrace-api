import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
// import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { sendBackupsEmail } from './mailer.service';
import log from '../logger';

dotenv.config();

export async function getAllCollectionsData() {
    const collections = await mongoose.connection.db.collections();
    const data: { [collectionName: string]: any[] } = {};

    for (const collection of collections) {
        const collectionName = collection.collectionName;
        const collectionData = await collection.find({}).toArray();
        data[collectionName] = collectionData;
    }

    return data;
}

export const exportCollections = async () => {
    if (mongoose.connection.readyState !== 1) {
        log.warn('MongoDB connection is not ready');
        return;
    }

    try {
        const collectionsData = await getAllCollectionsData();
        const date = new Date().toISOString().slice(0, 10);
        const exportDir = path.join(__dirname, `../../exports/${date}`);

        // Delete the existing export directory if it exists
        if (fs.existsSync(exportDir)) {
            fs.rmSync(exportDir, { recursive: true, force: true });
            log.info(`Deleted existing export directory: ${exportDir}`);
        }

        // Recreate the export directory
        fs.mkdirSync(exportDir, { recursive: true });

        for (const [collectionName, data] of Object.entries(collectionsData)) {
            fs.writeFileSync(path.join(exportDir, `${collectionName}.json`), JSON.stringify(data, null, 2));
            log.info(`Exported ${collectionName}`);
        }

        await sendBackupsEmail({
            firstName: 'Immanuel',
            mailTo: 'immanuel.o.onum@gmail.com',
            exportDir
        });

    } catch (error) {
        log.error('Error exporting collections:', error);
    }
};

const deleteFiles = async (exportDir: string) => {
    const files = fs.readdirSync(exportDir);

    for (const file of files) {
        fs.unlinkSync(path.join(exportDir, file));
        console.log(`Deleted file: ${file}`);
    }

    fs.rmdirSync(exportDir);
    console.log(`Deleted directory: ${exportDir}`);
};

exportCollections().catch(error => console.error(error));
