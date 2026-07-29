# EAS Build & App Store Setup Guide

> **Owner:** DevOps (@devops)  
> **Sprint:** S-020  
> **Priority:** P1  
> **Related:** `.gitlab-ci.yml` (mobile stage), `apps/mobile/eas.json`, `apps/mobile/app.json`

---

## Prerequisites

| Requirement | Version / Notes |
|-------------|----------------|
| Node.js | 20.x (match CI `NODE_VERSION`) |
| npm | 11.x |
| Expo CLI | Latest (`npx expo`) |
| EAS CLI | ≥ 12.0.0 (bundled with Expo) |
| Apple Developer | Paid account ($99/yr) |
| Google Play Console | Paid account ($25 one-time) |

---

## 1. Create an Expo / EAS Account

1. Go to https://expo.dev and sign up (or sign in with GitHub/GitLab/Google).
2. Verify your email address.
3. Navigate to **Account Settings → Personal Access Tokens**.
4. Click **Generate new token** with scopes:
   - `Access all projects`
   - `Read & Write`
5. Copy the generated token — it will only be shown once.

> **⚠️ Security:** Store this token immediately in your password manager. It is your **EXPO_TOKEN** for CI/CD.

---

## 2. Initialize the EAS Project

Run `eas init` inside the mobile app directory:

```bash
cd apps/mobile
npx eas init
```

This will:

- Authenticate with your Expo account (browser popup or prompt for token).
- Prompt for a project name — use **`hexastudio-mobile`** (must match the `slug` in `app.json`).
- Generate a project ID (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

Upon success, you'll see:

```
✔ Project created: hexastudio-mobile (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
```

> **Troubleshooting:** If `eas init` fails with "already exists", run `eas init --force` to overwrite or use `eas init --existing` to link to an existing Expo project.

---

## 3. Update `app.json` with the Real Project ID

Edit `apps/mobile/app.json` and replace the `${EAS_PROJECT_ID}` placeholders:

| Field | Value |
|-------|-------|
| `expo.updates.url` | `https://u.expo.dev/<YOUR_PROJECT_ID>` |
| `expo.extra.eas.projectId` | `<YOUR_PROJECT_ID>` |

Example:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    },
    "extra": {
      "eas": {
        "projectId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
      }
    }
  }
}
```

---

## 4. Set GitLab CI/CD Variables

Navigate to **Settings → CI/CD → Variables** in your GitLab project.

Add the following variables:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `EXPO_TOKEN` | The personal access token from Step 1 | ✅ Yes | ✅ Yes |
| `EAS_PROJECT_ID` | The UUID from Step 2 (`xxxxxxxx-...`) | ✅ Yes | No |

To set them via CLI (requires GitLab personal access token with `api` scope):

```bash
# From project root
glab variable set EXPO_TOKEN "$EXPO_TOKEN" --protected --masked
glab variable set EAS_PROJECT_ID "$EAS_PROJECT_ID" --protected
```

> **⚠️ `EXPO_TOKEN` must be masked** to prevent exposure in job logs.  
> `EAS_PROJECT_ID` is a UUID and does not need masking.

---

## 5. Upload iOS Credentials

### 5.1. Prerequisites (Apple Developer Portal)

- An active **Apple Developer Program** membership.
- An **App ID** matching the bundle identifier (`com.hexastudio.mobile`).
- An **App Store Connect** record for the app (create one if it doesn't exist yet).

### 5.2. Run `eas credentials`

```bash
cd apps/mobile
npx eas credentials --platform ios
```

Follow the interactive prompts to:

1. **Authenticate** with your Apple Developer account (App Store Connect API key is recommended; a session-based Apple ID login is also supported but less durable).
2. **Create or reuse** a distribution certificate.
3. **Create or reuse** a push notification certificate.
4. **Create or reuse** a provisioning profile for production distribution.

EAS will store all credentials securely in EAS Secrets. To verify:

```bash
npx eas credentials --platform ios
```

Expected output should show **Status: ✅ All credentials are set up**.

### 5.3. Update `eas.json` (if using App Store Connect API Key)

If you opted for an **App Store Connect API Key** (recommended over Apple ID password), add it to `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple-id.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAMID12345",
        "ascApiKeyPath": "./path/to/AuthKey_XXXXXXXXXX.p8"
      }
    }
  }
}
```

Replace the placeholder values in `apps/mobile/eas.json`:
- `APPLE_ID_PLACEHOLDER` → your Apple ID email
- `ASC_APP_ID_PLACEHOLDER` → your App Store Connect app ID (numeric)
- `APPLE_TEAM_ID_PLACEHOLDER` → your Apple Developer team ID (alphanumeric, 10 chars)

---

## 6. Configure APNs Key for Push Notifications (iOS)

Expo handles push notification infrastructure, but it needs an **APNs key** to send notifications to iOS devices.

### 6.1. Generate an APNs Key

1. Go to https://developer.apple.com/account/resources/authkeys/list.
2. Click **+** → **Apple Push Notifications service (APNs)**.
3. Download the `.p8` file and note the **Key ID**.
4. Click **Done**.

### 6.2. Upload to EAS

```bash
npx eas credentials --platform ios
```

Select **Push Notifications** → **Use existing certificate** → **Upload your own**.

Or inject via environment variable:

```bash
eas secret:create --name EXPO_IOS_APNS_KEY --value "$(cat AuthKey_XXXXXXXXXX.p8)" --scope project
eas secret:create --name EXPO_IOS_APNS_KEY_ID --value "XXXXXXXXXX" --scope project
eas secret:create --name EXPO_IOS_APNS_TEAM_ID --value "TEAMID12345" --scope project
```

---

## 7. Configure FCM for Android Push Notifications

### 7.1. Generate a Firebase Cloud Messaging (FCM) Key

1. Go to https://console.firebase.google.com/.
2. Select or create a Firebase project for HEXA Studio.
3. Add an **Android app** with package name `com.hexastudio.mobile`.
4. Download `google-services.json` and place it at `apps/mobile/google-services.json`.
5. In Firebase Console, go to **Project Settings → Cloud Messaging**.
6. Copy the **Server key** (Legacy) or **FCM OAuth 2.0 token**.

### 7.2. Register the FCM Key with Expo

```bash
npx eas credentials --platform android
```

Select **Push Notifications** → **Upload FCM key**.

Or via secret:

```bash
eas secret:create --name EXPO_ANDROID_FCM_KEY --value "YOUR_FCM_SERVER_KEY" --scope project
```

### 7.3. Add `google-services.json` to `.gitignore` (already done if using EAS)

EAS Build can reference `google-services.json` via:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

> **⚠️** Never commit `google-services.json` to Git. Add it to `.gitignore` and pass it via EAS Secrets or environment.

---

## 8. Upload Android Credentials

### 8.1. Prerequisites (Google Play Console)

- A **Google Play Console** account with a published app or a draft listing.
- The app must have the **App signing** and **Play App Signing** certificates configured.

### 8.2. Run `eas credentials`

```bash
cd apps/mobile
npx eas credentials --platform android
```

Follow the prompts to:

1. Generate or upload an **Android Keystore** (EAS will manage this automatically if you use `--credentialsSource remote`).
2. Generate a **Google Service Account JSON key** for Play Console uploads.

### 8.3. Upload Service Account Key for Automated Submissions

1. In Google Play Console, go to **Setup → API access**.
2. Create a **Service Account** and grant it **Release Manager** permissions.
3. Generate a **JSON key** and download it.
4. Register it with EAS:

```bash
eas secret:create --name EXPO_ANDROID_SERVICE_ACCOUNT --value "$(cat play-service-account.json)" --scope project
```

Update `eas.json` to reference it:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./play-service-account.json"
      }
    }
  }
}
```

---

## 9. Verify the Full Pipeline

### 9.1. Test Build Locally

```bash
cd apps/mobile
npx eas build --platform all --profile development --non-interactive
```

This validates:
- Correct project ID and Expo token.
- Credentials are properly configured.
- Sharp assets are generated (ensure `generate-assets.js` has been run first).

### 9.2. Test Submit (Dry Run)

```bash
npx eas submit --platform all --profile production --non-interactive --dry-run
```

The `--dry-run` flag validates configuration without uploading.

### 9.3. Full CI Test

- Push to a branch (not `main`) to verify `mobile-typecheck` and `mobile-test` pass.
- Open an MR to verify the quality jobs run on MR events.
- Merge to `main` and manually trigger `build-mobile` from the GitLab pipeline UI.
- If the build succeeds, manually trigger `submit-mobile`.

---

## 10. Rollback & Recovery

| Scenario | Action |
|----------|--------|
| Build fails — missing EXPO_TOKEN | Check CI/CD variables are set and masked correctly |
| Build fails — EAS_PROJECT_ID mismatch | Verify `app.json` URLs match the `eas init` output |
| Submit fails — Apple credentials | Re-run `eas credentials --platform ios` to refresh |
| Submit fails — Android keystore | Re-run `eas credentials --platform android` |
| Push notifications not working | Verify APNs key (iOS) and FCM key (Android) in EAS Secrets |

---

## Reference: Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `EXPO_TOKEN` | GitLab CI/CD → Variables | EAS CLI authentication |
| `EAS_PROJECT_ID` | GitLab CI/CD → Variables | EAS project UUID |
| `EXPO_IOS_APNS_KEY` | EAS Secrets | APNs .p8 key for iOS push |
| `EXPO_IOS_APNS_KEY_ID` | EAS Secrets | APNs key ID |
| `EXPO_IOS_APNS_TEAM_ID` | EAS Secrets | Apple Team ID |
| `EXPO_ANDROID_FCM_KEY` | EAS Secrets | FCM server key for Android push |
| `EXPO_ANDROID_SERVICE_ACCOUNT` | EAS Secrets | Google Play service account JSON |

---

## Related Files

| File | Purpose |
|------|---------|
| `apps/mobile/eas.json` | Build profile & submit configuration |
| `apps/mobile/app.json` | Expo project config with EAS project ID |
| `.gitlab-ci.yml` | CI/CD pipeline with mobile stage |
| `apps/mobile/scripts/generate-assets.js` | Sharp-based asset generation |