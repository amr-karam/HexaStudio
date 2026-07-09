# Contributing to HEXA Studio

Thank you for your interest in contributing to HEXA Studio. This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Git

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/amr-karam/HexaStudio.git
   cd HexaStudio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development:
   ```bash
   npm run dev
   ```

## Branch Strategy

- `main` — Production-ready code
- `develop` — Active development branch
- `feature/*` — New features
- `bugfix/*` — Bug fixes
- `hotfix/*` — Urgent production fixes
- `release/*` — Release preparation

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
build: build system changes
ci: CI/CD changes
chore: maintenance tasks
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Commit with conventional commit format
6. Push and create a Pull Request
7. Request review from maintainers

## Code Quality

- All code must pass ESLint
- All code must pass TypeScript type checking
- All code must have tests (where applicable)
- All PRs require at least one review before merge

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Report security issues privately to security@hexastudio.net

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
