@echo off
setlocal enabledelayedexpansion

for /r %%f in (AUTONOMOUS-DEPLOYMENT-GUIDE.md) do (
    set "content="
    for /f "delims=" %%l in ('type "%%f" 2^>nul') do (
        set "line=%%l"
        set "line=!line:cfk_CsOmAm6voORiPLSjRvH3J2H9iNMYjlwJv5zHVysZ7b22cd39=\!"
        set "line=!line:[REDACTED-2026-08-08-ROTATE-VIA-CLOUDFLARE-DASHBOARD]=\!"
        set "content=!content!%%l!newline!"
    )
    echo(!content!>"%%f"
)
