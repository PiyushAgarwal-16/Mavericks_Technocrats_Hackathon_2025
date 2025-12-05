<#
.SYNOPSIS
    Purge-level disk wipe using diskpart clean all command.

.DESCRIPTION
    Performs destructive disk wipe using Windows diskpart's "clean all" command.
    Includes comprehensive logging, safety checks, and dry-run mode.

.PARAMETER DeviceNumber
    The disk number to wipe (0, 1, 2, etc.). Use -1 for SIMULATE mode.

.PARAMETER DryRun
    If present, only shows what would happen without executing.

.PARAMETER Confirm
    REQUIRED for actual execution. Confirms destructive operation.

.PARAMETER LogDir
    Directory for log files. Default: ./logs

.EXAMPLE
    .\diskpart_clean_all.ps1 -DeviceNumber 1 -DryRun
    Shows what would happen without executing.

.EXAMPLE
    .\diskpart_clean_all.ps1 -DeviceNumber 1 -Confirm
    Executes actual wipe on disk 1.

.EXAMPLE
    .\diskpart_clean_all.ps1 -DeviceNumber -1 -Confirm
    Runs in SIMULATE mode for testing/demo purposes.

.NOTES
    WARNING: This script performs IRREVERSIBLE data destruction!
    Requires Administrator privileges.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [int]$DeviceNumber,
    
    [switch]$DryRun,
    [switch]$Confirm,
    
    [string]$LogDir = "./logs"
)

# ============================================================================
# WARNING HEADER
# ============================================================================
function Show-WarningHeader {
    $width = 80
    $border = "=" * $width
    $warning = @"
$border
    ██     ██  █████  ██████  ███    ██ ██ ███    ██  ██████  
    ██     ██ ██   ██ ██   ██ ████   ██ ██ ████   ██ ██       
    ██  █  ██ ███████ ██████  ██ ██  ██ ██ ██ ██  ██ ██   ███ 
    ██ ███ ██ ██   ██ ██   ██ ██  ██ ██ ██ ██  ██ ██ ██    ██ 
     ███ ███  ██   ██ ██   ██ ██   ████ ██ ██   ████  ██████  
$border
  DESTRUCTIVE DISK WIPE OPERATION - ALL DATA WILL BE LOST!
  
  This script will PERMANENTLY ERASE all data on the target disk.
  Data recovery will be IMPOSSIBLE after this operation.
  
  Target: Disk $DeviceNumber
  Method: diskpart CLEAN ALL
  
  PROCEED WITH EXTREME CAUTION!
$border
"@
    Write-Host $warning -ForegroundColor Red
}

# ============================================================================
# VALIDATION & SAFETY CHECKS
# ============================================================================
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-ValidDiskNumber {
    param([int]$DiskNum)
    
    # Allow -1 for SIMULATE mode
    if ($DiskNum -eq -1) {
        return $true
    }
    
    # Must be >= 0
    if ($DiskNum -lt 0) {
        return $false
    }
    
    # Check if disk exists (only in non-simulate mode)
    try {
        $disk = Get-Disk -Number $DiskNum -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# ============================================================================
# LOGGING
# ============================================================================
function Initialize-Logging {
    param([string]$LogDirectory)
    
    if (-not (Test-Path $LogDirectory)) {
        New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logFile = Join-Path $LogDirectory "diskwipe_disk${DeviceNumber}_${timestamp}.log"
    
    return $logFile
}

function Write-Log {
    param(
        [string]$Message,
        [string]$LogFile,
        [switch]$IsError
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    if ($IsError) {
        Write-Host $logEntry -ForegroundColor Red
    }
    else {
        Write-Host $logEntry
    }
    
    Add-Content -Path $LogFile -Value $logEntry
}

function Get-LogHash {
    param([string]$LogFile)
    
    if (Test-Path $LogFile) {
        $hash = Get-FileHash -Path $LogFile -Algorithm SHA256
        return $hash.Hash
    }
    return $null
}

# ============================================================================
# SIMULATE MODE
# ============================================================================
function Invoke-SimulateMode {
    param([string]$LogFile)
    
    Write-Host "`n[SIMULATE MODE] Generating demo log for testing...`n" -ForegroundColor Cyan
    
    $simulateLog = @"
========================================
SIMULATE MODE - DEMO WIPE LOG
========================================
Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Device: SIMULATE (Disk -1)
Method: diskpart CLEAN ALL
Status: SIMULATED SUCCESS

[SIMULATION] Starting disk wipe operation...
[SIMULATION] Target: Disk -1 (Demo Mode)
[SIMULATION] Method: diskpart clean all

DiskPart Simulation Output:
---------------------------
Microsoft DiskPart version 10.0.19041.964

DISKPART> select disk -1
Disk -1 is now the selected disk.

DISKPART> clean all
DiskPart succeeded in cleaning the disk.

[SIMULATION] Wipe completed successfully
[SIMULATION] Duration: 0.5 seconds
[SIMULATION] Exit Code: 0

========================================
SIMULATE MODE COMPLETED
========================================
This is a DEMO log for testing purposes.
No actual disk operations were performed.
"@
    
    Add-Content -Path $LogFile -Value $simulateLog
    Write-Log "Simulate mode completed successfully" -LogFile $LogFile
    
    $hash = Get-LogHash -LogFile $LogFile
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SIMULATE MODE COMPLETED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Log File: $LogFile"
    Write-Host "Log SHA256: $hash"
    Write-Host "`n" -ForegroundColor Green
    
    return 0
}

# ============================================================================
# DRY RUN MODE
# ============================================================================
function Invoke-DryRun {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    
    Write-Host "The following diskpart script WOULD be executed:`n" -ForegroundColor Cyan
    
    $diskpartScript = @"
select disk $DeviceNumber
clean all
exit
"@
    
    Write-Host $diskpartScript -ForegroundColor White
    
    Write-Host "`nExecution Steps:" -ForegroundColor Cyan
    Write-Host "1. Create temporary diskpart script file"
    Write-Host "2. Run: diskpart /s <script_file>"
    Write-Host "3. Capture output to log file: $LogDir/diskwipe_disk${DeviceNumber}_<timestamp>.log"
    Write-Host "4. Compute SHA256 hash of log file"
    Write-Host "5. Clean up temporary files"
    
    Write-Host "`nTo execute for real, run with -Confirm flag." -ForegroundColor Yellow
    Write-Host "Example: .\diskpart_clean_all.ps1 -DeviceNumber $DeviceNumber -Confirm`n" -ForegroundColor Yellow
    
    return 0
}

# ============================================================================
# ACTUAL WIPE EXECUTION
# ============================================================================
function Invoke-DiskWipe {
    param(
        [int]$DiskNum,
        [string]$LogFile
    )
    
    Write-Log "Starting disk wipe operation" -LogFile $LogFile
    Write-Log "Target: Disk $DiskNum" -LogFile $LogFile
    Write-Log "Method: diskpart CLEAN ALL" -LogFile $LogFile
    
    # Get disk info before wipe
    try {
        $disk = Get-Disk -Number $DiskNum -ErrorAction Stop
        Write-Log "Disk Info: Size=$([math]::Round($disk.Size/1GB, 2))GB, PartitionStyle=$($disk.PartitionStyle)" -LogFile $LogFile
    }
    catch {
        Write-Log "Warning: Could not retrieve disk info: $_" -LogFile $LogFile
    }
    
    # Create temporary diskpart script
    $tempScript = [System.IO.Path]::GetTempFileName()
    $diskpartScript = @"
select disk $DiskNum
clean all
exit
"@
    
    Set-Content -Path $tempScript -Value $diskpartScript
    Write-Log "Created diskpart script: $tempScript" -LogFile $LogFile
    
    # Execute diskpart
    Write-Log "Executing diskpart..." -LogFile $LogFile
    $startTime = Get-Date
    
    try {
        $process = Start-Process -FilePath "diskpart.exe" `
            -ArgumentList "/s `"$tempScript`"" `
            -Wait `
            -NoNewWindow `
            -PassThru `
            -RedirectStandardOutput "$env:TEMP\diskpart_out.txt" `
            -RedirectStandardError "$env:TEMP\diskpart_err.txt"
        
        $exitCode = $process.ExitCode
        $duration = (Get-Date) - $startTime
        
        # Capture output
        if (Test-Path "$env:TEMP\diskpart_out.txt") {
            $output = Get-Content "$env:TEMP\diskpart_out.txt" -Raw
            Write-Log "DiskPart Output:`n$output" -LogFile $LogFile
        }
        
        if (Test-Path "$env:TEMP\diskpart_err.txt") {
            $errors = Get-Content "$env:TEMP\diskpart_err.txt" -Raw
            if ($errors.Trim()) {
                Write-Log "DiskPart Errors:`n$errors" -LogFile $LogFile -IsError
            }
        }
        
        Write-Log "Wipe completed in $($duration.TotalSeconds) seconds" -LogFile $LogFile
        Write-Log "Exit Code: $exitCode" -LogFile $LogFile
        
        # Cleanup
        Remove-Item -Path $tempScript -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:TEMP\diskpart_out.txt" -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:TEMP\diskpart_err.txt" -Force -ErrorAction SilentlyContinue
        
        return $exitCode
    }
    catch {
        Write-Log "ERROR: Diskpart execution failed: $_" -LogFile $LogFile -IsError
        Remove-Item -Path $tempScript -Force -ErrorAction SilentlyContinue
        return 1
    }
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

# Show warning header
Show-WarningHeader

# Check for administrator privileges (skip for simulate mode)
if ($DeviceNumber -ne -1) {
    if (-not (Test-Administrator)) {
        Write-Host "`nERROR: This script requires Administrator privileges." -ForegroundColor Red
        Write-Host "Please run PowerShell as Administrator and try again.`n" -ForegroundColor Red
        exit 1
    }
}

# Validate device number
if (-not (Test-ValidDiskNumber -DiskNum $DeviceNumber)) {
    Write-Host "`nERROR: Invalid device number: $DeviceNumber" -ForegroundColor Red
    if ($DeviceNumber -ne -1) {
        Write-Host "Available disks:" -ForegroundColor Yellow
        Get-Disk | Format-Table Number, FriendlyName, Size, PartitionStyle
    }
    exit 1
}

# Initialize logging
$logFile = Initialize-Logging -LogDirectory $LogDir
Write-Host "`nLog file: $logFile`n"

# Handle SIMULATE mode
if ($DeviceNumber -eq -1) {
    exit (Invoke-SimulateMode -LogFile $logFile)
}

# Handle DRY RUN mode
if ($DryRun) {
    exit (Invoke-DryRun)
}

# Require confirmation for destructive operation
if (-not $Confirm) {
    Write-Host "`nERROR: This is a DESTRUCTIVE operation!" -ForegroundColor Red
    Write-Host "You must explicitly confirm by using the -Confirm flag.`n" -ForegroundColor Red
    Write-Host "Example: .\diskpart_clean_all.ps1 -DeviceNumber $DeviceNumber -Confirm`n" -ForegroundColor Yellow
    exit 1
}

# Final confirmation prompt
Write-Host "`nYou are about to PERMANENTLY ERASE Disk $DeviceNumber" -ForegroundColor Red
Write-Host "Type 'YES' to continue or anything else to abort: " -ForegroundColor Yellow -NoNewline
$confirmation = Read-Host

if ($confirmation -ne "YES") {
    Write-Host "`nOperation aborted by user.`n" -ForegroundColor Yellow
    Write-Log "Operation aborted by user" -LogFile $logFile
    exit 1
}

# Execute the wipe
Write-Host "`nStarting disk wipe operation..." -ForegroundColor Green
$exitCode = Invoke-DiskWipe -DiskNum $DeviceNumber -LogFile $logFile

# Compute and display log hash
$hash = Get-LogHash -LogFile $logFile

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "WIPE OPERATION COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Log File: $logFile"
Write-Host "Log SHA256: $hash"
Write-Host "Exit Code: $exitCode"
Write-Host "`n"

if ($exitCode -eq 0) {
    Write-Host "SUCCESS: Disk wipe completed successfully.`n" -ForegroundColor Green
}
else {
    Write-Host "WARNING: Disk wipe completed with errors. Check log file.`n" -ForegroundColor Yellow
}

exit $exitCode
