# Cloudflare DNS Configuration Script
# Automatically configures DNS records for HEXA Hub deployment

param(
    [string]$CloudflareEmail = $env:CLOUDFLARE_EMAIL,
    [string]$CloudflareApiKey = $env:CLOUDFLARE_API_KEY,
    [string]$CloudflareZoneId = "51f0f785-6b8c-41ec-be7f-93a9d5237eb3",
    [string]$Domain = "hexastudio.net"
)

Write-Host "==========================================" -ForegroundColor Green
Write-Host "CLOUDFLARE DNS CONFIGURATION" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Validate credentials
if (-not $CloudflareEmail -or -not $CloudflareApiKey) {
    Write-Host "❌ Cloudflare credentials not provided" -ForegroundColor Red
    Write-Host "Please set CLOUDFLARE_EMAIL and CLOUDFLARE_API_KEY environment variables" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Cloudflare credentials validated" -ForegroundColor Green
Write-Host ""

# DNS Records to configure
$dnsRecords = @(
    @{
        type = "A"
        name = "gitlab"
        content = "19.16.1.100"
        ttl = 1
        proxied = $true
    },
    @{
        type = "A"
        name = "registry.gitlab"
        content = "19.16.1.100"
        ttl = 1
        proxied = $true
    },
    @{
        type = "A"
        name = "pages.gitlab"
        content = "19.16.1.100"
        ttl = 1
        proxied = $true
    }
)

# Cloudflare API headers
$headers = @{
    "X-Auth-Email" = $CloudflareEmail
    "X-Auth-Key" = $CloudflareApiKey
    "Content-Type" = "application/json"
}

Write-Host "Configuring DNS records for domain: $Domain" -ForegroundColor Cyan
Write-Host ""

# Configure each DNS record
$recordCount = 0
$successCount = 0

foreach ($record in $dnsRecords) {
    $recordCount++
    Write-Host "[$recordCount/$($dnsRecords.Count)] Configuring DNS record: $($record.name).$Domain → $($record.content)" -ForegroundColor Yellow
    
    try {
        $body = @{
            type = $record.type
            name = "$($record.name).$Domain"
            content = $record.content
            ttl = $record.ttl
            proxied = $record.proxied
        } | ConvertTo-Json -Depth 5
        
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$CloudflareZoneId/dns_records" -Method Post -Headers $headers -Body $body -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✅ Successfully configured: $($record.name).$Domain → $($record.content)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Failed to configure: $($record.name).$Domain" -ForegroundColor Red
            Write-Host "Error: $($response.errors[0].message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Exception configuring $($record.name).$Domain : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Summary
Write-Host "==========================================" -ForegroundColor Green
Write-Host "DNS CONFIGURATION SUMMARY" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Records Configured: $recordCount" -ForegroundColor Cyan
Write-Host "Records Successful: $successCount" -ForegroundColor Cyan
Write-Host "Records Failed: $($recordCount - $successCount)" -ForegroundColor Cyan
Write-Host ""

if ($successCount -eq $recordCount) {
    Write-Host "✅ ALL DNS RECORDS CONFIGURED SUCCESSFULLY" -ForegroundColor Green
    Write-Host ""
    Write-Host "DNS Records Configured:" -ForegroundColor Yellow
    foreach ($record in $dnsRecords) {
        Write-Host "  • $($record.name).$Domain → $($record.content)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "DNS propagation will take 15-30 minutes" -ForegroundColor Yellow
    Write-Host "You can verify with: nslookup gitlab.$Domain" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next step: Run deploy-gitlab.ps1" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some records failed to configure" -ForegroundColor Yellow
    Write-Host "Please check the errors above and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "==========================================" -ForegroundColor Green
