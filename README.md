# agrotrace-api

## Audit Logging Hardening

This project now supports a hardened audit logging pipeline with append-only, tamper-evident records.

### What Changed

- API requests enqueue audit log jobs (non-blocking).
- A worker appends logs in sequence with hash chaining.
- Integrity checks run on a cron schedule and report chain issues.
- Audit records are stored in a separate database connection.

### Required Environment Variables

- `AUDIT_DB_URI`: fallback URI for audit database.
- `AUDIT_DB_READER_URI`: audit DB URI for read operations and integrity checks.
- `AUDIT_DB_WRITER_URI`: audit DB URI for write operations in the worker.
- `AUDIT_HASH_SECRET`: HMAC secret used for tamper-evident hash generation.
- `AUDIT_INTEGRITY_SCHEDULE`: cron schedule for periodic chain checks.

### DB User Permissions

Use separate users for reader and writer URIs:

- Reader user: allow `find` (and optionally `listIndexes`) on audit collection.
- Writer user: allow `insert` only on audit collection.

Do not grant update or delete privileges on the audit collection.
