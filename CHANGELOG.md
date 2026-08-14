# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-08-14

### Fixed

#### User-Facing
- **Frontend**: Resolved `NotFoundError: Failed to execute 'insertBefore' on 'Node'` runtime crash on `/projects` page ([bab0ae4](https://github.com/amr-karam/HexaStudio/commit/bab0ae463f886ff6d8cebe459f775dfcb3bd0ce3)):
  - Rewrote `TextSplit` to declarative JSX rendering with GSAP refs to prevent DOM reconciliation conflicts caused by imperative innerHTML mutations.
  - Converted `ProjectGrid` from CSS multi-column layout (`columns-*`) to CSS Grid to fix `framer-motion` popLayout FLIP measurement inaccuracies and phantom reference node insertions.
  - Moved `PageTransition` render-phase state update into `useEffect` to prevent curtain animation collisions during page transitions.

#### Infrastructure & CI
- **CI/CD**: Removed unsupported `--cache-to type=registry` and `--cache-from` flags when building images with the standard Docker driver in GitLab CI ([70dd400](https://github.com/amr-karam/HexaStudio/commit/70dd4001de7f5fa2de5ff1f0f5d00763729977be)).
- **CI/CD**: Switched Docker buildx from `docker-container` driver to default `docker` driver to eliminate DinD TCP upgrade failure (404) and switched cache mode to inline ([486b8b9](https://github.com/amr-karam/HexaStudio/commit/486b8b992444eff1890e925c481028cb0b65f247)).

### Added
- **Architecture & Observability**: Added ADR-014 defining the enhanced observability and standardized health check architecture (`/health` and `/admin/health`), service contracts, and Prometheus metrics ([b185da1](https://github.com/amr-karam/HexaStudio/commit/b185da18a27ac8f46a91462c630898ccdbc2485d)).

### Changed
- **Dependencies**: Updated Babel plugin dev packages (`@babel/plugin-*`) and resolved package integrity hashes in the lockfile ([89d7d77](https://github.com/amr-karam/HexaStudio/commit/89d7d778efe5931d37c9a1b16d2c124637692401)).
