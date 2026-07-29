# Global Database Replication & Failover Strategy

**Author:** Chief Architect / DevOps Team  
**Target:** Enterprise High Availability (99.999% Uptime)

## 1. Executive Summary
This document establishes the architecture for multi-region database replication, Redis high availability, and automated Traefik failover across HEXA Studio production deployments.

---

## 2. PostgreSQL 16 Streaming Replication

### Topology
- **Primary Region (us-east-1):** Read/Write master database (`postgres-master`). Handles all transactions, client portal writes, and Odoo CRM syncs.
- **Replica Regions (eu-central-1, ap-southeast-1):** Asynchronous streaming read replicas (`postgres-replica-1`, `postgres-replica-2`). Used for analytical queries, reporting, and client portal read workloads.

### Configuration (`postgresql.conf`)
```ini
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB
hot_standby = on
```

---

## 3. Redis 7 High Availability & Sentinel

### Topology
- **Master-Replica:** 1 Redis Master + 2 Redis Replicas.
- **Redis Sentinel:** 3 Sentinel instances running across availability zones to monitor master health and execute automatic failover in < 3 seconds.

---

## 4. Traefik v3 Edge Load Balancing & Failover

Traefik v3 is deployed as the global ingress proxy, utilizing health checks to automatically reroute traffic away from degraded regions or nodes.

```yaml
http:
  routers:
    api-router:
      rule: "Host(`api.hexastudio.net`)"
      service: api-service
  services:
    api-service:
      loadBalancer:
        servers:
          - url: "http://backend-primary:4000"
          - url: "http://backend-replica:4000"
        healthCheck:
          path: "/api/v1/health"
          interval: 10s
```

---

## 5. Disaster Recovery RPO & RTO Targets
- **Recovery Point Objective (RPO):** < 5 seconds (streaming WAL replication).
- **Recovery Time Objective (RTO):** < 30 seconds (automated failover).
- **Backups:** Automated encrypted daily snapshots stored in MinIO S3 object storage with 30-day retention.
