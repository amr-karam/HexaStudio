# HEXA Hub — Sync Engine Requirements

**Reference:** ADR-0006: Odoo-First Architecture Mandate

---

## 1. Overview

The Sync Engine is the core component that maintains data consistency between HEXA Hub and Odoo 17 ERP. It implements bidirectional synchronization with conflict resolution, offline support, and retry logic.

---

## 2. Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      SYNC ENGINE                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Sync Orchestrator                    │   │
│  │  - Coordinates all sync operations                  │   │
│  │  - Manages sync state and status                    │   │
│  │  - Handles conflict detection                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────┐         │
│  │                       │                       │         │
│  ▼                       ▼                       ▼         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Hub →   │    │  Odoo →  │    │ Conflict │             │
│  │  Odoo    │    │  Hub     │    │ Resolver │             │
│  │  Sync    │    │  Sync    │    │          │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │               │               │                     │
│       └───────────────┼───────────────┘                     │
│                       ▼                                     │
│              ┌──────────────┐                              │
│              │   Offline    │                              │
│              │    Queue     │                              │
│              └──────────────┘                              │
│                       │                                     │
│              ┌──────────────┐                              │
│              │    Audit     │                              │
│              │     Log      │                              │
│              └──────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### 3.1 Sync Orchestrator

**Purpose:** Coordinates all sync operations and manages sync state.

**Responsibilities:**
- Trigger sync operations based on webhooks or polling
- Manage sync state per module
- Handle sync conflicts
- Log all operations

**Interface:**
```typescript
interface SyncOrchestrator {
  // Trigger sync for a specific module
  syncModule(module: OdooModule): Promise<SyncResult>;
  
  // Trigger full sync across all modules
  fullSync(): Promise<FullSyncResult>;
  
  // Get sync status for all modules
  getSyncStatus(): Promise<SyncStatus[]>;
  
  // Get sync history
  getSyncHistory(module: OdooModule, limit: number): Promise<SyncHistory[]>;
}
```

### 3.2 Hub → Odoo Sync

**Purpose:** Push changes from HEXA Hub to Odoo.

**Flow:**
1. Detect change in HEXA Hub (via event or polling)
2. Transform data to Odoo format
3. Apply conflict resolution if needed
4. Execute Odoo API call
5. Update sync state
6. Log operation

**Interface:**
```typescript
interface HubToOdooSync {
  // Push a single record to Odoo
  pushRecord(module: OdooModule, record: HubRecord): Promise<SyncResult>;
  
  // Push multiple records to Odoo
  pushRecords(module: OdooModule, records: HubRecord[]): Promise<SyncResult[]>;
  
  // Check for pending changes
  getPendingChanges(module: OdooModule): Promise<PendingChange[]>;
}
```

### 3.3 Odoo → Hub Sync

**Purpose:** Pull changes from Odoo to HEXA Hub.

**Flow:**
1. Detect change in Odoo (via webhook or polling)
2. Transform data to Hub format
3. Apply conflict resolution if needed
4. Update HEXA Hub database
5. Update sync state
6. Log operation

**Interface:**
```typescript
interface OdooToHubSync {
  // Pull a single record from Odoo
  pullRecord(module: OdooModule, odooId: number): Promise<SyncResult>;
  
  // Pull multiple records from Odoo
  pullRecords(module: OdooModule, odooIds: number[]): Promise<SyncResult[]>;
  
  // Check for changes since last sync
  getChangesSince(module: OdooModule, since: Date): Promise<OdooChange[]>;
}
```

### 3.4 Conflict Resolver

**Purpose:** Detect and resolve conflicts between HEXA Hub and Odoo.

**Strategies:**
- **Last-Write-Wins (LWW)**: Default for most fields
- **Field-Level Merge**: Merge non-conflicting fields automatically
- **Manual Resolution**: Notify users for critical conflicts
- **Custom Rules**: Per-module or per-field resolution rules

**Interface:**
```typescript
interface ConflictResolver {
  // Detect conflicts for a record
  detectConflict(module: OdooModule, hubRecord: HubRecord, odooRecord: OdooRecord): Promise<Conflict | null>;
  
  // Resolve conflict using specified strategy
  resolveConflict(conflict: Conflict, strategy: ResolutionStrategy): Promise<Resolution>;
  
  // Get all unresolved conflicts
  getUnresolvedConflicts(): Promise<Conflict[]>;
  
  // Manually resolve a conflict
  manuallyResolve(conflictId: string, resolution: ManualResolution): Promise<Resolution>;
}
```

### 3.5 Offline Queue

**Purpose:** Queue sync operations when Odoo is unavailable.

**Features:**
- Persistent storage (Redis)
- Priority ordering (critical operations first)
- Exponential backoff retry
- Maximum retry limit
- Dead letter queue for failed operations

**Interface:**
```typescript
interface OfflineQueue {
  // Enqueue a sync operation
  enqueue(operation: SyncOperation, priority: Priority): Promise<void>;
  
  // Process next operation in queue
  processNext(): Promise<SyncOperation | null>;
  
  // Get queue status
  getStatus(): Promise<QueueStatus>;
  
  // Retry failed operations
  retryFailed(): Promise<RetryResult>;
  
  // Clear dead letter queue
  clearDeadLetter(): Promise<void>;
}
```

---

## 4. Sync Strategies

### 4.1 Real-Time Sync (Webhook-Based)

**Trigger:** Odoo webhook on record change

**Flow:**
1. Odoo sends webhook to HEXA Hub
2. Webhook handler validates signature
3. Sync engine processes change
4. Updates HEXA Hub database
5. Returns success/failure to Odoo

**Advantages:**
- Near-instant sync
- Low API usage
- Efficient for high-frequency changes

**Disadvantages:**
- Requires webhook configuration
- May miss changes if webhook fails
- Not suitable for bulk operations

### 4.2 Polling-Based Sync

**Trigger:** Scheduled job (every 5 minutes)

**Flow:**
1. Sync engine queries Odoo for changes since last sync
2. Processes changes in batches
3. Updates HEXA Hub database
4. Updates last sync timestamp

**Advantages:**
- Reliable (doesn't depend on webhooks)
- Can handle bulk operations
- Good for low-frequency changes

**Disadvantages:**
- Higher API usage
- Delayed sync (up to poll interval)
- Less efficient for real-time updates

### 4.3 Hybrid Approach (Recommended)

**Trigger:** Webhooks for real-time + polling for reliability

**Flow:**
1. Webhooks for immediate sync of critical changes
2. Polling as fallback for missed webhooks
3. Periodic full sync for data integrity

**Advantages:**
- Best of both worlds
- High reliability
- Low latency for critical changes

---

## 5. Conflict Resolution Rules

### 5.1 Field-Level Rules

| Field Type | Strategy | Rationale |
|------------|----------|-----------|
| **Timestamps** | LWW (latest wins) | Most recent change is authoritative |
| **Status fields** | LWW | Status changes are intentional |
| **Numeric values** | LWW | Avoid partial updates |
| **Text fields** | Field-level merge | Non-overlapping changes can be merged |
| **Binary data** | LWW | Cannot merge |
| **References** | LWW | Must be consistent |

### 5.2 Module-Specific Rules

| Module | Special Rules |
|--------|---------------|
| **CRM** | Lead stage changes always LWW |
| **Projects** | Project status changes require validation |
| **Tasks** | Assignment changes LWW, status changes LWW |
| **Invoices** | Read-only from Odoo, no conflicts possible |
| **Timesheets** | Hours logged LWW, description merge |

### 5.3 Conflict Detection

**Detection Points:**
- On webhook receive (before processing)
- On polling (compare timestamps)
- On manual sync (user-triggered)

**Detection Logic:**
```typescript
function detectConflict(
  hubRecord: HubRecord,
  odooRecord: OdooRecord,
  lastSyncTime: Date
): Conflict | null {
  const hubModified = new Date(hubRecord.write_date);
  const odooModified = new Date(odooRecord.write_date);
  
  // Both changed since last sync
  if (hubModified > lastSyncTime && odooModified > lastSyncTime) {
    // Check for field-level conflicts
    const conflictingFields = findConflictingFields(hubRecord, odooRecord);
    if (conflictingFields.length > 0) {
      return {
        type: 'CONFLICT',
        hubRecord,
        odooRecord,
        conflictingFields,
        hubModified,
        odooModified,
      };
    }
  }
  
  return null;
}
```

---

## 6. Retry Logic

### 6.1 Exponential Backoff

```typescript
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000, 32000]; // 1s to 32s
const MAX_RETRIES = 6;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = RETRY_DELAYS[attempt];
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 6.2 Circuit Breaker

```typescript
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 30000; // 30 seconds

class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > RESET_TIMEOUT) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
    this.failureCount = Math.max(0, this.failureCount - 1);
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= FAILURE_THRESHOLD) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 7. Audit Logging

### 7.1 Log Schema

```typescript
interface SyncAuditLog {
  id: string;
  timestamp: Date;
  module: OdooModule;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFLICT' | 'RETRY' | 'FAIL';
  direction: 'HUB_TO_ODOO' | 'ODOO_TO_HUB';
  recordId: number | string;
  odooModel: string;
  status: 'SUCCESS' | 'FAILED' | 'CONFLICT' | 'RETRY';
  details: {
    fieldsChanged?: string[];
    conflictFields?: string[];
    retryCount?: number;
    errorMessage?: string;
    duration: number;
  };
  userId?: string;
  correlationId: string;
}
```

### 7.2 Log Storage

- **Primary**: PostgreSQL (queryable)
- **Secondary**: Redis (real-time monitoring)
- **Archive**: Move logs older than 30 days to cold storage

---

## 8. Monitoring & Metrics

### 8.1 Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **Sync Latency** | Time to sync a record | > 5 seconds |
| **Error Rate** | Percentage of failed syncs | > 1% |
| **Queue Depth** | Number of pending operations | > 100 |
| **Circuit Breaker State** | OPEN/HALF_OPEN/CLOSED | OPEN |
| **Conflict Rate** | Conflicts per 1000 syncs | > 10 |

### 8.2 Dashboards

- **Real-Time Sync Status**: Current state of all modules
- **Sync History**: Timeline of sync operations
- **Error Analysis**: Root cause analysis of failures
- **Performance Metrics**: Latency, throughput, queue depth

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Conflict detection logic
- Resolution strategies
- Retry logic
- Circuit breaker

### 9.2 Integration Tests

- End-to-end sync flow
- Webhook handling
- Polling mechanism
- Offline queue

### 9.3 Load Tests

- High-volume sync operations
- Concurrent modifications
- Queue performance
- Memory usage

---

## 10. Deployment

### 10.1 Deployment Steps

1. Deploy sync engine service
2. Configure Odoo webhooks
3. Initialize sync state
4. Run initial full sync
5. Enable real-time sync
6. Monitor for issues

### 10.2 Rollback Plan

1. Disable real-time sync
2. Fall back to polling-only mode
3. Investigate issues
4. Fix and redeploy

---

**Last Updated:** 2026-08-02
**Reference:** ADR-0006: Odoo-First Architecture Mandate
