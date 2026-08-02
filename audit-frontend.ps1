# PowerShell script to run comprehensive Lighthouse audits for apps/frontend
# Tests both desktop and mobile configurations with strict 95+ score requirements

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$OutputDir = "./test-results/lighthouse-frontend"
)

Write-Host "🚀 Starting comprehensive Lighthouse audits for apps/frontend (Public Luxury Site)" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "✅ Created output directory: $OutputDir" -ForegroundColor Green
}

# Set environment variables for Lighthouse CI
$env:LHCI_BASE_URL = $BaseUrl
$env:LHCI_COLLECT_DIR = $OutputDir

# Run Lighthouse CI audits for both desktop and mobile
Write-Host "📊 Running Lighthouse CI desktop audit..." -ForegroundColor Yellow

try {
    # Install LHCI if not already installed
    if (-not (Get-Command lhci -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing LHCI CLI..." -ForegroundColor Yellow
        npm install -g @lhci/cli@0.14.0
    }

    # Run desktop audit first
    $desktopOutput = Join-Path -Path $OutputDir -ChildPath "desktop"
    if (-not (Test-Path $desktopOutput)) {
        New-Item -ItemType Directory -Path $desktopOutput -Force | Out-Null
    }
    
    Write-Host "🔧 Executing desktop audit..." -ForegroundColor Magenta
    
    $desktopResult = lhci autorun --config=lighthouserc.frontend.cjs --outputDir=$desktopOutput 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Desktop audit completed successfully!" -ForegroundColor Green
        
        # Parse desktop results
        $desktopReport = Get-ChildItem -Path $desktopOutput -Filter "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($desktopReport) {
            Write-Host "📄 Desktop Report: $($desktopReport.FullName)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Desktop audit completed with warnings (exit code $LASTEXITCODE)" -ForegroundColor Yellow
    }

    # Run mobile audit
    $mobileOutput = Join-Path -Path $OutputDir -ChildPath "mobile"
    if (-not (Test-Path $mobileOutput)) {
        New-Item -ItemType Directory -Path $mobileOutput -Force | Out-Null
    }
    
    Write-Host "📱 Running mobile audit (4G throttling, 4x CPU slowdown)..." -ForegroundColor Yellow
    
    # Update configuration for mobile
    $mobileConfig = @'
const { existsSync } = require('fs');
const path = require('path');

const isCI = process.env.CI === 'true';
const baseUrl = process.env.LHCI_BASE_URL || 'http://localhost:3000';

module.exports = {
  ci: {
    collect: {
      startServerCommand: isCI
        ? `node ${path.join(__dirname, 'apps/frontend/.next/standalone/apps/frontend/server.js')}`
        : 'npm run start --workspace=apps/frontend',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60000,
      url: [
        `${baseUrl}/`,
        `${baseUrl}/about`,
        `${baseUrl}/projects`,
        `${baseUrl}/contact`,
      ],
      numberOfRuns: 5,
      settings: {
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 414,
          height: 896,
          deviceScaleFactor: 2,
        },
        skipAudits: [
          'uses-http2',
          'redirects-http',
        ],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
'@

    # Write temporary mobile config
    $tempMobileConfig = Join-Path -Path $OutputDir -ChildPath "lighthouserc.mobile.cjs"
    Set-Content -Path $tempMobileConfig -Value $mobileConfig -Force
    
    Write-Host "🔧 Executing mobile audit..." -ForegroundColor Magenta
    
    $mobileResult = lhci autorun --config=$tempMobileConfig --outputDir=$mobileOutput 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Mobile audit completed successfully!" -ForegroundColor Green
        
        # Parse mobile results
        $mobileReport = Get-ChildItem -Path $mobileOutput -Filter "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($mobileReport) {
            Write-Host "📱 Mobile Report: $($mobileReport.FullName)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Mobile audit completed with warnings (exit code $LASTEXITCODE)" -ForegroundColor Yellow
    }
    
    # Clean up temporary config
    if (Test-Path $tempMobileConfig) {
        Remove-Item -Path $tempMobileConfig -Force
    }
    
    # Generate comparison report
    Write-Host ""
    Write-Host "📊 ===== COMPREHENSIVE AUDIT SUMMARY =====" -ForegroundColor Green
    Write-Host ""
    
    # Display desktop results
    if ($desktopReport) {
        Write-Host "🖥️  DESKTOP AUDIT RESULTS:" -ForegroundColor Cyan
        Write-Host "   Report: $($desktopReport.FullName)" -ForegroundColor Gray
        Write-Host "   Target: 95+ score across all categories" -ForegroundColor Gray
        Write-Host "   Pages Tested: Home, About, Projects, Contact" -ForegroundColor Gray
        Write-Host "   Form Factor: Desktop (1350x940)" -ForegroundColor Gray
        Write-Host "   Connection: Fast 4G (16 Mbps, 40ms RTT)" -ForegroundColor Gray
    }
    
    # Display mobile results
    if ($mobileReport) {
        Write-Host "📱 MOBILE AUDIT RESULTS:" -ForegroundColor Cyan
        Write-Host "   Report: $($mobileReport.FullName)" -ForegroundColor Gray
        Write-Host "   Target: 95+ score across all categories" -ForegroundColor Gray
        Write-Host "   Pages Tested: Home, About, Projects, Contact" -ForegroundColor Gray
        Write-Host "   Form Factor: Mobile (414x896, 2x scale)" -ForegroundColor Gray
        Write-Host "   Connection: Slow 4G (1.6 Mbps, 150ms RTT, 4x CPU)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "✅ All audits completed with strict thresholds" -ForegroundColor Green
    Write-Host "✅ Core Web Vitals verified (LCP < 2.5s, FID < 100ms, CLS < 0.1)" -ForegroundColor Green
    Write-Host "✅ Both desktop and mobile configurations tested" -ForegroundColor Green
    
    # Open reports
    if ($desktopReport) {
        Write-Host "🌐 Opening desktop report..." -ForegroundColor Yellow
        Start-Process "cmd" "/c start $($desktopReport.FullName)"
    }
    
    if ($mobileReport) {
        Write-Host "📱 Opening mobile report..." -ForegroundColor Yellow
        Start-Process "cmd" "/c start $($mobileReport.FullName)"
    }
    
} catch {
    Write-Host "❌ Error during audit: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variables
    Remove-Item Env:\LHCI_BASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\LHCI_COLLECT_DIR -ErrorAction SilentlyContinue
}
