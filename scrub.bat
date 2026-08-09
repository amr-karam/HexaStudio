@echo off
powershell -ExecutionPolicy Bypass -Command "Get-ChildItem -Recurse -Filter 'AUTONOMOUS-DEPLOYMENT-GUIDE.md' | ForEach-Object {  = Get-Content .FullName -Raw;  =  -replace 'cfk_CsOmAm6voORiPLSjRvH3J2H9iNMYjlwJv5zHVysZ7b22cd39', '';  =  -replace '\[REDACTED-2026-08-08-ROTATE-VIA-CLOUDFLARE-DASHBOARD\]', '';  | Set-Content .FullName -NoNewline; Write-Host 'Fixed: ' .FullName }"
