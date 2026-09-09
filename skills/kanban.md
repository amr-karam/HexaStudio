# 🏛️ HEXA Studio — Hermes Kanban
*Hermes-powered orchestration | Board: markdown-local | Self-hosted | Created: 2026-09-10*

## Columns
`Backlog → Ready → In Progress → Review → Done`

## Repo State (verified 2026-09-10)
- **three.js stack:** `three@^0.171.0`, `@react-three/fiber@^9.0.0`, `@react-three/drei@^10.0.0` ✅
- **3D assets dir:** ❌ `public/models/` — not yet created
- **Existing 3D components:** `VoidGarden.tsx`, `ArchitecturalVisualization3D.tsx`, `Carousel3D.tsx`, `effects/` shaders
- **Homepage components:** `HomeHero.tsx`, `HomeSections.tsx`, `HomeChapterRail.tsx`
- **Sprint S022.1 artifacts delivered:** `ArchvizViewer.tsx`, `ArchvizModel.tsx`, `MaterialLibrary.ts`, `egyptian-materials.json`, `studio/page.tsx`

---

## 📋 Backlog
| ID | Item | Est Effort | Est Risk | Depends On |
|----|------|-----------|----------|------------|
| #1 | AI Style-Transfer Renderer (local SD + ControlNet) | Med | Low | LoRA training on portfolio |
| #3 | GPU Render Farm Orchestrator (docker + queue) | High | Med | #2 pipeline |
| #4 | Client VR Review Portal (WebXR + Jira sync) | Med | Med | #2 viewer |
| #6 | Season/Ramadan Scene Presets | Low | Low | #5 materials |
| #7 | Automated Cost Estimator (material count → PDF) | High | Med | #5 materials |
| #8 | 3D Asset Marketplace (self-hosted) | High | Med | #5 library |

---

## ✅ Ready
| ID | Item | Est Effort | Est Risk | Depends On |
|----|------|-----------|----------|------------|
| #1 | AI Style-Transfer Renderer (local SD + ControlNet) | Med | Low | LoRA training on portfolio |

---

## 🔧 In Progress
| ID | Item | Files | Status |
|----|------|-------|--------|
| #5 | Egyptian Material Library | `egyptian-materials.json` + `MaterialLibrary.ts` | 5 materials + EGP pricing + Three.js builder ✅ |
| #6 | Season/Ramadan Scene Presets | *(not started)* | Blocked on #5 |

---

## 👁️ Review
| ID | Item | Notes |
|----|------|-------|
| — | *none pending* | |

---

## ✅ Done
| ID | Item | Files | Date |
|----|------|-------|------|
| #2 | Real-Time Web Viewer | `ArchvizViewer.tsx`, `ArchvizModel.tsx`, `studio/page.tsx` | 2026-09-10 |
| #5 | Egyptian Material Library | `egyptian-materials.json`, `MaterialLibrary.ts` | 2026-09-10 |

---

## Execution Notes
- All items assume **local/offline** toolchains per user preference (self-hosted, no cloud deps)
- Sprint S022.1 complete: #2 (viewer) + #5 (materials) delivered, tsc = zero errors
- Kanban lives at `skills/kanban.md` — markdown-local, git-versioned, no external service
- Next: #1 (Style-Transfer — quick win) or #6 (Ramadan Presets — depends on #5)
- Existing GSAP cinematics: `apps/frontend/src/app/story/scroll.tsx`
