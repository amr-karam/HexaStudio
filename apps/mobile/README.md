# HEXA Studio Mobile

React Native client portal for HEXA Studio — view projects, milestones, invoices, and manage notifications on the go.

## Tech Stack

- **Expo SDK 53** with **Expo Router v4**
- **React Native 0.77** + **React 19**
- **TypeScript 5.8**
- Shared packages: `@hexastudio/types`, `@hexastudio/utils`
- Icons: `@expo/vector-icons` (Ionicons)

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
| `test` | Jest (10 tests, 5 suites) |

## Architecture

```
src/
  app/
    _layout.tsx              # Root layout (providers + banner)
    login.tsx                # Sign in (modal)
    (tabs)/
      _layout.tsx            # Tab bar (Ionicons, gold accent)
      index.tsx              # Home — portal dashboard
      projects/
        index.tsx            # Odoo project list
        [id].tsx             # Milestone detail
      invoices/
        index.tsx            # Invoice list with amounts
      notifications/
        index.tsx            # Preference toggles
      profile/
        index.tsx            # Sign out / profile card
  components/
    ThemeProvider.tsx         # Dark luxury theme (obsidian + gold)
    NetworkBanner.tsx         # Offline detection banner
    ContentSkeleton.tsx       # Pulsing placeholder
  hooks/
    useAuth.tsx               # Auth: login, session restore, logout
  lib/
    api.ts                    # API client (JWT via SecureStore)
```

## Features

- **Auth**: `POST /api/auth/login` → SecureStore JWT → `GET /api/auth/me` session restore → `POST /api/auth/logout` server-side revocation
- **Projects**: `GET /api/portal/odoo/projects` with milestone detail push
- **Invoices**: `GET /api/portal/odoo/invoices` with payment state badges
- **Dashboard**: `GET /api/portal/me` with milestone progress bar and invoice summary
- **Notifications**: `GET/PUT /api/portal/notifications/preferences` with 5 toggle switches
- **Offline**: Network status banner with 30-second health poll
