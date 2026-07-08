# New Agent Onboarding Checklist

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Goal

To ensure every new AI Agent or human developer is fully aligned with the project vision, architecture, and standards before they contribute code.

## Stage 1: Knowledge Acquisition (Mandatory)

Read these documents in order. Do not skip.

- [ ] `AGENTS.md` — The binding operating manual
- [ ] `00-GOVERNANCE\PROJECT_OVERVIEW.md` — The "What" and "Why"
- [ ] `00-GOVERNANCE\PRODUCT_VISION.md` — The a-grade standard
- [ ] `01-ARCHITECTURE\SYSTEM_ARCHITECTURE.md` — The "How"
- [ ] `02-ROADMAP\PROJECT_ROADMAP.md` — The "When"
- [ ] `06-STANDARDS\CODING_STANDARDS.md` — The "Rules"
- [ ] `06-STANDARDS\SECURITY_STANDARDS.md` — The "Safeguards"
- [ ] `04-AGENTS\AI_AGENT_GUIDE.md` — The "Role"

## Stage 2: Environment Setup

- [ ] Clone the monorepo
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Start infrastructure: `docker compose -f docker-compose.dev.yml up -d`
- [ ] Verify services: `curl http://localhost:4000/api/health`
- [ ] Run `npm run dev` and verify frontend loads at `localhost:3000`

## Stage 3: Alignment Verification

Complete these tasks to prove alignment:

- [ ] **Architecture Quiz:** Explain the BFF pattern and why we use it.
- [ ] **Standard Check:** Create a simple component following `06-STANDARDS`.
- [ ] **Workflow Test:** Create a feature branch, commit a trivial change with a Conventional Commit, and open a draft PR.

## Stage 4: First Contribution

- [ ] Pick a "Good First Issue" from the backlog.
- [ ] Implement the feature following the `SOP_FEATURE_IMPLEMENTATION.md`.
- [ ] Pass all Quality Gates.
- [ ] Merge into `develop`.

## Onboarding Completion

An agent is considered "onboarded" once they have:
1. Read all mandatory docs.
2. Set up their environment.
3. Merged their first PR.
4. Signed off on the `AGENTS.md` rules.
