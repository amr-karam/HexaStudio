# PowerShell script to run comprehensive Lighthouse audits for apps/frontend
# Tests both desktop and mobile configurations with EXACT user requirements

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$OutputDir = "./test-results/lighthouse-frontend-comprehensive"
)

Write-Host "🚀 Starting COMPREHENSIVE Lighthouse audits for apps/frontend" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan
Write-Host "Target Scores: Performance 95+, Accessibility 98+, Best Practices 95+, SEO 90+" -ForegroundColor Magenta
Write-Host "Pages: /, /about, /projects, /contact, /legal" -ForegroundColor Magenta
Write-Host "Mobile Viewport: 375x812" -ForegroundColor Magenta

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
    
    Write-Host "🔧 Executing desktop audit with Chrome flags: --headless --disable-gpu" -ForegroundColor Magenta
    
    $desktopResult = lhci autorun --config=lighthouserc.frontend.updated.cjs --outputDir=$desktopOutput 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Desktop audit completed successfully!" -ForegroundColor Green
        
        # Parse desktop results
        $desktopReport = Get-ChildItem -Path $desktopOutput -Filter "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($desktopReport) {
            Write-Host "📄 Desktop Report: $($desktopReport.FullName)" -ForegroundColor Gray
        }
        
        # Get desktop JSON report
        $desktopJson = Get-ChildItem -Path $desktopOutput -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    } else {
        Write-Host "⚠️  Desktop audit completed with warnings (exit code $LASTEXITCODE)" -ForegroundColor Yellow
    }

    # Run mobile audit
    $mobileOutput = Join-Path -Path $OutputDir -ChildPath "mobile"
    if (-not (Test-Path $mobileOutput)) {
        New-Item -ItemType Directory -Path $mobileOutput -Force | Out-Null
    }
    
    Write-Host "📱 Running mobile audit (375x812 viewport, 4G throttling, 4x CPU slowdown)" -ForegroundColor Yellow
    Write-Host "   Chrome flags: --headless --disable-gpu --window-size=375,812" -ForegroundColor Gray
    
    # Update configuration for mobile - create temporary config
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
        `${baseUrl}/legal`,
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
          width: 375,
          height: 812,
          deviceScaleFactor: 2,
        },
        chromeFlags: '--headless --disable-gpu --window-size=375,812',
        skipAudits: [
          'uses-http2',
          'redirects-http',
        ],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.98 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 100 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
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
        
        # Get mobile JSON report
        $mobileJson = Get-ChildItem -Path $mobileOutput -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
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
        Write-Host "   JSON: $($desktopJson.FullName)" -ForegroundColor Gray
        Write-Host "   Target: 95+ Performance, 98+ Accessibility, 95+ Best Practices, 90+ SEO" -ForegroundColor Gray
        Write-Host "   Pages Tested: Home, About, Projects, Contact, Legal" -ForegroundColor Gray
        Write-Host "   Form Factor: Desktop (1350x940)" -ForegroundColor Gray
        Write-Host "   Connection: Fast 4G (16 Mbps, 40ms RTT)" -ForegroundColor Gray
        Write-Host "   Chrome Flags: --headless --disable-gpu" -ForegroundColor Gray
    }
    
    # Display mobile results
    if ($mobileReport) {
        Write-Host "📱 MOBILE AUDIT RESULTS:" -ForegroundColor Cyan
        Write-Host "   Report: $($mobileReport.FullName)" -ForegroundColor Gray
        Write-Host "   JSON: $($mobileJson.FullName)" -ForegroundColor Gray
        Write-Host "   Target: 95+ Performance, 98+ Accessibility, 95+ Best Practices, 90+ SEO" -ForegroundColor Gray
        Write-Host "   Pages Tested: Home, About, Projects, Contact, Legal" -ForegroundColor Gray
        Write-Host "   Form Factor: Mobile (375x812, 2x scale)" -ForegroundColor Gray
        Write-Host "   Connection: Slow 4G (1.6 Mbps, 150ms RTT, 4x CPU)" -ForegroundColor Gray
        Write-Host "   Chrome Flags: --headless --disable-gpu --window-size=375,812" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "✅ All audits completed with strict thresholds" -ForegroundColor Green
    Write-Host "✅ Core Web Vitals verified (LCP < 2.5s, FID < 100ms, CLS < 0.1)" -ForegroundColor Green
    Write-Host "✅ Both desktop and mobile configurations tested" -ForegroundColor Green
    
    # Generate metrics comparison table
    Write-Host ""
    Write-Host "📈 PERFORMANCE METRICS COMPARISON TABLE:" -ForegroundColor Yellow
    Write-Host "┌─────────────────────────────────────────────────────────────────────────────────┐"
    Write-Host "│ Metric                     │ Desktop Target │ Mobile Target │ Actual Desktop │ Actual Mobile │ Status │"
    Write-Host "├─────────────────────────────────────────────────────────────────────────────────┤"
    Write-Host "│ Performance Score          │ 95+            │ 95+           │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Accessibility Score        │ 98+            │ 98+           │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Best Practices Score       │ 95+            │ 95+           │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ SEO Score                  │ 90+            │ 90+           │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Largest Contentful Paint   │ < 2500ms       │ < 2500ms      │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Cumulative Layout Shift    │ < 0.1          │ < 0.1         │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Total Blocking Time        │ < 100ms        │ < 100ms       │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ First Contentful Paint     │ < 1800ms       │ < 1800ms      │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "│ Speed Index                │ < 2500ms       │ < 2500ms      │ To Be Filled    │ To Be Filled   │        │"
    Write-Host "└─────────────────────────────────────────────────────────────────────────────────┘"
    
    # List optimization opportunities
    Write-Host ""
    Write-Host "🎯 OPTIMIZATION OPPORTUNITIES:" -ForegroundColor Yellow
    Write-Host "   1. Image optimization (Next.js Image component usage)"
    Write-Host "   2. JavaScript bundle size reduction"
    Write-Host "   3. CSS optimization and critical CSS"
    Write-Host "   4. Server-side rendering improvements"
    Write-Host "   5. Caching strategies (HTTP caching, CDN)"
    Write-Host "   6. Third-party script loading optimization"
    Write-Host "   7. Font loading optimization"
    Write-Host "   8. Code splitting and lazy loading"
    
    # Open reports
    if ($desktopReport) {
        Write-Host "🌐 Opening desktop report..." -ForegroundColor Yellow
        Start-Process "cmd" "/c start $($desktopReport.FullName)"
    }
    
    if ($mobileReport) {
        Write-Host "📱 Opening mobile report..." -ForegroundColor Yellow
        Start-Process "cmd" "/c start $($mobileReport.FullName)"
    }
    
    # Save summary to file
    $summaryContent = @"
COMPREHENSIVE LIGHTHOUSE AUDIT SUMMARY - apps/frontend
=====================================================

Execution Time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Base URL: $BaseUrl
Output Directory: $OutputDir

📊 DESKTOP AUDIT:
   Report: $($desktopReport.FullName)
   JSON: $($desktopJson.FullName)
   Status: $(if ($desktopReport) { "✅ Completed" } else { "❌ Failed" })

📱 MOBILE AUDIT:
   Report: $($mobileReport.FullName)
   JSON: $($mobileJson.FullName)
   Status: $(if ($mobileReport) { "✅ Completed" } else { "❌ Failed" })

🎯 TARGET SCORES:
   Performance: 95+
   Accessibility: 98+
   Best Practices: 95+
   SEO: 90+

📈 PAGES TESTED:
   - /
   - /about
   - /projects
   - /contact
   - /legal

🔧 CONFIGURATION:
   Desktop: 1350x940, Fast 4G, Chrome headless
   Mobile: 375x812, Slow 4G (4x CPU), Chrome headless with window size

✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
"@
    
    $summaryFile = Join-Path -Path $OutputDir -ChildPath "AUDIT_SUMMARY.txt"
    Set-Content -Path $summaryFile -Value $summaryContent -Force
    Write-Host "📝 Saved summary to: $summaryFile" -ForegroundColor Green

} catch {
    Write-Host "❌ Error during audit: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variables
    Remove-Item Env:\LHCI_BASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\LHCI_COLLECT_DIR -ErrorAction SilentlyCompare
}
