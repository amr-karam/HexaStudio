# ADR 0004: Traefik v3 Edge Proxy Engine

- **Status:** Accepted
- **Date:** 2026-07-24
- **Author:** Infrastructure Lead

## Context
Production services require dynamic SSL termination, Cloudflare integration, and container label-based routing.

## Decision
Use Traefik v3 as the edge reverse proxy, replacing Nginx.
