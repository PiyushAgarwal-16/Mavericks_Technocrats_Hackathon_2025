#!/bin/bash
################################################################################
# DD Purge - Device Wipe Script
#
# ⚠️  DESTRUCTIVE OPERATION WARNING ⚠️
# This script uses dd to overwrite all data on a device.
# ALL DATA WILL BE PERMANENTLY DESTROYED AND CANNOT BE RECOVERED.
#
# Usage:
#   ./purge_dd.sh --device /dev/sdX --dry-run
#   ./purge_dd.sh --device /dev/sdX
#
################################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

DEVICE=""
DRY_RUN=false

# Parse arguments
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
        --help|-h)
            echo "Usage: $0 --device DEVICE [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --device DEVICE    Device to wipe (e.g., /dev/sdb)"
            echo "  --dry-run          Simulate without writing"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Validate device
if [[ -z "$DEVICE" ]]; then
    echo -e "${RED}❌ --device parameter is required${NC}"
    exit 1
fi

if [[ ! -b "$DEVICE" ]]; then
    echo -e "${RED}❌ Device not found: $DEVICE${NC}"
    exit 1
fi

# Check if mounted
if mount | grep -q "^$DEVICE"; then
    echo -e "${RED}❌ Device $DEVICE has mounted partitions!${NC}"
    echo "Unmount all partitions before wiping."
    mount | grep "^$DEVICE"
    exit 1
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   DD Purge - Device Wipe${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${GREEN}🔍 DRY RUN MODE - No actual changes will be made${NC}"
    echo ""
fi

DEVICE_SIZE=$(blockdev --getsize64 "$DEVICE" 2>/dev/null || echo "0")
DEVICE_SIZE_GB=$(echo "scale=2; $DEVICE_SIZE / 1024 / 1024 / 1024" | bc)

echo "Target Device: $DEVICE"
echo "Size: ${DEVICE_SIZE_GB} GB"
echo ""

if [[ "$DRY_RUN" == false ]]; then
    echo -e "${RED}⚠️  WARNING: This will PERMANENTLY ERASE all data on $DEVICE${NC}"
    echo ""
    read -p "Type 'YES' to proceed: " CONFIRM
    if [[ "$CONFIRM" != "YES" ]]; then
        echo -e "${YELLOW}❌ Operation cancelled.${NC}"
        exit 0
    fi
fi

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${GREEN}[DRY RUN] Would execute:${NC}"
    echo -e "${GREEN}dd if=/dev/zero of=$DEVICE bs=1M status=progress${NC}"
    echo ""
    echo -e "${GREEN}✅ Dry run completed successfully${NC}"
else
    echo "Executing dd to zero-fill device..."
    if dd if=/dev/zero of="$DEVICE" bs=1M status=progress 2>&1; then
        sync
        echo ""
        echo -e "${GREEN}✅ Device purge completed${NC}"
    else
        echo -e "${RED}❌ DD operation failed${NC}"
        exit 1
    fi
fi

exit 0
