#!/bin/bash
# JustFilmk Production Board
# Created: 2026-09-10
# Board: markdown-local | Self-hosted | No cloud dependency
# Purpose: Consolidated production pipeline for HEXA Studio 3D archviz pipeline

# ============================================================
# PROJECT STATE OVERVIEW
# ============================================================
Project_Name="HEXA Studio — 3D Architecture Visualization Studio"
Board_Version="1.0.0"
Board_Created="2026-09-10"
Board_Type="markdown-local"
Hosting="Self-hosted (no cloud/SaaS)"
Active_Sprint="S022.1"
Active_Sprint_Items="#2, #5"

# ============================================================
# PRODUCTION PIPELINE — ALL 8 ITEMS
# ============================================================

# --- #1: AI Style-Transfer Renderer ---
Item_1_Name="AI Style-Transfer Renderer"
Item_1_Category="ML/Automation"
Item_1_Status="Backlog → Ready"
Item_1_Est_Effort="Med (3 days)"
Item_1_Est_Risk="Low"
Item_1_Depends_On="LoRA training on portfolio"
Item_1_Tech_Stack="Stable Diffusion (local), ControlNet, ComfyUI"
Item_1_Files="None yet — blocked until S022.2"
Item_1_Notes="Local-only inference per user preference. No cloud API."
Item_1_Next_Step="Set up SDXL checkpoint + ControlNet models locally"

# --- #2: Real-Time Web Viewer (DELIVERED) ---
Item_2_Name="Real-Time Web Viewer"
Item_2_Category="Frontend/3D"
Item_2_Status="Completed ✅"
Item_2_Est_Effort="Med (2 days)"
Item_2_Est_Risk="Low"
Item_2_Depends_On="three.js install"
Item_2_Tech_Stack="Three.js ^0.171.0, R3F ^9.0.0, Drei ^10.0.0"
Item_2_Files="ArchvizViewer.tsx, ArchvizModel.tsx, studio/page.tsx"
Item_2_Location="$REPO/apps/frontend/src/components/ArchvizViewer.tsx"
Item_2_Location2="$REPO/apps/frontend/src/components/ArchvizModel.tsx"
Item_2_Location3="$REPO/apps/frontend/src/app/studio/page.tsx"
Item_2_Verification="tsc --noEmit: zero errors | /studio: HTTP 200"
Item_2_Notes="Self-hosted viewer: OrbitControls, ContactShadows, Environment"

# --- #3: GPU Render Farm Orchestrator ---
Item_3_Name="GPU Render Farm Orchestrator"
Item_3_Category="DevOps/Infrastructure"
Item_3_Status="Backlog"
Item_3_Est_Effort="High (1 week)"
Item_3_Est_Risk="Med"
Item_3_Depends_On="#2 pipeline"
Item_3_Tech_Stack="Docker, Celery, Blender, LuxCoreRender"
Item_3_Host="19.16.1.100 (production server)"
Item_3_Files="None yet"

# --- #4: Client VR Review Portal ---
Item_4_Name="Client VR Review Portal"
Item_4_Category="Frontend/VR"
Item_4_Status="Backlog"
Item_4_Est_Effort="Med (3 days)"
Item_4_Est_Risk="Med"
Item_4_Depends_On="#2 viewer"
Item_4_Tech_Stack="WebXR, React Three Fiber, Jira/Trello sync"
Item_4_Files="None yet"

# --- #5: Egyptian Material Library (DELIVERED) ---
Item_5_Name="Egyptian Material Library"
Item_5_Category="Data/Assets"
Item_5_Status="Completed ✅"
Item_5_Est_Effort="Low (1 day)"
Item_5_Est_Risk="Low"
Item_5_Depends_On="#2 viewer"
Item_5_Tech_Stack="JSON, Three.js Materials, TypeScript"
Item_5_Files="egyptian-materials.json, MaterialLibrary.ts"
Item_5_Location="$REPO/apps/frontend/src/data/materials/egyptian-materials.json"
Item_5_Location2="$REPO/apps/frontend/src/lib/materials/MaterialLibrary.ts"
Item_5_Verification="JSON valid + tsc clean"
Item_5_Materials="mashrabiya-wood (1,170 EGP), limestone-nile (1,980 EGP), granite-red-aswan (3,500 EGP), marble-carrara-proxy (5,000 EGP), cotton-damask-egyptian (570 EGP)"

# --- #6: Season/Ramadan Scene Presets ---
Item_6_Name="Season/Ramadan Scene Presets"
Item_6_Category="Assets/Lighting"
Item_6_Status="Ready → In Progress"
Item_6_Est_Effort="Low (1 day)"
Item_6_Est_Risk="Low"
Item_6_Depends_On="#5 materials (unlocked ✅)"
Item_6_Tech_Stack="GLTF scenes, lighting configs, season-presets.json"
Item_6_Files="season-presets.json"
Item_6_Location="$REPO/apps/frontend/src/data/presets/season-presets.json"
Item_6_Notes="4 presets: Ramadan 2026, Winter Solstice, Summer Noon, Autumn Harvest"

# --- #7: Automated Cost Estimator ---
Item_7_Name="Automated Cost Estimator"
Item_7_Category="Automation"
Item_7_Status="Backlog"
Item_7_Est_Effort="High (4 days)"
Item_7_Est_Risk="Med"
Item_7_Depends_On="#5 materials"
Item_7_Tech_Stack="TypeScript, PDF generation, material counting"
Item_7_Files="None yet"

# --- #8: 3D Asset Marketplace ---
Item_8_Name="3D Asset Marketplace"
Item_8_Category="Product/Platform"
Item_8_Status="Backlog"
Item_8_Est_Effort="High (1 week)"
Item_8_Est_Risk="Med"
Item_8_Depends_On="#5 library"
Item_8_Tech_Stack="Self-hosted store, GLB hosting"
Item_8_Files="None yet"

# ============================================================
# EXECUTION ORDER
# ============================================================
Execution_Order="
1. #2 Real-Time Web Viewer     → DONE (S022.1)
2. #5 Egyptian Material Library → DONE (S022.1)
3. #6 Ramadan Scene Presets     → IN PROGRESS (S022.2) — unblocked by #5
4. #1 AI Style-Transfer         → NEXT (S022.3) — quick win, low risk
5. #3 GPU Render Farm            → FUTURE — depends on #2
6. #4 VR Review Portal           → FUTURE — depends on #2
7. #7 Cost Estimator             → FUTURE — depends on #5
8. #8 Asset Marketplace          → FUTURE — depends on #5
"

# ============================================================
# VERIFICATION CHECKLIST (run before closing a card)
# ============================================================
Verification_Checklist="
- [ ] File written to correct path
- [ ] tsc --noEmit passes (zero errors)
- [ ] /studio or relevant route returns HTTP 200
- [ ] Kanban + JustFilmk board updated
- [ ] All dependencies checked
"
