# Scripts Documentation

This directory contains device wipe scripts for Windows and Linux platforms.

## ⚠️ SAFETY WARNINGS

**CRITICAL: These scripts perform DESTRUCTIVE operations that will PERMANENTLY ERASE all data on target devices.**

### Before Running ANY Script:

1. **ALWAYS** run with `--dry-run` first to verify target device
2. **BACKUP** any data you need from the device
3. **VERIFY** device identifier multiple times
4. **UNMOUNT** all partitions on the device
5. **NEVER** run on system/boot drives

## Windows Scripts

### wipe-device.ps1

PowerShell script for Windows device wiping.

**Requirements:**
- Windows 10/11 or Windows Server
- PowerShell 5.1+
- Administrator privileges

**Usage:**

```powershell
# Test mode (REQUIRED first step)
.\wipe-device.ps1 -Device 1 -DryRun

# Real wipe with confirmation
.\wipe-device.ps1 -Device 1 -Confirm -Method auto -Passes 1

# Specific method
.\wipe-device.ps1 -Device 2 -Confirm -Method overwrite-zero -Passes 3
```

**Parameters:**
- `-Device <number|path>`: Disk number (e.g., 1) or path (e.g., \\.\PhysicalDrive1)
- `-DryRun`: Simulate without writing (ALWAYS use first)
- `-Confirm`: Required flag for actual execution
- `-Method <string>`: Wipe method (auto, secure-erase, overwrite-zero, overwrite-random)
- `-Passes <int>`: Number of overwrite passes (1-7, default: 1)

**Safety Features:**
- Prevents wiping system/boot disks
- Checks for mounted partitions
- Requires explicit confirmation
- Validates disk exists
- Administrator check

## Linux Scripts

### wipe-device.sh

Bash script for Linux device wiping.

**Requirements:**
- Linux (Ubuntu, Debian, RHEL, etc.)
- Bash 4.0+
- Root privileges (sudo)
- Optional: hdparm (for ATA Secure Erase)

**Usage:**

```bash
# Test mode (REQUIRED first step)
sudo ./wipe-device.sh --device /dev/sdb --dry-run

# Real wipe with confirmation
sudo ./wipe-device.sh --device /dev/sdb --confirm --method auto --passes 1

# Specific method
sudo ./wipe-device.sh --device /dev/sdc --confirm --method overwrite-random --passes 3
```

**Parameters:**
- `--device <path>`: Device path (e.g., /dev/sdb)
- `--dry-run`: Simulate without writing (ALWAYS use first)
- `--confirm`: Required flag for actual execution
- `--method <string>`: Wipe method (auto, secure-erase, overwrite-zero, overwrite-random)
- `--passes <int>`: Number of overwrite passes (1-7, default: 1)

**Safety Features:**
- Checks for mounted filesystems
- Validates device exists
- Requires explicit confirmation
- Root privilege check
- Validates device is block device

## Wipe Methods

### 1. Auto (Recommended)

Attempts ATA Secure Erase first, falls back to overwrite if unavailable.

- **Windows:** Falls back to diskpart + zero-fill
- **Linux:** Uses hdparm for Secure Erase, dd for fallback

### 2. Secure Erase

Native ATA Secure Erase command (SATA/NVMe SSDs).

- **Pros:** Fastest, most secure for SSDs
- **Cons:** Requires unfrozen security state, may not be available
- **Standard:** ATA Security Feature Set

### 3. Overwrite (Zero)

Writes zeros to entire device.

- **Pros:** Universal compatibility, NIST compliant (1 pass)
- **Cons:** Slower than Secure Erase
- **Standard:** NIST SP 800-88 (1 pass sufficient)

### 4. Overwrite (Random)

Writes random data to entire device.

- **Pros:** Enhanced security for classified data
- **Cons:** Slowest method
- **Standard:** DoD 5220.22-M (3 passes)

## Output Format

All scripts output JSON for programmatic consumption:

```json
{
  "success": true,
  "device": "/dev/sdb",
  "method": "ATA Secure Erase",
  "passes": 1,
  "durationSeconds": 3600,
  "timestamp": "2025-01-15T10:30:00Z",
  "dryRun": false
}
```

## Integration with Backend

After successful wipe, use the JSON output to create a certificate:

```bash
# Linux example
RESULT=$(sudo ./wipe-device.sh --device /dev/sdb --confirm --method auto | tail -n 7)

# Extract data and POST to API
curl -X POST http://localhost:5000/api/certificates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceInfo": {
      "serialNumber": "...",
      "model": "...",
      "capacity": "...",
      "type": "SSD"
    },
    "wipeDetails": ...,
    "operator": {...}
  }'
```

## Troubleshooting

### Windows

**"Access Denied"**
- Run PowerShell as Administrator
- Check execution policy: `Get-ExecutionPolicy`
- Set if needed: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

**"Disk is system disk"**
- Script prevents wiping system disks for safety
- Verify disk number with `Get-Disk`

### Linux

**"Permission denied"**
- Run with sudo: `sudo ./wipe-device.sh ...`
- Make executable: `chmod +x wipe-device.sh`

**"Device is mounted"**
- Unmount all partitions: `sudo umount /dev/sdb*`
- Check with: `mount | grep sdb`

**"hdparm not found"**
- Install hdparm: `sudo apt install hdparm` (Debian/Ubuntu)
- Script will fall back to dd overwrite

## Best Practices

1. **Always verify device identifier** before running
2. **Start with --dry-run** to test configuration
3. **Use single pass** for most use cases (NIST compliant)
4. **Use 3+ passes** only for classified/sensitive data
5. **Document certificate ID** for future verification
6. **Test verification portal** after certificate creation

## Standards Compliance

- **NIST SP 800-88 Rev. 1**: Clear/Purge guidelines
- **DoD 5220.22-M**: 3-pass overwrite (legacy)
- **IEEE 2883-2022**: Sanitization standard
- **GDPR**: Right to erasure compliance

## Support

For issues or questions:
1. Check this documentation
2. Review script comments
3. Check GitHub issues
4. Contact team members

---

**Last Updated:** 2025-01-15  
**Version:** 1.0.0-MVP
