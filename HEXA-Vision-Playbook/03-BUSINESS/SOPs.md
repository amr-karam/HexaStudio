# 📋 SOPs: STANDARD OPERATING PROCEDURES

**Version:** 1.0 | **Domain:** Business | **Focus:** Operational Consistency

## 1. THE PURPOSE OF SOPs
Standard Operating Procedures ensure that the quality of a HEXA project does not depend on *who* is working on it, but on the *system* they follow.

---

## 2. CORE PROCEDURES

### SOP-01: New Project Onboarding
1. **Folder Setup:** Create the project folder in the monorepo.
2. **Doc Init:** Create the `PROJECT_LIFECYCLE.md` and `OPEN_TASKS.md`.
3. **Asset Audit:** Verify all 3D assets are in the correct format and optimized.
4. **Stakeholder Sync:** Conduct the lauch meeting to align on the "Luxury" vision.

### SOP-02: The "Gold Standard" Commit
1. **Linting:** Run `npm run lint` and fix all warnings.
2. **Testing:** Run all relevant unit and integration tests.
3. **Review:** Cross-reference the change with the `CODING_STANDARDS.md`.
4. **Commit:** Use a Conventional Commit message.

### SOP-03: Deployment to Production
1. **Staging Validation:** Verify the build on the staging server.
2. **Checklist:** Complete the `RELEASE_CHECKLIST.md`.
3. **Backup:** Trigger a full database and asset backup.
4. **Deploy:** Execute the GitHub Action pipeline.
5. **Smoke Test:** Verify the LCP and 60 FPS in production.

### SOP-04: Asset Optimization Pipeline
1. **Geometry:** Run meshes through Draco compression.
2. **Textures:** Convert textures to WebP/Basis.
3. **Validation:** Verify that the asset does not exceed the "Asset Size" budget.

---

## 3. SOP COMPLIANCE
Any agent found skipping an SOP must redo the task from the start. SOPs are not "suggestions"; they are the **Standard**.

*“Consistency is the foundation of quality.”*
