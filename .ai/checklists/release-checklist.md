# CHECKLIST: PRODUCTION RELEASE

- [ ] GitLab CI pipeline green (`quality`, `build`, `image`, `validate`).
- [ ] Version tag updated in `package.json` and `CHANGELOG.md`.
- [ ] Production environment variables populated (`.env.gitlab`).
- [ ] Container images deployed via Traefik v3 proxy.
- [ ] Smoke health check verified on `https://hexastudio.net/api/v1/health`.
