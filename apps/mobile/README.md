# HEXA Studio Mobile

React Native mobile application for the HEXA Studio client portal.

## Tech Stack

- **Expo SDK 51** with **Expo Router**
- **React Native 0.74**
- **TypeScript**
- Shared packages: `@hexastudio/types`, `@hexastudio/utils`

## Setup

```bash
# From the monorepo root
npm install --legacy-peer-deps

# Start the mobile app
npm run start --workspace=apps/mobile
```

## Scripts

| Script | Description |
|--------|-------------|
| `start` | Start Expo dev server |
| `android` | Run on Android emulator |
| `ios` | Run on iOS simulator |
| `web` | Run in web browser |
| `lint` | ESLint |
| `typecheck` | TypeScript |
| `test` | Jest |

## Structure

```
app/
  (tabs)/           # Tab navigation
    index.tsx        # Home screen
    projects/        # Projects list
    profile/         # User profile
  login.tsx          # Login modal
components/
  ThemeProvider.tsx  # Dark luxury theme
hooks/
  useAuth.tsx        # Auth context with SecureStore
lib/
```

## Notes

- Authentication uses `/api/auth/login` and stores tokens in `expo-secure-store`.
- The app is scoped to the client portal (read-only project data + document uploads).
