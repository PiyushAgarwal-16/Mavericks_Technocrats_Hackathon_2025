#!/bin/bash

################################################################################
# PURGE-LEVEL DISK WIPE SCRIPT FOR LINUX
################################################################################
#
# Description:
#   Performs secure disk wipe using dd (zero/random) or hdparm (ATA Secure Erase).
#   Includes comprehensive logging, safety checks, and dry-run mode.
#
# Usage:
#   ./purge_dd.sh --device=/dev/sdX --method=zero --confirm
#   ./purge_dd.sh --device=/dev/sdX --method=hdparm --dry-run
#   ./purge_dd.sh --device=SIMULATE --method=zero --confirm
#
# Arguments:
#   --device=<device>    Device to wipe (e.g., /dev/sdb) or "SIMULATE"
#   --method=<method>    Wipe method: zero, random, or hdparm
#   --dry-run            Show what would happen without executing
#   --confirm            REQUIRED for actual execution
#   --log-dir=<dir>      Log directory (default: ./logs)
#   --no-fallback        Disable hdparm->zero fallback
#
# Examples:
#   ./purge_dd.sh --device=/dev/sdb --method=zero --dry-run
#   ./purge_dd.sh --device=/dev/sdb --method=zero --confirm
#   ./purge_dd.sh --device=SIMULATE --method=hdparm --confirm
#
# WARNING: This script performs IRREVERSIBLE data destruction!
#
################################################################################

set -o pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================
DEVICE=""
METHOD=""
DRY_RUN=false
CONFIRM=false
LOG_DIR="./logs"
NO_FALLBACK=false
SCRIPT_START_TIME=$(date +%s)

# ============================================================================
# COLOR CODES
# ============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# WARNING HEADER
# ============================================================================
show_warning_header() {
    local width=80
    local border=$(printf '=%.0s' $(seq 1 $width))
    
    echo -e "${RED}${border}"
    echo "    ██     ██  █████  ██████  ███    ██ ██ ███    ██  ██████  "
    echo "    ██     ██ ██   ██ ██   ██ ████   ██ ██ ████   ██ ██       "
    echo "    ██  █  ██ ███████ ██████  ██ ██  ██ ██ ██ ██  ██ ██   ███ "
    echo "    ██ ███ ██ ██   ██ ██   ██ ██  ██ ██ ██ ██  ██ ██ ██    ██ "
    echo "     ███ ███  ██   ██ ██   ██ ██   ████ ██ ██   ████  ██████  "
    echo "${border}"
    echo "  DESTRUCTIVE DISK WIPE OPERATION - ALL DATA WILL BE LOST!"
    echo ""
    echo "  This script will PERMANENTLY ERASE all data on the target device."
    echo "  Data recovery will be IMPOSSIBLE after this operation."
    echo ""
    echo "  Target: ${DEVICE}"
    echo "  Method: ${METHOD}"
    echo ""
    echo "  PROCEED WITH EXTREME CAUTION!"
    echo "${border}${NC}"
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================
parse_arguments() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    for arg in "$@"; do
        case $arg in
            --device=*)
                DEVICE="${arg#*=}"
                ;;
            --method=*)
                METHOD="${arg#*=}"
                ;;
            --dry-run)
                DRY_RUN=true
                ;;
            --confirm)
                CONFIRM=true
                ;;
            --log-dir=*)
                LOG_DIR="${arg#*=}"
                ;;
            --no-fallback)
                NO_FALLBACK=true
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                echo -e "${RED}ERROR: Unknown argument: $arg${NC}"
                show_usage
                exit 1
                ;;
        esac
    done
}

show_usage() {
    cat << EOF
Usage: $0 --device=<device> --method=<method> [options]

Required Arguments:
  --device=<device>    Device to wipe (e.g., /dev/sdb) or "SIMULATE"
  --method=<method>    Wipe method: zero, random, or hdparm

Options:
  --dry-run            Show what would happen without executing
  --confirm            REQUIRED for actual execution
  --log-dir=<dir>      Log directory (default: ./logs)
  --no-fallback        Disable hdparm->zero fallback
  --help               Show this help message

Methods:
  zero                 Overwrite with zeros using dd
  random               Overwrite with random data using dd
  hdparm               ATA Secure Erase (with automatic fallback to zero)

Examples:
  $0 --device=/dev/sdb --method=zero --dry-run
  $0 --device=/dev/sdb --method=zero --confirm
  $0 --device=SIMULATE --method=hdparm --confirm

WARNING: This is a DESTRUCTIVE operation. Use with extreme caution!
EOF
}

# ============================================================================
# LOGGING
# ============================================================================
LOG_FILE=""

initialize_logging() {
    mkdir -p "$LOG_DIR"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local device_safe=$(echo "$DEVICE" | tr '/' '_')
    LOG_FILE="${LOG_DIR}/diskwipe_${device_safe}_${timestamp}.log"
    
    touch "$LOG_FILE"
    echo "Log file: $LOG_FILE"
}

log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] $message"
    
    echo "$log_entry" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] ERROR: $message"
    
    echo -e "${RED}${log_entry}${NC}" | tee -a "$LOG_FILE"
}

compute_log_hash() {
    if [ -f "$LOG_FILE" ]; then
        sha256sum "$LOG_FILE" | awk '{print $1}'
    fi
}

# ============================================================================
# VALIDATION
# ============================================================================
validate_root() {
    if [ "$EUID" -ne 0 ] && [ "$DEVICE" != "SIMULATE" ]; then
        echo -e "${RED}ERROR: This script requires root privileges.${NC}"
        echo -e "${RED}Please run with sudo or as root.${NC}"
        exit 1
    fi
}

validate_device() {
    if [ -z "$DEVICE" ]; then
        echo -e "${RED}ERROR: --device is required${NC}"
        show_usage
        exit 1
    fi
    
    # Allow SIMULATE mode
    if [ "$DEVICE" = "SIMULATE" ]; then
        return 0
    fi
    
    # Must be a /dev/ device
    if [[ ! "$DEVICE" =~ ^/dev/.+ ]]; then
        echo -e "${RED}ERROR: Device must start with /dev/${NC}"
        echo -e "${RED}Provided: $DEVICE${NC}"
        exit 1
    fi
    
    # Check if device exists
    if [ ! -b "$DEVICE" ]; then
        echo -e "${RED}ERROR: Device $DEVICE does not exist or is not a block device${NC}"
        echo -e "${YELLOW}Available block devices:${NC}"
        lsblk -d -n -o NAME,SIZE,TYPE | grep disk
        exit 1
    fi
    
    # Check if device is mounted
    if mount | grep -q "^$DEVICE"; then
        echo -e "${RED}ERROR: Device $DEVICE is currently mounted!${NC}"
        echo -e "${RED}Mounted partitions:${NC}"
        mount | grep "^$DEVICE"
        echo -e "${YELLOW}Unmount all partitions before proceeding.${NC}"
        exit 1
    fi
}

validate_method() {
    if [ -z "$METHOD" ]; then
        echo -e "${RED}ERROR: --method is required${NC}"
        show_usage
        exit 1
    fi
    
    case "$METHOD" in
        zero|random|hdparm)
            ;;
        *)
            echo -e "${RED}ERROR: Invalid method: $METHOD${NC}"
            echo -e "${YELLOW}Valid methods: zero, random, hdparm${NC}"
            exit 1
            ;;
    esac
}

check_hdparm_support() {
    local device="$1"
    
    if ! command -v hdparm &> /dev/null; then
        log_message "hdparm command not found"
        return 1
    fi
    
    log_message "Checking hdparm support for $device..."
    
    local hdparm_output=$(hdparm -I "$device" 2>/dev/null)
    
    if echo "$hdparm_output" | grep -q "Security:"; then
        if echo "$hdparm_output" | grep -A 5 "Security:" | grep -q "supported.*yes"; then
            log_message "ATA Secure Erase is supported"
            return 0
        fi
    fi
    
    log_message "ATA Secure Erase is not supported"
    return 1
}

# ============================================================================
# SIMULATE MODE
# ============================================================================
run_simulate_mode() {
    log_message "========================================="
    log_message "SIMULATE MODE - DEMO WIPE LOG"
    log_message "========================================="
    log_message "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log_message "Device: SIMULATE"
    log_message "Method: $METHOD"
    log_message "Status: SIMULATED SUCCESS"
    log_message ""
    log_message "[SIMULATION] Starting disk wipe operation..."
    log_message "[SIMULATION] Target: SIMULATE (Demo Mode)"
    log_message "[SIMULATION] Method: $METHOD"
    log_message ""
    
    if [ "$METHOD" = "hdparm" ]; then
        log_message "ATA Secure Erase Simulation:"
        log_message "-----------------------------"
        log_message "hdparm -I SIMULATE"
        log_message "Security: supported: yes, enabled: no, locked: no, frozen: no"
        log_message ""
        log_message "hdparm --user-master u --security-set-pass p SIMULATE"
        log_message "security_password=\"p\""
        log_message ""
        log_message "hdparm --user-master u --security-erase p SIMULATE"
        log_message "Issuing SECURITY_ERASE command, password=\"p\""
    else
        log_message "dd Simulation:"
        log_message "--------------"
        log_message "dd if=/dev/zero of=SIMULATE bs=4M status=progress"
        log_message "1073741824 bytes (1.1 GB, 1.0 GiB) copied, 0.5 s, 2.1 GB/s"
    fi
    
    log_message ""
    log_message "[SIMULATION] Wipe completed successfully"
    log_message "[SIMULATION] Duration: 0.5 seconds"
    log_message "[SIMULATION] Exit Code: 0"
    log_message ""
    log_message "========================================="
    log_message "SIMULATE MODE COMPLETED"
    log_message "========================================="
    log_message "This is a DEMO log for testing purposes."
    log_message "No actual disk operations were performed."
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}SIMULATE MODE COMPLETED${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo "Log File: $LOG_FILE"
    echo "Log SHA256: $(compute_log_hash)"
    echo ""
    
    exit 0
}

# ============================================================================
# DRY RUN MODE
# ============================================================================
run_dry_run() {
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    
    echo -e "${CYAN}The following operations WOULD be executed:${NC}"
    echo ""
    
    case "$METHOD" in
        zero)
            echo "dd if=/dev/zero of=$DEVICE bs=4M status=progress"
            ;;
        random)
            echo "dd if=/dev/urandom of=$DEVICE bs=4M status=progress"
            ;;
        hdparm)
            if check_hdparm_support "$DEVICE" &> /dev/null; then
                echo "hdparm -I $DEVICE"
                echo "hdparm --user-master u --security-set-pass p $DEVICE"
                echo "hdparm --user-master u --security-erase p $DEVICE"
            else
                if [ "$NO_FALLBACK" = true ]; then
                    echo -e "${YELLOW}hdparm not supported, would exit with error${NC}"
                else
                    echo -e "${YELLOW}hdparm not supported, would fallback to:${NC}"
                    echo "dd if=/dev/zero of=$DEVICE bs=4M status=progress"
                fi
            fi
            ;;
    esac
    
    echo ""
    echo -e "${CYAN}Execution Steps:${NC}"
    echo "1. Create log file: ${LOG_DIR}/diskwipe_<device>_<timestamp>.log"
    echo "2. Execute wipe operation"
    echo "3. Capture all output to log file"
    echo "4. Compute SHA256 hash of log file"
    echo "5. Display results"
    
    echo ""
    echo -e "${YELLOW}To execute for real, run with --confirm flag.${NC}"
    echo -e "${YELLOW}Example: $0 --device=$DEVICE --method=$METHOD --confirm${NC}"
    echo ""
    
    exit 0
}

# ============================================================================
# WIPE METHODS
# ============================================================================
wipe_with_dd() {
    local source="$1"
    local device="$2"
    
    log_message "Starting dd wipe..."
    log_message "Source: $source"
    log_message "Target: $device"
    
    local start_time=$(date +%s)
    
    # Execute dd with progress
    if dd if="$source" of="$device" bs=4M status=progress 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_message "dd completed successfully"
        log_message "Duration: ${duration} seconds"
        
        # Sync to ensure all data is written
        sync
        log_message "Sync completed"
        
        return 0
    else
        log_error "dd failed"
        return 1
    fi
}

wipe_with_hdparm() {
    local device="$1"
    local password="zerotrace_temp_pwd"
    
    log_message "Starting ATA Secure Erase..."
    log_message "Device: $device"
    
    # Check if frozen
    if hdparm -I "$device" 2>&1 | tee -a "$LOG_FILE" | grep -q "frozen"; then
        log_error "Device is frozen. Cannot perform Secure Erase."
        log_message "Try suspending and resuming the system to unfreeze."
        return 1
    fi
    
    # Set password
    log_message "Setting security password..."
    if ! hdparm --user-master u --security-set-pass "$password" "$device" 2>&1 | tee -a "$LOG_FILE"; then
        log_error "Failed to set security password"
        return 1
    fi
    
    # Get estimated time
    local erase_time=$(hdparm -I "$device" | grep "SECURITY ERASE UNIT" | head -n1)
    log_message "Estimated erase time: $erase_time"
    
    # Execute secure erase
    log_message "Executing SECURITY_ERASE command..."
    local start_time=$(date +%s)
    
    if hdparm --user-master u --security-erase "$password" "$device" 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_message "ATA Secure Erase completed successfully"
        log_message "Duration: ${duration} seconds"
        return 0
    else
        log_error "ATA Secure Erase failed"
        return 1
    fi
}

# ============================================================================
# MAIN WIPE FUNCTION
# ============================================================================
execute_wipe() {
    local device="$DEVICE"
    local method="$METHOD"
    
    log_message "========================================="
    log_message "DISK WIPE OPERATION"
    log_message "========================================="
    log_message "Device: $device"
    log_message "Method: $method"
    log_message "Started: $(date '+%Y-%m-%d %H:%M:%S')"
    log_message ""
    
    # Get device info
    if [ "$device" != "SIMULATE" ]; then
        log_message "Device Information:"
        lsblk "$device" -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT 2>&1 | tee -a "$LOG_FILE"
        log_message ""
    fi
    
    local exit_code=0
    
    case "$method" in
        zero)
            wipe_with_dd "/dev/zero" "$device"
            exit_code=$?
            ;;
        random)
            wipe_with_dd "/dev/urandom" "$device"
            exit_code=$?
            ;;
        hdparm)
            if check_hdparm_support "$device"; then
                wipe_with_hdparm "$device"
                exit_code=$?
            else
                if [ "$NO_FALLBACK" = true ]; then
                    log_error "hdparm not supported and fallback disabled"
                    exit_code=1
                else
                    log_message "hdparm not supported, falling back to zero method"
                    wipe_with_dd "/dev/zero" "$device"
                    exit_code=$?
                fi
            fi
            ;;
    esac
    
    local end_time=$(date +%s)
    local total_duration=$((end_time - SCRIPT_START_TIME))
    
    log_message ""
    log_message "========================================="
    log_message "OPERATION COMPLETED"
    log_message "========================================="
    log_message "Completed: $(date '+%Y-%m-%d %H:%M:%S')"
    log_message "Total Duration: ${total_duration} seconds"
    log_message "Exit Code: $exit_code"
    
    return $exit_code
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

# Parse arguments
parse_arguments "$@"

# Show warning header
show_warning_header

# Validate
validate_root
validate_device
validate_method

# Initialize logging
initialize_logging

# Handle SIMULATE mode
if [ "$DEVICE" = "SIMULATE" ]; then
    run_simulate_mode
fi

# Handle DRY RUN mode
if [ "$DRY_RUN" = true ]; then
    run_dry_run
fi

# Require confirmation for destructive operation
if [ "$CONFIRM" != true ]; then
    echo ""
    echo -e "${RED}ERROR: This is a DESTRUCTIVE operation!${NC}"
    echo -e "${RED}You must explicitly confirm by using the --confirm flag.${NC}"
    echo ""
    echo -e "${YELLOW}Example: $0 --device=$DEVICE --method=$METHOD --confirm${NC}"
    echo ""
    exit 1
fi

# Final confirmation prompt
echo ""
echo -e "${RED}You are about to PERMANENTLY ERASE $DEVICE${NC}"
echo -e "${YELLOW}Type 'YES' to continue or anything else to abort: ${NC}"
read -r confirmation

if [ "$confirmation" != "YES" ]; then
    echo ""
    echo -e "${YELLOW}Operation aborted by user.${NC}"
    echo ""
    log_message "Operation aborted by user"
    exit 1
fi

# Execute the wipe
echo ""
echo -e "${GREEN}Starting disk wipe operation...${NC}"
execute_wipe
EXIT_CODE=$?

# Compute and display log hash
LOG_HASH=$(compute_log_hash)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}WIPE OPERATION COMPLETED${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Log File: $LOG_FILE"
echo "Log SHA256: $LOG_HASH"
echo "Exit Code: $EXIT_CODE"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: Disk wipe completed successfully.${NC}"
else
    echo -e "${YELLOW}WARNING: Disk wipe completed with errors. Check log file.${NC}"
fi
echo ""

exit $EXIT_CODE
