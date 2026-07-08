## Risk Alert API Documentation

### Base URL
`/risk-alerts`

### Authentication
All endpoints require `requiresUser` middleware. Permission checks are enforced via `requiresPermissions` middleware with the permission key: `producer.risk-alerts.*`

---

## Endpoints

### 1. List Risk Alerts

**GET** `/risk-alerts`

Fetch all risk alerts for the current user's producer organization.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `perPage` (number, default: 10) - Items per page
- `status` (string, optional) - Filter by status: `open`, `acknowledged`, `resolved`
- `alertType` (string, optional) - Filter by alert type (see risk alert types below)
- `severity` (string, optional) - Filter by severity: `low`, `medium`, `high`, `critical`

**Example Request:**
```bash
GET /risk-alerts?page=1&perPage=10&status=open&severity=high
```

**Response (200 OK):**
```json
{
  "total": 5,
  "page": 1,
  "perPage": 10,
  "data": [
    {
      "_id": "alert_id_123",
      "producer": "producer_id",
      "alertType": "inspection_fail",
      "severity": "high",
      "weight": 25,
      "message": "food-safety inspection FAILED for asset/batch",
      "status": "open",
      "ref": "inspection_id",
      "refModel": "Inspection",
      "createdAt": "2026-07-08T10:30:00Z",
      "updatedAt": "2026-07-08T10:30:00Z"
    }
  ]
}
```

**Authorization:**
- Required permission: `producer.risk-alerts.read`
- User must belong to the producer organization

---

### 2. Get Single Risk Alert

**GET** `/risk-alerts/:alertId`

Retrieve details for a specific risk alert.

**URL Parameters:**
- `alertId` (string) - The MongoDB ID of the risk alert

**Example Request:**
```bash
GET /risk-alerts/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "producer": "producer_id",
  "alertType": "certification_expired",
  "severity": "high",
  "weight": 15,
  "message": "Certification ABC-123 has expired",
  "status": "open",
  "ref": "cert_id",
  "refModel": "Certification",
  "createdAt": "2026-07-08T10:30:00Z",
  "updatedAt": "2026-07-08T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Alert not found or user has no access
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User not associated with a producer organization

**Authorization:**
- Required permission: `producer.risk-alerts.read`
- Alert must belong to user's producer organization

---

### 3. Acknowledge Risk Alert

**POST** `/risk-alerts/:alertId/acknowledge`

Mark a risk alert as acknowledged (seen). The alert remains open but is flagged as acknowledged. Acknowledged alerts still contribute to the producer's risk score.

**URL Parameters:**
- `alertId` (string) - The MongoDB ID of the risk alert

**Request Body:**
None required

**Example Request:**
```bash
POST /risk-alerts/507f1f77bcf86cd799439011/acknowledge
```

**Response (200 OK):**
```json
{
  "message": "Risk alert acknowledged",
  "alert": {
    "_id": "507f1f77bcf86cd799439011",
    "producer": "producer_id",
    "alertType": "inspection_fail",
    "severity": "high",
    "weight": 25,
    "message": "food-safety inspection FAILED for asset/batch",
    "status": "acknowledged",
    "acknowledgedBy": "user_id",
    "acknowledgedAt": "2026-07-08T11:00:00Z",
    "createdAt": "2026-07-08T10:30:00Z",
    "updatedAt": "2026-07-08T11:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Alert not found
- `400 Bad Request` - Alert status is not `open` (cannot acknowledge acknowledged or resolved alerts)
- `403 Forbidden` - User not authorized to access this alert

**Audit Log:**
- Action: `update`
- Description: `acknowledged risk alert: {alertType} ({severity})`

**Authorization:**
- Required permission: `producer.risk-alerts.update`
- Alert must belong to user's producer organization

---

### 4. Resolve Risk Alert

**POST** `/risk-alerts/:alertId/resolve`

Mark a risk alert as resolved (handled/complete). Resolved alerts no longer contribute to the producer's risk score.

**URL Parameters:**
- `alertId` (string) - The MongoDB ID of the risk alert

**Request Body:**
```json
{
  "resolutionNotes": "string (optional)"
}
```

**Example Request:**
```bash
POST /risk-alerts/507f1f77bcf86cd799439011/resolve
Content-Type: application/json

{
  "resolutionNotes": "Re-inspection passed. Issue resolved."
}
```

**Response (200 OK):**
```json
{
  "message": "Risk alert resolved",
  "alert": {
    "_id": "507f1f77bcf86cd799439011",
    "producer": "producer_id",
    "alertType": "inspection_fail",
    "severity": "high",
    "weight": 25,
    "message": "food-safety inspection FAILED for asset/batch",
    "status": "resolved",
    "resolvedBy": "user_id",
    "resolvedAt": "2026-07-08T12:00:00Z",
    "acknowledgedBy": "user_id",
    "acknowledgedAt": "2026-07-08T11:00:00Z",
    "createdAt": "2026-07-08T10:30:00Z",
    "updatedAt": "2026-07-08T12:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Alert not found
- `400 Bad Request` - Alert is already resolved
- `403 Forbidden` - User not authorized to access this alert

**Audit Log:**
- Action: `update`
- Description: `resolved risk alert: {alertType} ({severity})`

**Authorization:**
- Required permission: `producer.risk-alerts.update`
- Alert must belong to user's producer organization

---

### 5. Get Producer Risk Profile

**GET** `/producers/:producerId/risk-profile`

Fetch the risk profile for a producer, including current risk score, risk level, and summary of open/acknowledged alerts.

**URL Parameters:**
- `producerId` (string, optional) - The MongoDB ID of the producer. If omitted, defaults to current user's producer.

**Example Request:**
```bash
GET /producers/507f1f77bcf86cd799439012/risk-profile
```

**Response (200 OK):**
```json
{
  "producer": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Farm ABC Ltd",
    "riskScore": 65,
    "riskLevel": "high"
  },
  "alertSummary": {
    "open": 3,
    "acknowledged": 2,
    "total": 5
  },
  "recentAlerts": [
    {
      "_id": "alert_id_1",
      "alertType": "inspection_fail",
      "severity": "critical",
      "weight": 25,
      "message": "export-compliance inspection FAILED",
      "status": "open",
      "createdAt": "2026-07-08T10:30:00Z"
    },
    {
      "_id": "alert_id_2",
      "alertType": "certification_expired",
      "severity": "high",
      "weight": 15,
      "message": "Certification has expired",
      "status": "acknowledged",
      "createdAt": "2026-07-07T14:20:00Z"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Producer not found
- `403 Forbidden` - User not authorized to access this producer's risk profile

**Authorization:**
- Required permission: `producer.risk-alerts.read`
- If `producerId` is provided, must match user's producer organization

---

## Risk Alert Types

The following alert types can be created:

| Alert Type | Severity Levels | Weight Range | Trigger |
|---|---|---|---|
| `inspection_fail` | low-critical | 0-35 | Inspection result is `fail` |
| `inspection_conditional` | low-critical | 5-15 | Inspection result is `conditional` |
| `certification_expired` | low-critical | 0-25 | Certification expiry date passed |
| `certification_expiring` | low-critical | 3-12 | Certification expires within 7 days |
| `batch_expired` | low-critical | 0-25 | Batch expiry date passed |
| `mortality_event` | low-critical | 5-25 | High animal mortality count |
| `asset_missing` | low-critical | 5-30 | Asset marked as lost or unaccounted |
| `shipment_delayed` | low-critical | 3-15 | Shipment past estimated arrival |

---

## Risk Score & Risk Level

The producer's overall risk score is calculated from active alerts:

**Risk Score:** Sum of all `open` + `acknowledged` alert weights, capped at 100

**Risk Level Bands:**
- `low`: 0-20 points
- `moderate`: 21-45 points
- `high`: 46-70 points
- `critical`: 71-100 points

When an alert is resolved, it no longer contributes to the score. The risk score is automatically recalculated.

---

## Common Errors

### 401 Unauthorized
User is not authenticated. Include a valid JWT token in the `Authorization` header.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
User authenticated but lacks required permissions or is not associated with the target producer.

```json
{
  "statusCode": 403,
  "message": "User not associated with a producer organization"
}
```

### 404 Not Found
Alert or producer not found, or alert does not belong to user's producer.

```json
{
  "statusCode": 404,
  "message": "Risk alert not found"
}
```

### 400 Bad Request
Invalid request body or state transition (e.g., trying to acknowledge an already-resolved alert).

```json
{
  "statusCode": 400,
  "message": "Cannot acknowledge alert with status: resolved"
}
```

---

## Audit Logging

All alert status changes (`acknowledge`, `resolve`) are logged to the audit log with:
- **actionType**: `update`
- **description**: `acknowledged risk alert: {alertType} ({severity})` or `resolved risk alert: ...`
- **actor**: User ID who performed the action
- **item**: Alert ID
- **requestPayload**: The action and any additional data
- **responseObject**: The updated alert document

This enables full traceability of alert lifecycle for compliance and regulatory purposes.
