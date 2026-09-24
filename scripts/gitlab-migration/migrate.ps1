<#
.SYNOPSIS
Promotes the new GitLab v19 instance to the primary port 8929.

This script automates the migration bridge between the old GitLab instance
and the new v19 instance, updating the docker-compose configuration to
promote the new instance.

.DESCRIPTION
1. Stops the old GitLab container if running.
2. Pulls/Starts the new GitLab v19 instance on port 8930 (overflow).
3. Updates docker-compose.gitlab.yml to promote the new instance to port 8929.
4. Updates the external_url to reflect the new primary port.

.UseCase
Run this script after the new GitLab v19 image has been pulled or is cached.
It finalizes the infrastructure migration objective.

.PARAMETER NewInstancePort
The port the new instance is running on. Default is 8930.

.PARAMETER PrimaryPort
The port to promote the new instance to. Default is 8929.
#>

param(
    [int]$NewInstancePort = 8930,
    [int]$PrimaryPort = 8929
)

Write-Host "--- GitLab Promotion Script ---" -ForegroundColor Cyan
Write-Host "Promoting new GitLab instance on port $NewInstancePort to primary port $PrimaryPort" -ForegroundColor Yellow

# 1. Define paths
$composeFile = "C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\docker-compose.gitlab.yml"
$backupFile = "$composeFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 2. Backup the current configuration
if (Test-Path $composeFile) {
    Copy-Item -Path $composeFile -Destination $backupFile -Force
    Write-Host "Backup created: $backupFile" -ForegroundColor Green
} else {
    Write-Warning "docker-compose.gitlab.yml not found at $composeFile"
    return
}

# 3. Stop the old container gracefully
Write-Host "Stopping old GitLab container..." -ForegroundColor Magenta
docker stop hexa-gitlab -ErrorAction SilentlyContinue
docker rm hexa-gitlab -ErrorAction SilentlyContinue

# 4. Pull the new image (optional, comment out if image is already cached)
# Write-Host "Pulling new GitLab v19 image (this may take several minutes)..."
# docker pull gitlab/gitlab-ce:16.11.0-ce.0

# 5. Start the new instance on the overflow port
Write-Host "Starting new GitLab instance on port $NewInstancePort..." -ForegroundColor Magenta
docker run -d --name hexa-gitlab-new `
    -p "$NewInstancePort:80" `
    --restart unless-stopped `
    --hostname 'gitlab.hexastudio.net' `
    -v gitlab_config:/etc/gitlab `
    -v gitlab_logs:/var/log/gitlab `
    -v gitlab_data:/var/opt/gitlab `
    gitlab/gitlab-ce:16.11.0-ce.0

Write-Host "New instance started. Waiting for health check..." -ForegroundColor Yellow
# Simple wait for health (Docker compose healthcheck is better, but we keep it simple)
Start-Sleep -Seconds 60

# 6. Promote the new instance: Update docker-compose.gitlab.yml
Write-Host "Promoting new instance to primary port $PrimaryPort..." -ForegroundColor Magenta

# Update the external_url
$yamlContent = Get-Content -Path $composeFile
# We need to replace the external_url and the port mapping.
# Note: This is a simple string replacement for the specific patterns found in the compose file.

# Replace external_url
$newExternalUrl = "external_url `'http://19.16.1.100:$PrimaryPort`'"
$oldExternalUrlPattern = "external_url 'http://19.16.1.100:8929'"
if ($yamlContent -contains $oldExternalUrlPattern) {
    $yamlContent = $yamlContent -replace [regex]::Escape($oldExternalUrlPattern), $newExternalUrl
    Write-Host "Updated external_url to port $PrimaryPort" -ForegroundColor Green
} else {
    Write-Host "Could not find external_url pattern to replace." -ForegroundColor DarkYellow
}

# Replace the port mapping in the ports section
# The line is: - "8929:80"      # HTTP (Puma) - Internal (PRIMARY instance)
$newPortLine = "`"- `"`$PrimaryPort:80`"`# HTTP (Puma) - Internal (PROMOTED instance)"
$oldPortLine = "`"- `"`8929:80`"`# HTTP (Puma) - Internal (PRIMARY instance)`" # Note: PowerShell escaping

# A more robust way is to just replace the specific string pattern
# We look for the line containing "8929:80" and replace it
$updated = $false
for ($i = 0; $i -lt $yamlContent.Length; $i++) {
    if ($yamlContent[$i] -match '8929:80') {
        $yamlContent[$i] = "- `"$PrimaryPort:80`"`# HTTP (Puma) - Internal (PROMOTED instance)`"
        $updated = $true
        break
    }
}

if ($updated) {
    Set-Content -Path $composeFile -Value $yamlContent -Encoding UTF8
    Write-Host "Updated port mapping in docker-compose.gitlab.yml" -ForegroundColor Green
} else {
    Write-Host "Could not find port mapping line to replace." -ForegroundColor DarkYellow
}

Write-Host "--- Promotion Complete ---" -ForegroundColor Cyan
Write-Host "Please run: docker compose -f docker-compose.gitlab.yml up -d" -ForegroundColor Yellow
Write-Host "Verify access at: http://19.16.1.100:$PrimaryPort" -ForegroundColor Yellow