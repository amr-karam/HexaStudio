# HEXA Studio Mobile

React Native client portal for HEXA Studio — view projects, milestones, and manage notifications on the go.

## Tech Stack

- **Expo SDK 53** with **Expo Router v4**
- **React Native 0.77** + **React 19**
- **TypeScript 5.8**
- Shared packages: `@hexastudio/types`, `@hexastudio/utils`
- Icons: `@expo/vector-icons` (Ionicons)
- Storage: `@react-native-async-storage/async-storage`
- Network: `@react-native-community/netinfo`

## Setup

```bash
# From the monorepo root
npm install --legacy-peer-deps

# Start the mobile app
npm run start --workspace=apps/mobile
# or: npm run dev:mobile
```

## Scripts

| Script | Description |
|---|---|
| `start` | Expo dev server |
| `android` | Android emulator |
| `ios` | iOS simulator |
| `web` | Web browser |
| `lint` | ESLint flat config |
| `typecheck` | TypeScript strict |
| `test` | Jest (25+ tests, 8 suites) |

## Architecture

```
src/
  app/
    _layout.tsx              # Root layout (providers + banners)
    login.tsx                # Sign in (modal)
    (tabs)/
      _layout.tsx            # Tab bar: Dashboard / Projects / Notifications / Profile
      index.tsx              # Home — portal dashboard
      projects/
        index.tsx            # Odoo project list
        [id].tsx             # Project detail + milestones
      notifications/
        index.tsx            # Preference toggles
      profile/
        index.tsx            # Sign out / profile card
  components/
    ThemeProvider.tsx         # Dark luxury theme (obsidian + gold)
    OfflineBanner.tsx         # Offline detection banner
    UpdateBanner.tsx          # OTA update prompt
    Banners.tsx               # Stacked banner container
    ContentSkeleton.tsx       # Pulsing placeholder
  hooks/
    useAuth.tsx               # Auth: login, session restore, logout
    useNetworkStatus.ts       # NetInfo connectivity hook
    useNotifications.ts       # Push token registration + response routing
    useOTAUpdates.ts          # Expo Updates check / download / restart
  lib/
    api.ts                    # API client with offline-first cache
    cache.ts                  # AsyncStorage TTL cache
    notifications.ts          # Local notification helpers
```

## Features

- **Auth**: `POST /api/auth/login` → SecureStore JWT → `GET /api/auth/me` session restore → `POST /api/auth/logout` server-side revocation
- **Dashboard**: `GET /api/portal/me` with milestone progress ring and invoice summary
- **Projects**: `GET /api/portal/odoo/projects` with cached offline-first list; `GET /api/portal/projects/:id/detail` for project detail + milestones
- **Notifications**: `GET/PUT /api/portal/notifications/preferences` with 5 toggle switches
- **Push Notifications**: `expo-notifications` integration → `POST /api/mobile/push/register` stores the Expo push token per user (Redis)
- **Offline-First**: API layer wraps requests with `AsyncStorage` TTL cache; cached data is shown when the device is offline with an animated banner
- **OTA Updates**: `expo-updates` checks for new JS bundles on launch; shows a download banner and restart prompt when an update is ready
- **App Store Assets**: Icons, splash screen, adaptive icon, notification icon, and favicon live in `assets/` and are configured in `app.json`

## Release / Store Notes

- `app.json` is configured for EAS Update with a placeholder project ID (`00000000-0000-0000-0000-000000000000`). Replace it with the real EAS project ID before building.
- Push notification credentials (APNs/FCM) must be configured in Expo/EAS before production push works.
- Placeholder assets were generated in `assets/`; replace them with final brand artwork before App Store submission.
