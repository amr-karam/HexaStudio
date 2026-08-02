# 🔒 SSL/TLS CERTIFICATE MANAGEMENT & ENCRYPTION STANDARDS

**Version:** 1.0.0 | **Scope:** Transport Layer Security | **Standard:** TLS 1.3 Baseline

---

## 1. OVERVIEW & STANDARDS

All external HTTP traffic across HEXA Vision domains (`hexastudio.net`, `api.hexastudio.net`, `cms.hexastudio.net`) MUST be encrypted in transit using **TLS 1.3** (with TLS 1.2 backwards compatibility). Plain HTTP (port 80) is permanently redirected to HTTPS (port 443) with HTTP Strict Transport Security (HSTS) headers.

---

## 2. CERTIFICATE PROVISIONING ARCHITECTURE

HEXA Vision uses a dual-layer TLS architecture:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 CLOUDFLARE EDGE TLS (Strict)                │
  │     Client ──[ TLS 1.3 / ECDHE-ECDSA-AES128-GCM-SHA256 ]──► Cloudflare Edge │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                   Cloudflare Tunnel / TLS 1.3
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │                 TRAEFIK INGRESS CERTRESOLVER                │
  │     Auto-renews Let's Encrypt Wildcard (*.hexastudio.net)    │
  │     via Cloudflare DNS-01 Challenge                            │
  └─────────────────────────────────────────────────────────────┘
```

1. **Edge TLS**: Managed by Cloudflare CDN (Full Strict SSL mode).
2. **Origin TLS**: Provisioned dynamically by Traefik using **Let's Encrypt ACME DNS-01 challenge** via Cloudflare API.

---

## 3. TRAEFIK ACME CONFIGURATION (`docker/traefik/traefik.yml`)

```yaml
certificatesResolvers:
  cloudflare:
    acme:
      email: admin@hexastudio.net
      storage: /letsencrypt/acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
```

Required container environment variables:
- `CLOUDFLARE_EMAIL`: Hostinger/Cloudflare administrative email.
- `CLOUDFLARE_API_KEY`: Cloudflare API key with DNS Zone Edit permissions.

---

## 4. CIPHER SUITE & TLS CIPHER POLICIES

Traefik explicitly disables weak legacy ciphers (SSLv3, TLS 1.0, TLS 1.1, 3DES, RC4):

### Modern Cipher Order (`dynamic.yml`)
```yaml
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
      sniStrict: true
```

---

## 5. HSTS & SECURITY HEADER INJECTION

All responses from Traefik automatically include 2-year HSTS headers with subdomains and preload enabled:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## 6. OPERATIONAL COMMANDS & DRILLS

```bash
# Verify TLS version and certificate expiration date via OpenSSL
openssl s_client -connect hexastudio.net:443 -servername hexastudio.net < /dev/null 2>/dev/null | openssl x509 -noout -dates -issuer

# Inspect Traefik certificate storage status
docker exec -it hexastudio-traefik-1 ls -la /letsencrypt/acme.json

# Test SSL configuration score against SSLLabs baseline (Target: A+)
curl -s "https://api.ssllabs.com/api/v3/analyze?host=hexastudio.net"
```

---

## 7. RELATED DOCUMENTATION

- [NGINX.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/devops/NGINX.md) — Reverse proxy middleware settings.
- [SECURITY_STANDARDS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/security/SECURITY_STANDARDS.md) — Platform security standards.
- [PASSWORD_ROTATION.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/devops/PASSWORD_ROTATION.md) — Key rotation schedules.
