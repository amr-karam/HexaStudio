# 🗺️ DOMAIN MODEL: THE DATA ONTOLOGY

**Version:** 1.0 | **Domain:** Architecture | **Focus:** Entity Relationships

## 1. THE CORE ENTITIES
The HEXA Vision ecosystem is built around four primary domains: **Identity**, **Project**, **Asset**, and **Experience**.

---

## 2. ENTITY DEFINITIONS

### I. Project (The Central Hub)
The primary unit of value. A Project represents a physical architectural work.
- **Attributes:** `id`, `slug`, `title`, `client`, `location`, `year`, `category`, `description`.
- **Relationships:** Has many `Assets`, has one `ProjectManifest`, belongs to one `Architect`.

### II. Asset (The Visual Component)
The individual 3D or 2D files that make up a project.
- **Attributes:** `id`, `projectId`, `type` (Mesh, Texture, HDR), `url`, `lodLevel`, `metadata`.
- **Relationships:** Belongs to one `Project`.

### III. ProjectManifest (The Scene Blueprint)
A specialized entity that defines how assets are arranged in the 3D space.
- **Attributes:** `id`, `projectId`, `initialCameraPosition`, `hotspots`, `lightingConfig`, `assetMap`.
- **Relationships:** Belongs to one `Project`.

### IV. User/Client (The Identity)
The person interacting with the platform.
- **Attributes:** `id`, `email`, `role` (Admin, Client, Guest), `preferences`.
- **Relationships:** Has access to many `Projects`.

---

## 3. RELATIONSHIP MAP (ERD LOGIC)

- **Project $\rightarrow$ Assets:** One-to-Many (A project consists of many 3D models and textures).
- **Project $\rightarrow$ Manifest:** One-to-One (Each project has one master scene configuration).
- **Client $\rightarrow$ Projects:** Many-to-Many (A client may have multiple projects; a project may be shared among multiple clients).
- **Architect $\rightarrow$ Projects:** One-to-Many (One architect manages multiple projects).

---

## 4. DATA FLOW CONSTRAINTS
- **Immutable History:** Project manifests are versioned. Changing a manifest creates a new version rather than overwriting the old one.
- **Strict Ownership:** Assets cannot exist without a parent Project.
- **Referential Integrity:** Deleting a project must trigger a cascade delete of its associated manifest and asset links (unless archived).

---

## 5. EXTENSIBILITY
The model is designed to support future additions:
- **Interactive Elements:** Adding `Interaction` entities to the manifest for clickable hotspots.
- **Material Variants:** Adding `MaterialOption` to allow users to switch between marble and wood in real-time.
- **AI Metadata:** Adding `AI_Analysis` entities to store automatically generated descriptions of the architecture.

*“A strong domain model is the foundation of a stable system.”*
