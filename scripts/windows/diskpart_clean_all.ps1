#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Diskpart Clean All - Device Wipe Script
    
.DESCRIPTION
    ⚠️  DESTRUCTIVE OPERATION WARNING ⚠️
    This script uses diskpart to clean all data from a disk.
    ALL DATA WILL BE PERMANENTLY DESTROYED.
    
.PARAMETER DiskNumber
    The disk number to clean (e.g., 1, 2, 3)
    
.PARAMETER DryRun
    If specified, simulates the operation without executing diskpart
    
.EXAMPLE
    .\diskpart_clean_all.ps1 -DiskNumber 1 -DryRun
    .\diskpart_clean_all.ps1 -DiskNumber 1
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [int]$DiskNumber,
    
    [switch]$DryRun
)

# ═══════════════════════════════════════════════════════════════════════════
# SAFETY CHECK: Require Administrator
# ═══════════════════════════════════════════════════════════════════════════
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "❌ This script requires Administrator privileges."
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Diskpart Clean All - Device Wipe" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No actual changes will be made" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Target Disk: $DiskNumber" -ForegroundColor White
Write-Host ""

if (-not $DryRun) {
    Write-Host "⚠️  WARNING: This will PERMANENTLY ERASE all data on disk $DiskNumber" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Type 'YES' to proceed"
    if ($confirm -ne "YES") {
        Write-Host "❌ Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

$diskpartScript = @"
select disk $DiskNumber
clean all
"@

if ($DryRun) {
    Write-Host "[DRY RUN] Would execute diskpart with script:" -ForegroundColor Green
    Write-Host $diskpartScript -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Dry run completed successfully" -ForegroundColor Green
} else {
    Write-Host "Executing diskpart clean all..." -ForegroundColor White
    $tempScript = [System.IO.Path]::GetTempFileName()
    $diskpartScript | Out-File -FilePath $tempScript -Encoding ASCII
    
    try {
        $output = diskpart /s $tempScript 2>&1
        Write-Host $output
        Write-Host ""
        Write-Host "✅ Clean all completed" -ForegroundColor Green
    } catch {
        Write-Error "❌ Diskpart failed: $_"
        exit 1
    } finally {
        Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
    }
}

exit 0
