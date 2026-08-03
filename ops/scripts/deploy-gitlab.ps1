#!/usr/bin/env pwsh
# GitLab CE Deployment Script
# Usage: .\deploy-gitlab.ps1

Write-Host "🚀 GitLab CE Deployment Script" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Running without administrator privileges. Some operations may fail." -ForegroundColor Yellow
    Write-Host "   Consider running PowerShell as Administrator." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Configuration variables
$composeFile = "gitlab-docker-compose.yml"
$containerName = "gitlab-ce"
$hostname = "gitlab.hexastudio.net"

Write-Host "📋 Checking Prerequisites..." -ForegroundColor Cyan

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found or not running" -ForegroundColor Red
    Write-Host "   Please install Docker Desktop and ensure it's running" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Check if compose file exists
if (-not (Test-Path $composeFile)) {
    Write-Host "❌ Compose file not found: $composeFile" -ForegroundColor Red
    Write-Host "   Please ensure gitlab-docker-compose.yml exists in the current directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "
📊 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "   Compose File: $composeFile" -ForegroundColor White
Write-Host "   Container: $containerName" -ForegroundColor White
Write-Host "   Hostname: $hostname" -ForegroundColor White

# Ask for confirmation
Write-Host "
⚠️  IMPORTANT CHECKLIST:" -ForegroundColor Yellow
Write-Host "   [ ] DNS records configured for $hostname -> 19.16.1.100" -ForegroundColor Yellow
Write-Host "   [ ] Port 80 accessible for Let's Encrypt" -ForegroundColor Yellow
Write-Host "   [ ] SMTP credentials updated in docker-compose.yml" -ForegroundColor Yellow
Write-Host "   [ ] Firewall allows ports 80, 443, 22, 5050" -ForegroundColor Yellow

$confirm = Read-Host "
❓ Continue with deployment? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "⏹️  Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "
🚀 Starting GitLab CE Deployment..." -ForegroundColor Green

# Step 1: Pull the latest image
Write-Host "
📥 Step 1/5: Pulling GitLab CE image..." -ForegroundColor Cyan
try {
    docker compose -f $composeFile pull
    Write-Host "✅ Image pulled successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to pull image: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Start containers
Write-Host "
🏃 Step 2/5: Starting GitLab CE container..." -ForegroundColor Cyan
try {
    docker compose -f $composeFile up -d
    Write-Host "✅ Containers started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start containers: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for initialization
Write-Host "
⏳ Step 3/5: Waiting for GitLab to initialize (10-30 minutes)..." -ForegroundColor Cyan
Write-Host "   This may take a while. Monitoring logs..." -ForegroundColor Yellow

$startTime = Get-Date
$timeout = 3600 # 60 minutes timeout
$ready = $false

# Monitor logs for readiness
$logProcess = Start-Process -FilePath "docker" -ArgumentList "compose -f $composeFile logs -f gitlab" -PassThru -NoNewWindow

# Check every 30 seconds for "GitLab is ready!" message
while ((Get-Date) - $startTime -lt $timeout) {
    try {
        $logOutput = docker compose -f $composeFile logs gitlab 2>&1
        if ($logOutput -match "GitLab is ready!") {
            $ready = $true
            break
        }
    } catch {
        # Ignore errors during log check
    }
    Start-Sleep -Seconds 30
    Write-Host "   Still initializing... ($(($startTime - (Get-Date)).TotalSeconds) seconds elapsed)" -ForegroundColor Gray
}

# Kill the log process
if ($logProcess) {
    $logProcess.Kill()
}

if (-not $ready) {
    Write-Host "⚠️  Timeout reached. GitLab may still be initializing in the background." -ForegroundColor Yellow
    Write-Host "   Check logs manually: docker compose -f $composeFile logs gitlab" -ForegroundColor White
} else {
    Write-Host "✅ GitLab initialized successfully" -ForegroundColor Green
}

# Step 4: Verify services
Write-Host "
🔍 Step 4/5: Verifying GitLab services..." -ForegroundColor Cyan
try {
    $services = docker exec $containerName gitlab-ctl status
    Write-Host "✅ GitLab services status:" -ForegroundColor Green
    Write-Host "$services" -ForegroundColor White
} catch {
    Write-Host "⚠️  Could not verify services: $_" -ForegroundColor Yellow
}

# Step 5: Get initial password
Write-Host "
🔑 Step 5/5: Retrieving initial root password..." -ForegroundColor Cyan
try {
    $passwordInfo = docker exec $containerName cat /etc/gitlab/initial_root_password
    Write-Host "✅ Initial root password retrieved (expires in 24 hours):" -ForegroundColor Green
    Write-Host "$passwordInfo" -ForegroundColor White
    
    Write-Host "
📝 IMPORTANT NOTES:" -ForegroundColor Yellow
    Write-Host "1. Change the root password immediately after first login" -ForegroundColor White
    Write-Host "2. The password file will be automatically deleted in 24 hours" -ForegroundColor White
    Write-Host "3. Access GitLab at: https://$hostname" -ForegroundColor White
} catch {
    Write-Host "⚠️  Could not retrieve password: $_" -ForegroundColor Yellow
    Write-Host "   You can retrieve it manually with:" -ForegroundColor White
    Write-Host "   docker exec $containerName cat /etc/gitlab/initial_root_password" -ForegroundColor Gray
}

# Final summary
Write-Host "
═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser: https://$hostname" -ForegroundColor White
Write-Host "2. Login with username: root" -ForegroundColor White
Write-Host "3. Change the password immediately" -ForegroundColor White
Write-Host "4. Complete initial setup" -ForegroundColor White
Write-Host "5. Configure email notifications" -ForegroundColor White
Write-Host "6. Create user accounts" -ForegroundColor White

Write-Host "
🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "- View logs:        docker compose -f $composeFile logs -f gitlab" -ForegroundColor White
Write-Host "- Stop GitLab:      docker compose -f $composeFile down" -ForegroundColor White
Write-Host "- Start GitLab:     docker compose -f $composeFile up -d" -ForegroundColor White
Write-Host "- Restart GitLab:   docker compose -f $composeFile restart" -ForegroundColor White
Write-Host "- Exec into container: docker exec -it $containerName bash" -ForegroundColor White

Write-Host "
📚 Full documentation: GITLAB_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "
✨ Enjoy your GitLab CE instance!" -ForegroundColor Green
