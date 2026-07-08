import { Request, Response } from 'express';
import * as response from '../responses';
import { get } from 'lodash';
import log from '../logger';
import { enqueueAuditLog } from '../queues/audit-log.queue';
import { findUser } from '../service/user.service';
import {
  findRiskAlerts,
  findRiskAlert,
  acknowledgeRiskAlert,
  resolveRiskAlert,
} from '../service/risk-alert.service';
import Producer from '../model/producer.model';

/**
 * Parse query filters for risk alert listing
 */
const parseRiskAlertFilters = (query: any) => {
  const { status, alertType, severity, producer } = query;

  const filters: any = {};

  if (status) {
    filters.status = status;
  }

  if (alertType) {
    filters.alertType = alertType;
  }

  if (severity) {
    filters.severity = severity;
  }

  if (producer) {
    filters.producer = producer;
  }

  return filters;
};

/**
 * Get all risk alerts for the current user's producer
 * Pagination: ?page=1&perPage=10
 * Filters: ?status=open&alertType=inspection_fail&severity=high
 */
export const getRiskAlertsHandler = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'user._id');
    const { page = 1, perPage = 10 } = req.query;

    const currentUser = await findUser({ _id: userId });
    if (!currentUser) {
      return response.notFound(res, { message: 'User not found' });
    }

    const producerId = currentUser.organizationRoles?.organization._id;
    if (!producerId) {
      return response.forbidden(
        res,
        { message: 'User not associated with a producer organization' }
      );
    }

    // Parse filters and add producer restriction
    const filters = parseRiskAlertFilters(req.query);
    filters.producer = producerId;

    const { total, data } = await findRiskAlerts(
      filters,
      parseInt(perPage as string),
      parseInt(page as string)
    );

    res.json({
      total,
      page: parseInt(page as string),
      perPage: parseInt(perPage as string),
      data,
    });
  } catch (error: any) {
    log.error('Failed to fetch risk alerts:', error);
    return response.error(res, error);
  }
};

/**
 * Get a single risk alert by ID
 * Verify that the alert belongs to the current user's producer
 */
export const getRiskAlertHandler = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'user._id');
    const { alertId } = req.params;

    const currentUser = await findUser({ _id: userId });
    if (!currentUser) {
      return response.notFound(res, { message: 'User not found' });
    }

    const producerId = currentUser.organizationRoles?.organization._id;
    if (!producerId) {
      return response.forbidden(
        res,
        { message: 'User not associated with a producer organization' }
      );
    }

    const alert = await findRiskAlert({
      _id: alertId,
      producer: producerId,
    });

    if (!alert) {
      return response.notFound(res, { message: 'Risk alert not found' });
    }

    res.json(alert);
  } catch (error: any) {
    log.error('Failed to fetch risk alert:', error);
    return response.error(res, error);
  }
};

/**
 * Acknowledge a risk alert (mark as seen but still open)
 * User must have permission on the producer this alert belongs to
 */
export const acknowledgeRiskAlertHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = get(req, 'user._id');
    const alertId = req.params.alertId;

    if (!alertId || !userId) {
      return response.badRequest(res, { message: 'Invalid request parameters' });
    }

    const currentUser = await findUser({ _id: userId });
    if (!currentUser) {
      return response.notFound(res, { message: 'User not found' });
    }

    const producerId = currentUser.organizationRoles?.organization._id;
    if (!producerId) {
      return response.forbidden(
        res,
        { message: 'User not associated with a producer organization' }
      );
    }

    // Verify alert belongs to this producer
    const alert = await findRiskAlert({
      _id: alertId,
      producer: producerId,
    });

    if (!alert) {
      return response.notFound(res, { message: 'Risk alert not found' });
    }

    // Only allow acknowledging open alerts
    if (alert.status !== 'open') {
      return response.badRequest(
        res,
        {
          message: `Cannot acknowledge alert with status: ${alert.status}`,
        }
      );
    }

    const updatedAlert = await acknowledgeRiskAlert(String(alertId), String(userId));

    // Enqueue audit log
    enqueueAuditLog({
      actionType: 'update',
      description: `acknowledged risk alert: ${alert.alertType} (${alert.severity})`,
      actor: userId,
      item: alertId,
      requestPayload: { action: 'acknowledge' },
      responseObject: updatedAlert,
    }).catch((error) => {
      log.error('Failed to enqueue audit log for alert acknowledgment', error);
    });

    res.json({
      message: 'Risk alert acknowledged',
      alert: updatedAlert,
    });
  } catch (error: any) {
    log.error('Failed to acknowledge risk alert:', error);
    return response.error(res, error);
  }
};

/**
 * Resolve a risk alert (mark as complete/handled)
 * User must have permission on the producer this alert belongs to
 */
export const resolveRiskAlertHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = get(req, 'user._id');
    const alertId = req.params.alertId;
    const { resolutionNotes } = req.body;

    if (!alertId || !userId) {
      return response.badRequest(res, { message: 'Invalid request parameters' });
    }

    const currentUser = await findUser({ _id: userId });
    if (!currentUser) {
      return response.notFound(res, { message: 'User not found' });
    }

    const producerId = currentUser.organizationRoles?.organization._id;
    if (!producerId) {
      return response.forbidden(
        res,
        { message: 'User not associated with a producer organization' }
      );
    }

    // Verify alert belongs to this producer
    const alert = await findRiskAlert({
      _id: alertId,
      producer: producerId,
    });

    if (!alert) {
      return response.notFound(res, { message: 'Risk alert not found' });
    }

    // Cannot resolve already resolved alerts
    if (alert.status === 'resolved') {
      return response.badRequest(
        res,
        { message: 'Alert is already resolved' }
      );
    }

    const updatedAlert = await resolveRiskAlert(String(alertId), String(userId));

    // Enqueue audit log with optional resolution notes
    enqueueAuditLog({
      actionType: 'update',
      description: `resolved risk alert: ${alert.alertType} (${alert.severity})`,
      actor: userId,
      item: alertId,
      requestPayload: {
        action: 'resolve',
        resolutionNotes: resolutionNotes || '',
      },
      responseObject: updatedAlert,
    }).catch((error) => {
      log.error('Failed to enqueue audit log for alert resolution', error);
    });

    res.json({
      message: 'Risk alert resolved',
      alert: updatedAlert,
    });
  } catch (error: any) {
    log.error('Failed to resolve risk alert:', error);
    return response.error(res, error);
  }
};

/**
 * Get producer risk profile (score, level, open alerts count)
 * User must belong to the target producer's organization
 */
export const getProducerRiskProfileHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = get(req, 'user._id');
    const { producerId } = req.params;

    const currentUser = await findUser({ _id: userId });
    if (!currentUser) {
      return response.notFound(res, { message: 'User not found' });
    }

    const userProducerId = currentUser.organizationRoles?.organization._id;
    if (!userProducerId) {
      return response.forbidden(
        res,
        { message: 'User not associated with a producer organization' }
      );
    }

    // Verify the requested producer matches user's organization
    if (producerId && userProducerId.toString() !== producerId) {
      return response.forbidden(
        res,
        { message: 'Unauthorized to access this producer' }
      );
    }

    const producer = await Producer.findById(
      producerId || userProducerId
    ).select('name riskScore riskLevel');

    if (!producer) {
      return response.notFound(res, { message: 'Producer not found' });
    }

    // Get alert summary
    const { total: openCount } = await findRiskAlerts(
      {
        producer: producer._id,
        status: 'open',
      },
      0,
      1
    );

    const { total: acknowledgedCount } = await findRiskAlerts(
      {
        producer: producer._id,
        status: 'acknowledged',
      },
      0,
      1
    );

    // Get recent open/acknowledged alerts
    const { data: recentAlerts } = await findRiskAlerts(
      {
        producer: producer._id,
        status: { $in: ['open', 'acknowledged'] },
      },
      5,
      1
    );

    res.json({
      producer,
      alertSummary: {
        open: openCount,
        acknowledged: acknowledgedCount,
        total: openCount + acknowledgedCount,
      },
      recentAlerts,
    });
  } catch (error: any) {
    log.error('Failed to fetch producer risk profile:', error);
    return response.error(res, error);
  }
};
