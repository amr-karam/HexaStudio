# SPEC: Resolve "Missing API Key" in OpenCode Desktop

## Status
**Completed**

## Problem Statement
Users reported persistent "Missing API key" errors within the OpenCode Desktop application UI. This error indicates that the application's underlying server instances could not locate valid API keys for required LLM providers, preventing model selection and execution.

## Root Cause Analysis (RCA)
The OpenCode Desktop application operates by spawning two sidecar server instances:
1.  **Native Sidecar (Windows):** Runs within the Electron main process, managing local resources.
2.  **WSL Sidecar (Ubuntu):** Spawns an `opencode serve` instance inside the WSL environment (Ubuntu-24.04).

Investigation revealed two critical misconfigurations:
1.  **Native Sidecar:** The global configuration file (`C:\Users\amrmo\.config\opencode\opencode.json`) had an empty API key for the `freetheai` provider, which is required for the default agent models.
2.  **WSL Sidecar:** The WSL environment possessed an empty `opencode.jsonc` file and lacked an `auth.json` file. Because the Desktop app often uses WSL sidecars for project-specific operations, this prevented successful provider/model authentication.
3.  **Caching:** The Desktop UI caches config snapshots. Stale snapshots created *before* the config correction at 06:02 AM were causing the UI to persist the error until a full application restart.

## Implemented Solution
### 1. Global Config Update
The global configuration file was updated to include a valid API key for the `freetheai` provider:
```json
"freetheai": {
  "options": {
    "baseURL": "https://api.freetheai.xyz/v1",
    "apiKey": "sta_1829d5bde9f1966b5323b3c336e2badf81b59689762beae6"
  }
}
```

### 2. WSL Environment Synchronization
To ensure parity between the native and WSL sidecars, the configuration and authentication files were symlinked from the Windows host to the WSL environment. This establishes a single source of truth:
- `/home/amrmondy/.config/opencode/opencode.json` → `/mnt/c/Users/amrmo/.config/opencode/opencode.json`
- `/home/amrmondy/.local/share/opencode/auth.json` → `/mnt/c/Users/amrmo/.local/share/opencode/auth.json`

## Verification
- **Logs:** Renderer logs for the current session (`20260808T031351`) confirm 0 "Missing API key" or configuration load errors.
- **Onboarding:** Onboarding state is verified as `pending: false`.
- **Runtime:** The current session is successfully executing models using the `freetheai` provider.

## Recommendations
- **Full Application Restart:** If the UI still displays the error, perform a full quit (File → Quit) of the OpenCode Desktop application to clear all internal sidecar caches.
- **Config Syncing:** The symlink approach ensures that future changes to the Windows-based configuration are automatically reflected in WSL.
