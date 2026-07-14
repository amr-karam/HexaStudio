# 🏛️ HEXA Studio — Architectural Visualization

<p align="center">
  <img src="apps/frontend/public/logo.webp" alt="HEXA Studio Logo" width="300" />
</p>

<p align="center">
  <strong>Living Spaces. Visualized.</strong><br>
  <i>Immersive 3D architectural experiences for the world's most ambitious projects.</i>
</p>

---

## ✨ The Vision
HEXA Studio bridges the gap between technical architectural data and high-end visual storytelling. We create cinematic, interactive 3D environments that allow clients to experience a space before a single brick is laid.

### 💎 The Luxury Standard
Our platform is built on three pillars:
- **Visual Fidelity**: 8K photorealistic rendering, cinematic lighting, and material authenticity.
- **Immersive Motion**: GSAP-driven storytelling and seamless camera transitions.
- **Engineering Excellence**: Enterprise-grade monorepo architecture with zero-downtime deployment.

---

## 🛠️ Technical Ecosystem

### Frontend (The Experience)
- **Framework**: Next.js 15 (App Router)
- **3D Engine**: Three.js $\rightarrow$ React Three Fiber $\rightarrow$ @react-three/drei
- **Motion**: GSAP, Framer Motion, Lenis Smooth Scroll
- **Styling**: TailwindCSS 4 (Luxury Design System)
- **Observability**: Sentry-integrated FPS/LCP monitoring

### Backend (The Intelligence)
- **BFF**: NestJS (Backend-for-Frontend)
- **CMS**: Strapi 5 Headless CMS
- **ERP**: Odoo Integration for real-time project state
- **Auth**: JWT with httpOnly secure cookies
- **Validation**: Zod & class-validator

### Infrastructure (The Foundation)
- **Orchestration**: Docker Compose (14 services)
- **Reverse Proxy**: Traefik v3 (Automatic SSL/ACME)
- **Data**: PostgreSQL 16, Redis 7, MinIO (S3 Compatible)
- **Observability**: Sentry, Prometheus, Grafana, Loki

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose v2
- Node.js 20+

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/amr-karam/HexaStudio.git
cd HexaStudio

# Automated preparation (installs deps, builds, validates)
bash .setup.sh
# Or: npm run setup

# Launch the ecosystem
docker compose up -d --build
```

### 3. Install Git Hooks
```bash
# Deploy worktree lifecycle hooks (version-controlled in scripts/git-hooks/)
npm run hooks:install
```

This activates:
- **`post-checkout`** — auto-installs deps & rebuilds on branch switch
- **`post-merge`** — reinstalls deps when `package.json` changes
- **`post-rewrite`** — same for rebase/amend
- **`pre-commit`** — `.env` check, GitWand secrets scan, staged typecheck
- **`commit-msg`** — validates Conventional Commit format

### 4. Paseo Worktree Lifecycle Hooks
```bash
# Install Paseo lifecycle hooks (registers with Paseo daemon)
npm run paseo:hooks:install
```

This registers version-controlled lifecycle scripts (`paseo-hooks/`) with Paseo:

| Event | Hook Script | What it does |
|-------|------------|-------------|
| `post-create` | `paseo-hooks/post-create.sh` | Auto-installs deps & builds new worktrees |
| `pre-archive` | `paseo-hooks/pre-archive.sh` | Stops docker services, stashes WIP before removal |
| `post-archive` | `paseo-hooks/post-archive.sh` | Cleans up stale refs, notifies GitHub |
| `post-merge` | `paseo-hooks/post-merge.sh` | Updates main worktree after PR merge |

Worktree lifecycle management:
```bash
# Create a worktree (with full lifecycle)
npm run paseo:worktree:create -- feature/my-branch

# Create from PR
npm run paseo:worktree:create-pr -- 42

# Archive (triggers pre-archive + post-archive hooks)
npm run paseo:worktree:archive -- feature/my-branch

# List all worktrees with status
npm run paseo:worktree:list
```

### 5. Worktrees (Parallel Branches)
```bash
# Create a worktree (auto-runs setup in the new tree)
npm run worktree:add -- feature/my-branch

# Or manually then setup
git worktree add -b feature/my-branch ../worktrees/my-branch
bash .setup.sh
```

### 6. Access Points
| Service | URL |
| :--- | :--- |
| **Frontend** | `http://localhost` |
| **API Docs** | `http://api.localhost/api/docs` |
| **CMS Admin** | `http://cms.localhost/admin` |
| **Monitoring** | `http://grafana.localhost` |

---

## 📈 Deployment Pipeline
Our project utilizes a professional CI/CD pipeline:
`GitHub Push` $\rightarrow$ `Lint & Test` $\rightarrow$ `Docker Build` $\rightarrow$ `GHCR Registry` $\rightarrow$ `Rolling Update (SSH)` $\rightarrow$ `Health Check` $\rightarrow$ `Live`

---

## 📖 Documentation
Our a-priori operational framework is detailed in the **HEXA-Vision-Playbook**.

- [PROJECT CONSTITUTION](HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_CONSTITUTION.md) — The highest authority on quality.
- [SYSTEM ARCHITECTURE](HEXA-Vision-Playbook/01-ARCHITECTURE/SYSTEM_ARCHITECTURE.md) — The technical blueprint.
- [CODING STANDARDS](HEXA-Vision-Playbook/06-STANDARDS/CODING_STANDARDS.md) — The "Gold Standard" for development.
- [AI AGENT GUIDE](HEXA-Vision-Playbook/04-AGENTS/AI_AGENT_GUIDE.md) — The manual for AI contributors.

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🔒 Security

Please read [SECURITY.md](SECURITY.md) for details on our security practices and how to report vulnerabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  © 2026 HEXA Studio. All rights reserved. Private Repository.
</p>
