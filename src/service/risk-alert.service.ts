import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import RiskAlert, { RiskAlertDocument, RiskAlertType, RiskSeverity } from '../model/risk-alert.model';
import Producer from '../model/producer.model';

// Weight mapping for different alert types and severities
const ALERT_WEIGHTS: Record<RiskAlertType, Record<RiskSeverity, number>> = {
  inspection_fail: { low: 0, medium: 15, high: 25, critical: 35 },
  inspection_conditional: { low: 5, medium: 8, high: 10, critical: 15 },
  certification_expired: { low: 0, medium: 8, high: 15, critical: 25 },
  certification_expiring: { low: 3, medium: 5, high: 8, critical: 12 },
  batch_expired: { low: 0, medium: 8, high: 15, critical: 25 },
  mortality_event: { low: 5, medium: 10, high: 15, critical: 25 },
  asset_missing: { low: 5, medium: 10, high: 20, critical: 30 },
  shipment_delayed: { low: 3, medium: 5, high: 10, critical: 15 },
};

export async function createRiskAlert(
  input: Omit<DocumentDefinition<RiskAlertDocument>, '_id' | 'createdAt' | 'updatedAt'>
) {
  const alert = await RiskAlert.create(input);
  // Recalculate producer risk score after creating alert
  await recalculateProducerRiskScore(input.producer);
  return alert;
}

export async function findRiskAlerts(
  query: FilterQuery<RiskAlertDocument>,
  perPage: number = 10,
  page: number = 1,
  options: QueryOptions = { lean: true }
) {
  const total = await RiskAlert.countDocuments(query);
  const data = await RiskAlert.find(query, {}, options)
    .sort({ createdAt: -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage);

  return { total, data };
}

export async function findRiskAlert(
  query: FilterQuery<RiskAlertDocument>,
  options: QueryOptions = { lean: true }
) {
  return RiskAlert.findOne(query, {}, options);
}

export async function acknowledgeRiskAlert(
  alertId: string,
  userId: string
) {
  const alert = await RiskAlert.findByIdAndUpdate(
    alertId,
    {
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    },
    { new: true }
  );

  if (alert) {
    await recalculateProducerRiskScore(alert.producer);
  }

  return alert;
}

export async function resolveRiskAlert(
  alertId: string,
  userId: string
) {
  const alert = await RiskAlert.findByIdAndUpdate(
    alertId,
    {
      status: 'resolved',
      resolvedBy: userId,
      resolvedAt: new Date(),
    },
    { new: true }
  );

  if (alert) {
    await recalculateProducerRiskScore(alert.producer);
  }

  return alert;
}

export async function deleteRiskAlert(query: FilterQuery<RiskAlertDocument>) {
  const alert = await RiskAlert.findOne(query);
  if (alert) {
    await RiskAlert.deleteOne({ _id: alert._id });
    await recalculateProducerRiskScore(alert.producer);
  }
  return alert;
}

/**
 * Recalculate producer risk score by summing weights of all open + acknowledged alerts
 * Risk Level bands: 0-20 (low), 21-45 (moderate), 46-70 (high), 71-100 (critical)
 */
export async function recalculateProducerRiskScore(producerId: string) {
  // Get all open and acknowledged alerts for producer
  const alerts = await RiskAlert.find({
    producer: producerId,
    status: { $in: ['open', 'acknowledged'] },
  });

  const riskScore = Math.min(
    alerts.reduce((sum, alert) => sum + alert.weight, 0),
    100
  );

  // Determine risk level based on score
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  if (riskScore <= 20) riskLevel = 'low';
  else if (riskScore <= 45) riskLevel = 'moderate';
  else if (riskScore <= 70) riskLevel = 'high';
  else riskLevel = 'critical';

  await Producer.findByIdAndUpdate(
    producerId,
    { riskScore, riskLevel },
    { new: true }
  );

  return { riskScore, riskLevel };
}

/**
 * Get the weight for an alert based on type and severity
 */
export function getAlertWeight(
  alertType: RiskAlertType,
  severity: RiskSeverity
): number {
  return ALERT_WEIGHTS[alertType]?.[severity] ?? 0;
}
