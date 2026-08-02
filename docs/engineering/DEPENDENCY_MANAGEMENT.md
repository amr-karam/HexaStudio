# Dependency Management - HEXA STUDIO

## Dependency Overrides
The root `package.json` currently contains a significant number of dependency overrides:

```json
"overrides": {
  "framer-motion": "^11.18.2",
  "cookie": "^0.7.2",
  "tmp": ">=0.2.2",
  "uuid": "^11.1.1",
  "postcss": "^8.5.10",
  "sharp": "^0.35.3",
  "@types/react": "19.2.17",
  "@xmldom/xmldom": ">=0.9.0",
  "js-yaml": "^5.2.2"
}
```

## Impact & Risks
- **Maintenance Debt:** Overrides mask underlying dependency conflicts and can prevent necessary updates.
- **Security:** Overrides might bypass security patches in direct or transitive dependencies if not monitored carefully.
- **Build Fragility:** Relies on forced resolution rather than resolving upstream conflicts.

## Strategy for Reduction
1. **Audit:** Determine the *reason* for each override (e.g., specific vulnerability, compatibility issue with transitive dependency).
2. **Upgrade:** Attempt to update the top-level dependency that requires the override to a version that naturally resolves the conflict.
3. **Verify:** After removing/updating an override:
   - Run `npm install`
   - Run `npm run build`
   - Run `npm run test`
4. **Iterate:** Address one override at a time to minimize risk.

## Current Status
- Overrides are currently necessary for build stability.
- A long-term goal is to move toward naturally resolvable dependencies.
