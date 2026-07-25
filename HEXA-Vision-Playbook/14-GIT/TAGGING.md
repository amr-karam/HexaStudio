# 🏷️ GIT TAGGING & VERSIONING POLICY

**Version:** 1.0.0 | **Scope:** Release Tagging | **Standard:** Annotated SemVer Tags

---

## 1. OVERVIEW & CONVENTIONS

Every production release MUST be demarcated with an **annotated Git tag** adhering to Semantic Versioning format (`v<MAJOR>.<MINOR>.<PATCH>`). Tags trigger automated CD image tagging and Sentry release health tracking (`SENTRY_RELEASE`).

---

## 2. SEMANTIC VERSIONING RULES

- **MAJOR (`v1.0.0` $\rightarrow$ `v2.0.0`)**: Incompatible API breaking changes or major architecture shifts.
- **MINOR (`v1.0.0` $\rightarrow$ `v1.1.0`)**: Backward-compatible feature additions (e.g. new AI agents, new Client Portal capabilities).
- **PATCH (`v1.0.0` $\rightarrow$ `v1.0.1`)**: Backward-compatible bug fixes or security patches.

---

## 3. TAG ANNOTATION TEMPLATE

```bash
git tag -a v1.0.4 -m "Release v1.0.4

- Shared UI luxury variants (Button, Card, Modal)
- Signature scroll cinema primitives
- Strapi Live Preview integration
- Cloudflare Edge Cache ISR purge automation"
```

---

## 4. OPERATIONAL COMMANDS

```bash
# Push tag to trigger CD build
git push origin v1.0.4

# List release tags ordered by version
git tag -l -n1 --sort=-v:refname
```

---

## 5. RELATED DOCUMENTATION

- [RELEASE_FLOW.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/14-GIT/RELEASE_FLOW.md) — Release flow.
- [CHANGELOG.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/CHANGELOG.md) — Project changelog.
