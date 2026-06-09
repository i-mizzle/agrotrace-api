import { Request, Response, NextFunction, Express } from 'express';
import { get } from 'lodash';
import * as Sentry from '@sentry/node';
import log from '../logger';

/**
 * Middleware to capture Sentry transaction and user context
 * Add this EARLY in your middleware chain (after Sentry.init)
 */
export const sentryRequestHandler = (req: Request, _res: Response, next: NextFunction) => {
    setSentryUser(req);
    next();
};

/**
 * Error handler middleware for Sentry
 * Add this LAST in your middleware chain (before custom error handlers)
 */
export const sentryErrorHandler = Sentry.expressErrorHandler();

export const setupSentryErrorHandler = (app: Express) => {
    Sentry.setupExpressErrorHandler(app);
};

/**
 * Custom error handler to catch exceptions and send to Sentry
 * Use this for async error wrapping
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        Sentry.captureException(error, {
            contexts: {
                request: {
                    method: req.method,
                    url: req.url,
                    query: req.query,
                },
            },
            tags: {
                handler: fn.name || 'unknown',
                endpoint: `${req.method} ${req.route?.path || req.path}`,
            },
        });
        next(error);
    });
};

/**
 * Utility to attach user context to Sentry
 * Call this after user is authenticated
 */
export const setSentryUser = (req: Request) => {
    const user = get(req, 'user') as any;
    if (user) {
        Sentry.setUser({
            id: user._id?.toString(),
            email: user.email,
            username: user.name,
            ip_address: req.ip,
        });

        Sentry.setContext('user', {
            userType: user.userType,
            createdAt: user.createdAt,
        });
    }
};

/**
 * Utility to capture custom errors
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
    log.error('Capturing error in Sentry', { error: error.message, context });
    Sentry.captureException(error, {
        ...(context && { contexts: { custom: context } }),
    });
};

/**
 * Utility to add breadcrumb (log history)
 */
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
        message,
        level: 'info',
        data,
        timestamp: Date.now() / 1000,
    });
};
