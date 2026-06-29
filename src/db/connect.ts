import mongoose from 'mongoose';
import config from 'config';
import log from '../logger';

async function connect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const dbUri = config.get('dbUri') as string;

    try {
        if (mongoose.connection.readyState === 2) {
            await new Promise<void>((resolve, reject) => {
                mongoose.connection.once('open', () => resolve());
                mongoose.connection.once('error', reject);
            });
            return mongoose.connection;
        }

        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Fix ensureIndex deprecation warning
        mongoose.set('useCreateIndex', true);

        log.info('database connected');
        return mongoose.connection;
    } catch (error) {
        log.error('db error', error);
        throw error;
    }
}

export { connect, mongoose };

// export default connect;
