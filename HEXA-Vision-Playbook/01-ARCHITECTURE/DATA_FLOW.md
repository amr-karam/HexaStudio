# 🌊 DATA FLOW: THE INFORMATION STREAM

**Version:** 1.0 | **Domain:** Architecture | **Focus:** Data Lifecycle

## 1. THE DATA PIPELINE PHILOSOPHY
In HEXA Vision, data is not just "fetched"; it is **curated**. We move from **High-Volume/Low-Structure** (Raw Assets) to **Low-Volume/High-Structure** (Experience-Ready JSON).

---

## 2. THE THREE STAGES OF FLOW

### I. The Ingestion Stage (Content $\rightarrow$ CMS)
- **Source:** Architect uploads GLB files and metadata to Strapi.
- **Process:** Strapi validates the content and pushes the heavy binaries to MinIO.
- **Result:** A "Raw Asset" exists in the cloud, linked to a Strapi entry.

### II. The Orchestration Stage (CMS $\rightarrow$ BFF)
- **Trigger:** Next.js requests a Project Manifest.
- **Process:** NestJS queries Strapi for the project structure and resolves all asset URLs.
- **Optimization:** NestJS strips unused metadata and compresses the JSON payload.
- **Result:** An "Experience-Ready Manifest" is delivered to the frontend.

### III. The Consumption Stage (BFF $\rightarrow$ Frontend)
- **Trigger:** The manifest arrives at the Next.js client.
- **Process:** R3F parses the manifest and begins asynchronous loading of assets.
- **Caching:** Assets are cached locally via the browser and Redis at the edge.
- **Result:** A seamless, high-fidelity 3D scene is rendered.

---

## 3. THE STATE SYNC FLOW (REAL-TIME)

When a user interacts with the scene (e.g., changes a material):
1. **Input:** User selects "Marble" in the UI.
2. **Local Update:** Zustand updates the local state $\rightarrow$ R3F updates the material immediately.
3. **Persistence:** Next.js sends a `PATCH` request to NestJS $\rightarrow$ Strapi updates the project preference.
4. **Sync:** Other connected clients (if any) receive a WebSocket update to sync the change.

---

## 4. PERFORMANCE BOTTLENECKS & MITIGATIONS

| Potential Bottleneck | Mitigation Strategy |
|----------------------|----------------------|
| **Large GLB Files** | Draco compression + Progressive loading |
| **Slow CMS Queries** | Redis caching at the BFF layer |
| **Network Latency** | Cloudflare Edge caching for assets |
| **JS Main Thread Block**| Offloading heavy calculations to Web Workers |

*“Data should move like water: effortless, directed, and pure.”*
