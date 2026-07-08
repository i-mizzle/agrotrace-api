/**
 * RISK ALERT INTEGRATION GUIDE
 * 
 * This file demonstrates how to integrate the risk alert system into existing
 * service and controller layers. Copy patterns to relevant files as needed.
 */

// ============================================================================
// EXAMPLE 1: Hook into Inspection Result Creation
// ============================================================================
// In src/service/inspection.service.ts, add to createInspection or the 
// controller that calls it:

import { enqueueRiskAlert } from './risk-alert.service'; // or queue

export async function createInspectionWithRiskAlert(
  input: DocumentDefinition<InspectionDocument>
) {
  const inspection = await Inspection.create(input);

  // Trigger risk alert if inspection failed
  if (inspection.result === 'fail') {
    const severity = 
      inspection.type === 'export-compliance' || inspection.type === 'food-safety'
        ? 'critical'
        : inspection.type === 'veterinary'
        ? 'high'
        : 'medium';

    await enqueueRiskAlert({
      producerId: inspection.producer.toString(),
      alertType: 'inspection_fail',
      severity,
      message: `${inspection.type} inspection FAILED for asset/batch`,
      refId: inspection._id.toString(),
      refModel: 'Inspection',
    });
  }

  // Trigger alert if conditional
  if (inspection.result === 'conditional') {
    await enqueueRiskAlert({
      producerId: inspection.producer.toString(),
      alertType: 'inspection_conditional',
      severity: 'medium',
      message: `${inspection.type} inspection returned CONDITIONAL result`,
      refId: inspection._id.toString(),
      refModel: 'Inspection',
    });
  }

  return inspection;
}

// ============================================================================
// EXAMPLE 2: Hook into Event Creation (Mortality Events)
// ============================================================================
// In src/service/event.service.ts, add:

export async function createEventWithRiskAlert(
  input: DocumentDefinition<EventDocument>
) {
  const event = await Event.create(input);

  // Alert on high mortality
  if (event.eventType === 'death' || event.eventType === 'culling') {
    if (event.mortalityCount && event.mortalityCount > 5) {
      await enqueueRiskAlert({
        producerId: event.producer.toString(),
        alertType: 'mortality_event',
        severity: event.mortalityCount > 20 ? 'critical' : 'high',
        message: `${event.mortalityCount} animals lost in single event`,
        refId: event._id.toString(),
        refModel: 'Event',
      });
    }
  }

  // Alert if medication/pesticide applied without followup inspection
  if (
    (event.eventType === 'medication' || event.eventType === 'pesticide-application') &&
    event.nextDueDate
  ) {
    // Could be checked by separate cron or manually on inspection creation
  }

  return event;
}

// ============================================================================
// EXAMPLE 3: Use in Notification Flow
// ============================================================================
// In src/service/notification.service.ts, extend to alert producers:

import { findRiskAlerts } from './risk-alert.service';
import { createNotification } from './notification.service';

export async function createRiskAlertNotification(
  riskAlertId: string,
  producerId: string
) {
  const riskAlert = await findRiskAlert({ _id: riskAlertId });

  // Create system notification linked to risk alert
  await createNotification({
    type: 'system',
    user: producerId, // Link to producer's user
    message: riskAlert.message,
    item: riskAlertId,
    itemModel: 'RiskAlert', // Add to Notification model enum
    read: false,
  });
}

// ============================================================================
// EXAMPLE 4: Add to Batch Closure
// ============================================================================
// In src/service/batch.service.ts, when closing batch:

export async function closeBatchWithRiskCheck(
  batchId: string,
  userId: string
) {
  const batch = await Batch.findByIdAndUpdate(
    batchId,
    { status: 'closed' },
    { new: true }
  );

  // Check for unresolved quality issues before closure
  const pendingAlerts = await findRiskAlerts(
    {
      ref: batchId,
      refModel: 'Batch',
      status: { $ne: 'resolved' },
    },
    0,
    0
  );

  if (pendingAlerts.data.length > 0) {
    // Log warning: closing batch with open risk alerts
    console.warn(`Batch ${batch.batchCode} closed with ${pendingAlerts.data.length} unresolved alerts`);
  }

  return batch;
}

// ============================================================================
// EXAMPLE 5: Custom Alert Trigger (Cost Overrun)
// ============================================================================

export async function checkEventCostOverrun(event: EventDocument) {
  const COST_THRESHOLD = 50000; // Example threshold in currency units

  if (event.costEstimate && event.costEstimate > COST_THRESHOLD) {
    await enqueueRiskAlert({
      producerId: event.producer.toString(),
      alertType: 'asset_missing', // Reuse or create new type
      severity: 'high',
      message: `Event cost ${event.costEstimate} exceeds threshold of ${COST_THRESHOLD}`,
      refId: event._id.toString(),
      refModel: 'Event',
    });
  }
}

// ============================================================================
// EXAMPLE 6: Controller Endpoint to View Producer Risk Profile
// ============================================================================

export async function getProducerRiskProfile(req, res) {
  try {
    const { producerId } = req.params;

    // Get producer with risk scores
    const producer = await Producer.findById(producerId).select(
      'name riskScore riskLevel'
    );

    // Get recent open alerts
    const { total, data: recentAlerts } = await findRiskAlerts(
      {
        producer: producerId,
        status: 'open',
      },
      10,
      1
    );

    // Get alert history (resolved)
    const { data: resolvedAlerts } = await findRiskAlerts(
      {
        producer: producerId,
        status: 'resolved',
      },
      5,
      1
    );

    res.json({
      producer,
      openAlerts: {
        count: total,
        items: recentAlerts,
      },
      recentResolved: resolvedAlerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// EXAMPLE 7: Acknowledge/Resolve Alert Endpoint
// ============================================================================

export async function acknowledgeRiskAlert(req, res) {
  try {
    const { alertId } = req.params;
    const userId = req.user._id; // From auth middleware

    const alert = await acknowledgeRiskAlert(alertId, userId);

    res.json({
      message: 'Alert acknowledged',
      alert,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function resolveRiskAlert(req, res) {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await resolveRiskAlert(alertId, userId);

    res.json({
      message: 'Alert resolved',
      alert,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
