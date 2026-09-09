# HEXA Studio — Idea Backlog Kanban
*Created: 2026-09-09 | Board: markdown-local | Preference: self-hosted*

## Columns
`Backlog → Ready → In Progress → Review → Done`

## Repo State (verified 2026-09-09)
- **three.js stack installed:** Yes — `three@^0.171.0`, `@react-three/fiber@^9.0.0`, `@react-three/drei@^10.0.0`
- **3D assets dir:** ❌ `public/models/` not found
- **Existing 3D components:** `VoidGarden.tsx` (R3F rendering layer), `ArchitecturalVisualization3D.tsx` (placeholder archviz), `Carousel3D.tsx`, `effects/` shaders
- **Homepage components:** `HomeHero.tsx`, `HomeSections.tsx`, `HomeChapterRail.tsx` in `features/portfolio/`

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
| #2 | Real-Time Web Viewer (three.js/R3F + glTF loader) | Med | Low | three.js install |
| #5 | Egyptian Material Library (mashrabiya, granite, marble) | Low | Low | #2 viewer |

---

## 🔧 In Progress
| ID | Item | Notes |
|----|------|-------|
| — | *none* | |

---

## 👁️ Review
| ID | Item | Notes |
|----|------|-------|
| — | *none* | |

---

## ✅ Done
| ID | Item | Date |
|----|------|------|
| — | *none* | |

---

## Execution Notes
- All items assume **local/offline** toolchains per user preference
- Items #2+#5 recommended as sprint S022.1 (viewer first — #5 depends on it)
- Repo is a **clean slate** — no three.js deps found in package.json
- See `apps/frontend/src/app/story/scroll.tsx` for existing GSAP-based cinematics (non-3D)
