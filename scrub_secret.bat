@echo off
setlocal enabledelayedexpansion

for /r %%f in (*) do (
    if /i "%%~xf"=="md" (
        set "filepath=%%f"
        set "content="
        for /f "usebackq delims=" %%l in ("%%f") do (
            set "line=%%l"
            set "line=!line:cfk_CsOmAm6voORiPLSjRvH3J2H9iNMYjlwJv5zHVysZ7b22cd39=!"
            set "line=!line:[REDACTED-2026-08-08-ROTATE-VIA-CLOUDFLARE-DASHBOARD]="
            set "content=!content!!line!!newline!"
        )
        echo(!content! > "%%f"
    )
)
echo Scrub complete.
