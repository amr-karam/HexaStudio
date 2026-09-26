Get-ChildItem -Recurse -Filter 'AUTONOMOUS-DEPLOYMENT-GUIDE.md' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'cfk_CsOmAm6voORiPLSjRvH3J2H9iNMYjlwJv5zHVysZ7b22cd39', ''
    $content = $content -replace '\[REDACTED-2026-08-08-ROTATE-VIA-CLOUDFLARE-DASHBOARD\]', ''
    Set-Content $_.FullName $content -NoNewline
    Write-Host "Fixed: $($_.FullName)"
}
