import mongoose, { Connection } from 'mongoose';
import config from 'config';
import log from '../logger';

export type AuditConnectionMode = 'reader' | 'writer';

const auditConnections: Partial<Record<AuditConnectionMode, Connection>> = {};

const getAuditDbUri = (mode: AuditConnectionMode): string => {
    const readerUri = config.get('auditDb.readerUri') as string;
    const writerUri = config.get('auditDb.writerUri') as string;

    return mode === 'writer' ? writerUri : readerUri;
};

export const getAuditConnection = async (mode: AuditConnectionMode): Promise<Connection> => {
    const existingConnection = auditConnections[mode];

    if (existingConnection && existingConnection.readyState === 1) {
        return existingConnection;
    }

    const uri = getAuditDbUri(mode);

    if (!uri) {
        throw new Error(`Missing audit database URI for mode: ${mode}`);
    }

    const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await new Promise<void>((resolve, reject) => {
        connection.once('open', () => resolve());
        connection.once('error', (error) => reject(error));
    });

    auditConnections[mode] = connection;

    connection.on('error', (error) => {
        log.error(`Audit DB (${mode}) connection error`, error);
    });

    log.info(`Audit DB (${mode}) connected`);

    return connection;
};
