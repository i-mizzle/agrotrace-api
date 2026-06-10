import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

import log from '../logger';
import { connect, mongoose } from '../db/connect';
import Asset from '../model/asset.model';
import { generateUniquePublicId } from '../utils/public-id';

const runBackfill = async () => {
    await connect();

    try {
        const missingIdFilter: any = {
            $or: [{ id: { $exists: false } }, { id: null }, { id: '' }]
        };

        const assetsWithoutPublicId = await Asset.find(missingIdFilter)
            .select('_id id')
            .lean();

        if (assetsWithoutPublicId.length === 0) {
            log.info('No assets to backfill. All asset records already have public IDs.');
            return;
        }

        log.info(`Backfilling ${assetsWithoutPublicId.length} assets with public IDs...`);

        let updatedCount = 0;

        for (const asset of assetsWithoutPublicId) {
            const publicId = await generateUniquePublicId(Asset, 'Asset');

            const result = await Asset.collection.updateOne(
                { _id: asset._id, ...missingIdFilter },
                { $set: { id: publicId } }
            );

            if (result.modifiedCount > 0) {
                updatedCount += 1;
            }
        }

        log.info(`Completed asset public ID backfill. Updated ${updatedCount} assets.`);
    } catch (error: any) {
        log.error('Failed to backfill asset public IDs.', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

runBackfill();
