import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

import log from '../logger';
import { connect, mongoose } from '../db/connect';
import User from '../model/user.model';
import { generateUniquePublicId } from '../utils/public-id';

const runBackfill = async () => {
    await connect();

    try {
        const missingIdFilter: any = {
            $or: [{ id: { $exists: false } }, { id: null }, { id: '' }]
        };

        const usersWithoutPublicId = await User.find(missingIdFilter)
            .select('_id id')
            .lean();

        if (usersWithoutPublicId.length === 0) {
            log.info('No users to backfill. All user records already have public IDs.');
            return;
        }

        log.info(`Backfilling ${usersWithoutPublicId.length} users with public IDs...`);

        let updatedCount = 0;

        for (const user of usersWithoutPublicId) {
            const publicId = await generateUniquePublicId(User, 'User');

            const result = await User.collection.updateOne(
                { _id: user._id, ...missingIdFilter },
                { $set: { id: publicId } }
            );

            if (result.modifiedCount > 0) {
                updatedCount += 1;
            }
        }

        log.info(`Completed user public ID backfill. Updated ${updatedCount} users.`);
    } catch (error: any) {
        log.error('Failed to backfill user public IDs.', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

runBackfill();
