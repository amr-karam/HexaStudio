# PowerShell script to run authenticated Lighthouse audit for hexa-hub portal
# This script handles JWT authentication and runs comprehensive audits

param(
    [string]$JwtToken = "test-jwt-token",
    [string]$BaseUrl = "http://localhost:3001",
    [string]$OutputDir = "./test-results/lighthouse-portal"
)

Write-Host "🚀 Starting authenticated Lighthouse audit for hexa-hub portal" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "JWT Token: $($JwtToken.Substring(0, [Math]::Min(20, $JwtToken.Length)))..." -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "✅ Created output directory: $OutputDir" -ForegroundColor Green
}

# Set environment variables for Lighthouse CI
$env:PORTAL_JWT_TOKEN = $JwtToken
$env:LHCI_BASE_URL = $BaseUrl
$env:LHCI_COLLECT_DIR = $OutputDir

# Run Lighthouse CI audit
Write-Host "📊 Running Lighthouse CI audit..." -ForegroundColor Yellow

try {
    # Install LHCI if not already installed
    if (-not (Get-Command lhci -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing LHCI CLI..." -ForegroundColor Yellow
        npm install -g @lhci/cli@0.14.0
    }

    # Run the audit using the portal configuration
    $lhciCommand = "lhci autorun --config=lighthouserc.portal.cjs --upload.target=temporary-public-storage --outputDir=$OutputDir"
    
    Write-Host "🔧 Executing: $lhciCommand" -ForegroundColor Magenta
    
    $result = lhci autorun --config=lighthouserc.portal.cjs --upload.target=temporary-public-storage --outputDir=$OutputDir 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lighthouse audit completed successfully!" -ForegroundColor Green
        
        # Parse and display results
        $reportFiles = Get-ChildItem -Path $OutputDir -Filter "*.html" | Sort-Object LastWriteTime -Descending
        
        if ($reportFiles.Count -gt 0) {
            Write-Host "📄 Generated Lighthouse Reports:" -ForegroundColor Cyan
            foreach ($file in $reportFiles) {
                Write-Host "   📊 $($file.FullName)" -ForegroundColor Gray
            }
            
            # Open the most recent report
            $latestReport = $reportFiles[0].FullName
            Write-Host "🌐 Opening report: $latestReport" -ForegroundColor Yellow
            Start-Process "cmd" "/c start $latestReport"
        }
        
        # Display summary
        Write-Host ""
        Write-Host "📈 Audit Summary:" -ForegroundColor Green
        Write-Host "✅ All audits completed with strict thresholds (95+ score required)" -ForegroundColor Green
        Write-Host "✅ Core Web Vitals verified" -ForegroundColor Green
        Write-Host "✅ Authenticated routes tested" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Lighthouse audit failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Write-Host "📝 Error output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error during audit: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Clean up environment variables
    Remove-Item Env:\PORTAL_JWT_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:\LHCI_BASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\LHCI_COLLECT_DIR -ErrorAction SilentlyContinue
}
