<#
.SYNOPSIS
    Wipe and reformat disk using diskpart clean command with partition creation.

.DESCRIPTION
    Performs disk wipe using Windows diskpart's "clean" command and then creates
    a new partition table and formats the disk to make it usable.
    Includes comprehensive logging, safety checks, and dry-run mode.

.PARAMETER DeviceNumber
    The disk number to wipe (0, 1, 2, etc.). Use -1 for SIMULATE mode.

.PARAMETER FileSystem
    File system to format with. Default: NTFS. Options: NTFS, FAT32, exFAT

.PARAMETER VolumeName
    Label for the new volume. Default: USB_DRIVE

.PARAMETER DryRun
    If present, only shows what would happen without executing.

.PARAMETER Confirm
    REQUIRED for actual execution. Confirms destructive operation.

.PARAMETER LogDir
    Directory for log files. Default: ./logs

.EXAMPLE
    .\diskpart_clean_format.ps1 -DeviceNumber 2 -DryRun
    Shows what would happen without executing.

.EXAMPLE
    .\diskpart_clean_format.ps1 -DeviceNumber 2 -Confirm
    Wipes disk 2 and reformats it as NTFS.

.EXAMPLE
    .\diskpart_clean_format.ps1 -DeviceNumber 2 -FileSystem FAT32 -VolumeName "MY_USB" -Confirm
    Wipes disk 2 and reformats as FAT32 with custom label.

.NOTES
    WARNING: This script performs IRREVERSIBLE data destruction!
    Requires Administrator privileges.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [int]$DeviceNumber,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("NTFS", "FAT32", "exFAT")]
    [string]$FileSystem = "NTFS",
    
    [Parameter(Mandatory=$false)]
    [string]$VolumeName = "USB_DRIVE",
    
    [switch]$DryRun,
    [switch]$Confirm,
    [switch]$AutoElevate,
    [switch]$SkipConfirmation,
    
    [string]$LogDir = "./logs",
    
    [string]$LogFile = ""
)

# ============================================================================
# AUTO-ELEVATION LOGIC
# ============================================================================
if ($AutoElevate -and $DeviceNumber -ne -1) {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "`n[AUTO-ELEVATE] Requesting administrator privileges..." -ForegroundColor Cyan
        
        # Prepare log file path so parent can read it later
        if ([string]::IsNullOrEmpty($LogFile)) {
            if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $LogFile = Join-Path $LogDir "diskwipe_format_disk${DeviceNumber}_${timestamp}.log"
            $LogFile = [System.IO.Path]::GetFullPath($LogFile)
        }

        # Build arguments to pass to elevated instance
        $argumentList = @(
            '-ExecutionPolicy', 'Bypass',
            '-File', "`"$PSCommandPath`"",
            '-DeviceNumber', $DeviceNumber,
            '-FileSystem', $FileSystem,
            '-VolumeName', "`"$VolumeName`"",
            '-LogFile', "`"$LogFile`""
        )
        
        if ($DryRun) { $argumentList += '-DryRun' }
        if ($Confirm) { $argumentList += '-Confirm' }
        if ($SkipConfirmation) { $argumentList += '-SkipConfirmation' }
        $argumentList += '-LogDir'
        $argumentList += "`"$LogDir`""
        
        try {
            # Launch elevated PowerShell with same script and parameters
            $process = Start-Process -FilePath 'powershell.exe' `
                -ArgumentList $argumentList `
                -Verb RunAs `
                -Wait `
                -PassThru
            
            # CRITICAL: Read the log file and print to stdout so parent process (Flutter) can see it!
            if (Test-Path $LogFile) {
                $logContent = Get-Content $LogFile -Raw
                Write-Host $logContent
            } else {
                Write-Host "Error: Log file not found at $LogFile" -ForegroundColor Red
            }

            exit $process.ExitCode
        }
        catch {
            Write-Host "`n[AUTO-ELEVATE] User cancelled UAC prompt or elevation failed." -ForegroundColor Yellow
            Write-Host "Error: $_`n" -ForegroundColor Red
            exit 1223  # ERROR_CANCELLED
        }
    }
}

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
  
  This script will PERMANENTLY ERASE all data on the target disk
  and then reformat it to make it usable again.
  
  Target: Disk $DeviceNumber
  Method: diskpart CLEAN + CREATE PARTITION + FORMAT $FileSystem
  Label: $VolumeName
  
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
    
    # Check if disk exists
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
    
    # Use provided log file if set, otherwise generate new one
    if (-not [string]::IsNullOrEmpty($LogFile)) {
        return $LogFile
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $newLogFile = Join-Path $LogDirectory "diskwipe_format_disk${DeviceNumber}_${timestamp}.log"
    return [System.IO.Path]::GetFullPath($newLogFile)
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

# ============================================================================
# DISK UNMOUNTING
# ============================================================================
function Dismount-TargetDisk {
    param([int]$DiskNum, [string]$LogFile)
    
    Write-Log "Attempting to unmount/offline disk $DiskNum..." -LogFile $LogFile
    
    try {
        # Set disk offline to force unmount all partitions
        Set-Disk -Number $DiskNum -IsOffline $true -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        # Set back online (diskpart clean will handle the rest)
        Set-Disk -Number $DiskNum -IsOffline $false -ErrorAction SilentlyContinue
        
        Write-Log "Disk $DiskNum toggled offline/online successfully" -LogFile $LogFile
        return $true
    }
    catch {
        Write-Log "Warning: Could not toggle disk offline: $_" -LogFile $LogFile
        # Not fatal - diskpart might still work
        return $false
    }
}

# ============================================================================
# DRY RUN MODE
# ============================================================================
function Invoke-DryRun {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    
    Write-Host "The following diskpart script WOULD be executed:`n" -ForegroundColor Cyan
    
    $fsCmd = if ($FileSystem -eq "FAT32") { "format fs=fat32 quick label=`"$VolumeName`"" } 
             elseif ($FileSystem -eq "exFAT") { "format fs=exfat quick label=`"$VolumeName`"" }
             else { "format fs=ntfs quick label=`"$VolumeName`"" }
    
    $diskpartScript = @"
select disk $DeviceNumber
clean
create partition primary
$fsCmd
assign
exit
"@
    
    Write-Host $diskpartScript -ForegroundColor White
    
    Write-Host "`nExecution Steps:" -ForegroundColor Cyan
    Write-Host "1. Create temporary diskpart script file"
    Write-Host "2. Run: diskpart /s <script_file>"
    Write-Host "3. Wipe disk $DeviceNumber"
    Write-Host "4. Create new primary partition"
    Write-Host "5. Format as $FileSystem with label '$VolumeName'"
    Write-Host "6. Assign drive letter automatically"
    Write-Host "7. Capture output to log file"
    
    Write-Host "`nTo execute for real, run with -Confirm flag." -ForegroundColor Yellow
    Write-Host "Example: .\diskpart_clean_format.ps1 -DeviceNumber $DeviceNumber -Confirm`n" -ForegroundColor Yellow
    
    return 0
}

# ============================================================================
# ACTUAL WIPE AND FORMAT EXECUTION
# ============================================================================
function Invoke-DiskWipeAndFormat {
    param(
        [int]$DiskNum,
        [string]$LogFile
    )
    
    Write-Log "Starting disk wipe and format operation" -LogFile $LogFile
    Write-Log "Target: Disk $DiskNum" -LogFile $LogFile
    Write-Log "Method: diskpart CLEAN + FORMAT $FileSystem" -LogFile $LogFile
    Write-Log "Volume Label: $VolumeName" -LogFile $LogFile
    
    # Get disk info before wipe
    try {
        $disk = Get-Disk -Number $DiskNum -ErrorAction Stop
        Write-Log "Disk Info: Size=$([math]::Round($disk.Size/1GB, 2))GB, PartitionStyle=$($disk.PartitionStyle)" -LogFile $LogFile
    }
    catch {
        Write-Log "Warning: Could not retrieve disk info: $_" -LogFile $LogFile
    }
    
    # Create diskpart script
    $tempScript = [System.IO.Path]::GetTempFileName()
    
    $fsCmd = if ($FileSystem -eq "FAT32") { "format fs=fat32 quick label=`"$VolumeName`"" } 
             elseif ($FileSystem -eq "exFAT") { "format fs=exfat quick label=`"$VolumeName`"" }
             else { "format fs=ntfs quick label=`"$VolumeName`"" }
    
    $diskpartScript = @"
select disk $DiskNum
clean
create partition primary
$fsCmd
assign
exit
"@
    
    Set-Content -Path $tempScript -Value $diskpartScript
    Write-Log "Created diskpart script: $tempScript" -LogFile $LogFile
    Write-Log "Script content:`n$diskpartScript" -LogFile $LogFile
    
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
            if ($errors -and $errors.Trim()) {
                Write-Log "DiskPart Errors:`n$errors" -LogFile $LogFile -IsError
            }
        }
        
        Write-Log "Operation completed in $($duration.TotalSeconds) seconds" -LogFile $LogFile
        
        # Check for success in output - DiskPart can return 0 even on failure
        $success = $false
        if ($output -and ($output -match "DiskPart succeeded" -or $output -match "successfully")) {
            if ($output -match "DiskPart succeeded in cleaning" -and 
                $output -match "successfully formatted" -and 
                $output -match "successfully assigned") {
                $success = $true
                Write-Log "SUCCESS: All diskpart operations completed successfully" -LogFile $LogFile
            } elseif ($output -match "DiskPart succeeded") {
                $success = $true
                Write-Log "SUCCESS: DiskPart operations completed" -LogFile $LogFile
            }
        }
        
        if ($success) {
            $exitCode = 0
        } else {
            $exitCode = 1
        }
        
        Write-Log "Final Exit Code: $exitCode" -LogFile $LogFile
        
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

# Handle DRY RUN mode
if ($DryRun) {
    exit (Invoke-DryRun)
}

# Require confirmation for destructive operation
if (-not $Confirm) {
    Write-Host "`nERROR: This is a DESTRUCTIVE operation!" -ForegroundColor Red
    Write-Host "You must explicitly confirm by using the -Confirm flag.`n" -ForegroundColor Red
    Write-Host "Example: .\diskpart_clean_format.ps1 -DeviceNumber $DeviceNumber -Confirm`n" -ForegroundColor Yellow
    exit 1
}

# Final confirmation prompt - skip if SkipConfirmation flag is set
if (-not $SkipConfirmation) {
    Write-Host "`nYou are about to PERMANENTLY ERASE Disk $DeviceNumber" -ForegroundColor Red
    Write-Host "and reformat it as $FileSystem with label '$VolumeName'" -ForegroundColor Red
    Write-Host "Type 'YES' to continue or anything else to abort: " -ForegroundColor Yellow -NoNewline
    $confirmation = Read-Host

    if ($confirmation -ne "YES") {
        Write-Host "`nOperation aborted by user.`n" -ForegroundColor Yellow
        Write-Log "Operation aborted by user" -LogFile $logFile
        exit 1
    }
} else {
    Write-Host "`n[AUTO-MODE] Skipping confirmation prompt..." -ForegroundColor Cyan
}

# Dismount the target disk first
Dismount-TargetDisk -DiskNum $DeviceNumber -LogFile $logFile

# Execute the wipe and format
Write-Host "`nStarting disk wipe and format operation...`n" -ForegroundColor Green
$exitCode = Invoke-DiskWipeAndFormat -DiskNum $DeviceNumber -LogFile $logFile

# Display results
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "OPERATION COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Log File: $logFile"
Write-Host "Exit Code: $exitCode"

if ($exitCode -eq 0) {
    Write-Host "`nSUCCESS: Disk wiped and formatted successfully!" -ForegroundColor Green
    Write-Host "Your drive should now be usable with a new $FileSystem partition." -ForegroundColor Green
    Write-Host "`n"
}
else {
    Write-Host "`nWARNING: Operation completed with errors. Check log file.`n" -ForegroundColor Yellow
}

exit $exitCode
