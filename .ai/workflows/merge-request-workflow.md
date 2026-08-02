# WORKFLOW: GITLAB MERGE REQUEST GOVERNANCE

1. Feature branch created from `develop` (`feature/feature-name`).
2. Local quality gates pass (`npm run lint`, `npm run typecheck`, `npm run test`).
3. Merge Request opened on GitLab targeting `develop`.
4. GitLab CI pipeline triggers `quality`, `build`, and `image` stages.
5. Code review completed and approved by Reviewer agent.
6. Merged to `develop` for Staging deployment.
