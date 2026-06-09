import * as Sentry from '@sentry/node';
import log from '../logger';

export const initializeSentry = () => {
    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || 'development';

    if (!dsn) {
        log.warn('Sentry DSN not provided. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn,
        environment,
        integrations: [
            Sentry.httpIntegration(),
            Sentry.expressIntegration(),
            Sentry.onUncaughtExceptionIntegration(),
            Sentry.onUnhandledRejectionIntegration(),
        ],
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        maxBreadcrumbs: 50,
        attachStacktrace: true,
        debug: environment !== 'production',
        release: process.env.APP_VERSION || '1.0.0',
        serverName: process.env.HOSTNAME || 'agrotrace-api',
        beforeSend(event, hint) {
            // Filter out certain errors you don't want to track
            if (event.exception) {
                const error = hint.originalException;

                // Don't send validation errors unless in production
                if (error instanceof Error && error.message?.includes('validation')) {
                    if (environment !== 'production') {
                        return null;
                    }
                }
            }

            return event;
        },
    });

    log.info('Sentry initialized successfully', {
        environment,
        dsn: dsn.substring(0, 20) + '***',
    });
};

export default Sentry;
