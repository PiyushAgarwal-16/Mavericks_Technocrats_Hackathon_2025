#!/bin/bash
################################################################################
# ZeroTrace Linux Device Purge Script
#
# ⚠️  DESTRUCTIVE OPERATION WARNING ⚠️
# This script performs PURGE-LEVEL wipes on storage devices.
# ALL DATA WILL BE PERMANENTLY DESTROYED AND CANNOT BE RECOVERED.
#
# Safety Features:
# - Requires --confirm flag for actual execution
# - Supports --dry-run for simulation (no destructive operations)
# - Attempts ATA Secure Erase (hdparm) when available
# - Falls back to dd zero/random overwrite
# - Prevents wiping mounted filesystems
#
# Usage:
#   ./wipe-device.sh --device /dev/sdX --dry-run
#   ./wipe-device.sh --device /dev/sdX --confirm [--method auto] [--passes 1]
#
# Methods:
#   auto            - Try secure erase, fall back to overwrite (default)
#   secure-erase    - ATA Secure Erase only
#   overwrite-zero  - Overwrite with zeros using dd
#   overwrite-random - Overwrite with random data using dd
#
################################################################################

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# Configuration & Defaults
# ═══════════════════════════════════════════════════════════════════════════
DEVICE=""
DRY_RUN=false
CONFIRM=false
METHOD="auto"
PASSES=1
BLOCK_SIZE="1M"

# ═══════════════════════════════════════════════════════════════════════════
# Colors
# ═══════════════════════════════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════
log_info() {
    echo -e "${CYAN}$1${NC}"
}

log_success() {
    echo -e "${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

log_error() {
    echo -e "${RED}$1${NC}" >&2
}

# ═══════════════════════════════════════════════════════════════════════════
# Parse Arguments
# ═══════════════════════════════════════════════════════════════════════════
while [[ $# -gt 0 ]]; do
    case $1 in
        --device)
            DEVICE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --confirm)
            CONFIRM=true
            shift
            ;;
        --method)
            METHOD="$2"
            shift 2
            ;;
        --passes)
            PASSES="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Usage: $0 --device DEVICE [OPTIONS]

Options:
    --device DEVICE       Device to wipe (e.g., /dev/sdb)
    --dry-run            Simulate operation without writing
    --confirm            Confirm destructive operation
    --method METHOD      Wipe method: auto, secure-erase, overwrite-zero, overwrite-random
    --passes N           Number of overwrite passes (1-7, default: 1)
    --help, -h           Show this help message

Examples:
    $0 --device /dev/sdb --dry-run
    $0 --device /dev/sdb --confirm --method auto --passes 1
EOF
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ═══════════════════════════════════════════════════════════════════════════
# Safety Checks
# ═══════════════════════════════════════════════════════════════════════════

# Check root privileges
if [[ $EUID -ne 0 ]]; then
    log_error "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Require device
if [[ -z "$DEVICE" ]]; then
    log_error "❌ --device parameter is required"
    exit 1
fi

# Require confirmation
if [[ "$DRY_RUN" == false && "$CONFIRM" == false ]]; then
    log_error "❌ SAFETY: You must specify either --dry-run or --confirm flag"
    echo ""
    log_warning "⚠️  This is a DESTRUCTIVE operation that will PERMANENTLY ERASE all data."
    echo "   Use --dry-run to simulate, or --confirm to execute."
    exit 1
fi

# Validate device exists
if [[ ! -b "$DEVICE" ]]; then
    log_error "❌ Device not found: $DEVICE"
    exit 1
fi

# Check if device is mounted
if mount | grep -q "^$DEVICE"; then
    log_error "❌ SAFETY: Device $DEVICE has mounted partitions!"
    log_error "   Unmount all partitions before wiping."
    mount | grep "^$DEVICE"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════
# Display Banner
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   ZeroTrace Device Purge - Linux${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""

if [[ "$DRY_RUN" == true ]]; then
    log_success "🔍 DRY RUN MODE - No actual changes will be made"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════
# Get Device Information
# ═══════════════════════════════════════════════════════════════════════════
log_info "📋 Device Information:"

DEVICE_SIZE=$(blockdev --getsize64 "$DEVICE" 2>/dev/null || echo "0")
DEVICE_SIZE_GB=$(echo "scale=2; $DEVICE_SIZE / 1024 / 1024 / 1024" | bc)

echo "   Device: $DEVICE"
echo "   Size: ${DEVICE_SIZE_GB} GB"

if command -v lsblk &> /dev/null; then
    DEVICE_MODEL=$(lsblk -ndo MODEL "$DEVICE" 2>/dev/null || echo "Unknown")
    DEVICE_TYPE=$(lsblk -ndo TYPE "$DEVICE" 2>/dev/null || echo "Unknown")
    echo "   Model: $DEVICE_MODEL"
    echo "   Type: $DEVICE_TYPE"
fi

echo ""
log_info "⚙️  Wipe Configuration:"
echo "   Method: $METHOD"
echo "   Passes: $PASSES"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Final Confirmation
# ═══════════════════════════════════════════════════════════════════════════
if [[ "$DRY_RUN" == false ]]; then
    log_error "⚠️  ═══════════════════ FINAL WARNING ═══════════════════ ⚠️"
    log_error "   ALL DATA ON THIS DEVICE WILL BE PERMANENTLY DESTROYED!"
    log_error "   This action CANNOT be undone!"
    log_error "⚠️  ══════════════════════════════════════════════════════ ⚠️"
    echo ""
    
    read -p "Type 'WIPE' to proceed: " FINAL_CONFIRM
    if [[ "$FINAL_CONFIRM" != "WIPE" ]]; then
        log_warning "❌ Operation cancelled."
        exit 0
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# Wipe Functions
# ═══════════════════════════════════════════════════════════════════════════

test_secure_erase_available() {
    if ! command -v hdparm &> /dev/null; then
        log_warning "   hdparm not found, secure erase unavailable"
        return 1
    fi
    
    # Check if device supports secure erase
    if hdparm -I "$DEVICE" 2>/dev/null | grep -q "not.*frozen"; then
        return 0
    fi
    
    return 1
}

invoke_secure_erase() {
    log_info "🔒 Attempting ATA Secure Erase..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log_success "   [DRY RUN] Would execute: hdparm --security-erase"
        sleep 2
        return 0
    fi
    
    # Set security password
    if ! hdparm --user-master u --security-set-pass PasSWorD "$DEVICE"; then
        log_error "   ❌ Failed to set security password"
        return 1
    fi
    
    # Execute secure erase
    if ! hdparm --user-master u --security-erase PasSWorD "$DEVICE"; then
        log_error "   ❌ Secure erase failed"
        return 1
    fi
    
    log_success "   ✅ Secure erase completed"
    return 0
}

invoke_overwrite() {
    local pattern="$1"
    local input_source
    
    if [[ "$pattern" == "zero" ]]; then
        input_source="/dev/zero"
        log_info "📝 Overwriting with zeros..."
    else
        input_source="/dev/urandom"
        log_info "📝 Overwriting with random data..."
    fi
    
    for ((pass=1; pass<=PASSES; pass++)); do
        echo "   Pass $pass/$PASSES..."
        
        if [[ "$DRY_RUN" == true ]]; then
            log_success "   [DRY RUN] Would execute: dd if=$input_source of=$DEVICE bs=$BLOCK_SIZE"
            sleep 1
            continue
        fi
        
        if dd if="$input_source" of="$DEVICE" bs="$BLOCK_SIZE" status=progress 2>&1; then
            log_success "   ✅ Pass $pass completed"
        else
            log_error "   ❌ Pass $pass failed"
            return 1
        fi
    done
    
    # Sync to ensure all writes are flushed
    if [[ "$DRY_RUN" == false ]]; then
        sync
    fi
    
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
# Main Wipe Logic
# ═══════════════════════════════════════════════════════════════════════════

START_TIME=$(date +%s)
SUCCESS=false
WIPE_METHOD=""

case "$METHOD" in
    auto)
        if test_secure_erase_available; then
            if invoke_secure_erase; then
                WIPE_METHOD="ATA Secure Erase"
                SUCCESS=true
            else
                log_warning "Secure erase failed, falling back to overwrite..."
                if invoke_overwrite "zero"; then
                    WIPE_METHOD="Overwrite (zero, $PASSES pass(es))"
                    SUCCESS=true
                fi
            fi
        else
            if invoke_overwrite "zero"; then
                WIPE_METHOD="Overwrite (zero, $PASSES pass(es))"
                SUCCESS=true
            fi
        fi
        ;;
    secure-erase)
        if invoke_secure_erase; then
            WIPE_METHOD="ATA Secure Erase"
            SUCCESS=true
        fi
        ;;
    overwrite-zero)
        if invoke_overwrite "zero"; then
            WIPE_METHOD="Overwrite (zero, $PASSES pass(es))"
            SUCCESS=true
        fi
        ;;
    overwrite-random)
        if invoke_overwrite "random"; then
            WIPE_METHOD="Overwrite (random, $PASSES pass(es))"
            SUCCESS=true
        fi
        ;;
    *)
        log_error "Unknown method: $METHOD"
        exit 1
        ;;
esac

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# ═══════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
if [[ "$SUCCESS" == true ]]; then
    log_success "   Wipe Complete!"
else
    log_error "   Wipe Failed!"
fi
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo ""
log_info "📊 Summary:"
echo "   Device: $DEVICE"
echo "   Method: $WIPE_METHOD"
echo "   Duration: $DURATION seconds"
if [[ "$SUCCESS" == true ]]; then
    log_success "   Status: ✅ Success"
else
    log_error "   Status: ❌ Failed"
fi
if [[ "$DRY_RUN" == true ]]; then
    log_success "   Mode: 🔍 DRY RUN (no actual changes made)"
fi
echo ""

# Output JSON for programmatic consumption
log_info "📋 JSON Output:"
cat << EOF | tee /tmp/zerotrace-wipe-result.json
{
  "success": $SUCCESS,
  "device": "$DEVICE",
  "method": "$WIPE_METHOD",
  "passes": $PASSES,
  "durationSeconds": $DURATION,
  "timestamp": "$(date -Iseconds)",
  "dryRun": $DRY_RUN
}
EOF

echo ""

exit $([ "$SUCCESS" == true ] && echo 0 || echo 1)
