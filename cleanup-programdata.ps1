Write-Host "=== Cleaning C:\ProgramData protected folders ===" -ForegroundColor Cyan

# Stop Symantec service if running
if (Get-Service -Name "*Symantec*" -ErrorAction SilentlyContinue) {
    Stop-Service -Name "*Symantec*" -Force -ErrorAction SilentlyContinue
}

$targets = @(
    "C:\ProgramData\Symantec",
    "C:\ProgramData\Package Cache",
    "C:\ProgramData\NVIDIA GPU Computing Toolkit",
    "C:\ProgramData\chocolatey_backup"
)

foreach ($path in $targets) {
    if (Test-Path $path) {
        Write-Host "Deleting: $path" -ForegroundColor Yellow
        takeown /f "$path" /r /d y 2>$null
        icacls "$path" /grant Administrators:F /t /q 2>$null
        Remove-Item -LiteralPath "$path" -Recurse -Force -ErrorAction Stop
        Write-Host "  Deleted!" -ForegroundColor Green
    } else {
        Write-Host "Already gone: $path" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Disk space after cleanup ===" -ForegroundColor Cyan
Get-PSDrive C | Select-Object Used, @{N='FreeGB';E={[math]::Round($_.Free/1GB,2)}}
