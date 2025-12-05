# ZeroTrace Wipe Scripts

Production-ready device wipe scripts for Windows (PowerShell) and Linux (Bash) with comprehensive safety features, logging, and SIMULATE mode for testing.

## 🔐 Safety Features

Both scripts implement **identical safety philosophy**:

- ✅ **--confirm flag required** - Prevents accidental execution
- ✅ **--dry-run mode** - Shows what would happen without executing
- ✅ **Large WARNING headers** - Clear visual indication of danger
- ✅ **Double confirmation** - Requires typing "YES" before execution
- ✅ **Device validation** - Prevents accidental wipes
- ✅ **Timestamped logging** - All actions logged with timestamps
- ✅ **SHA256 log hashing** - Cryptographic verification of logs
- ✅ **Exit codes** - Non-zero on failure for automation
- ✅ **SIMULATE mode** - Demo mode for Flutter/testing (DeviceNumber=-1 or device=SIMULATE)

## 📁 Scripts

### Windows: `diskpart_clean_all.ps1`
PowerShell script using diskpart's "clean all" command.

**Requirements:**
- Windows 10/11
- PowerShell 5.1+
- Administrator privileges

**Usage:**
```powershell
# Dry run (show what would happen)
.\diskpart_clean_all.ps1 -DeviceNumber 1 -DryRun

# Actual wipe (requires confirmation)
.\diskpart_clean_all.ps1 -DeviceNumber 1 -Confirm

# Simulate mode for testing
.\diskpart_clean_all.ps1 -DeviceNumber -1 -Confirm
```

**Parameters:**
- `-DeviceNumber` (required) - Disk number (0, 1, 2...) or -1 for SIMULATE
- `-DryRun` - Show commands without executing
- `-Confirm` - REQUIRED for actual execution
- `-LogDir` - Log directory (default: ./logs)

### Linux: `purge_dd.sh`
Bash script with multiple wipe methods (dd zero/random, hdparm).

**Requirements:**
- Linux (Ubuntu, Debian, CentOS, etc.)
- Bash 4.0+
- Root/sudo privileges
- Optional: hdparm (for ATA Secure Erase)

**Usage:**
```bash
# Dry run (show what would happen)
./purge_dd.sh --device=/dev/sdb --method=zero --dry-run

# Actual wipe (requires confirmation)
./purge_dd.sh --device=/dev/sdb --method=zero --confirm

# ATA Secure Erase with auto-fallback
./purge_dd.sh --device=/dev/sdb --method=hdparm --confirm

# Simulate mode for testing
./purge_dd.sh --device=SIMULATE --method=zero --confirm
```

**Arguments:**
- `--device=<device>` (required) - Device path (e.g., /dev/sdb) or "SIMULATE"
- `--method=<method>` (required) - Wipe method: zero, random, or hdparm
- `--dry-run` - Show commands without executing
- `--confirm` - REQUIRED for actual execution
- `--log-dir=<dir>` - Log directory (default: ./logs)
- `--no-fallback` - Disable hdparm→zero auto-fallback

## 🎯 Wipe Methods

### Windows (diskpart)
- **clean all** - Zeros all sectors (purge-level)

### Linux (dd / hdparm)
- **zero** - Overwrite with zeros (`dd if=/dev/zero`)
- **random** - Overwrite with random data (`dd if=/dev/urandom`)
- **hdparm** - ATA Secure Erase (firmware-level, with auto-fallback to zero)

## 📋 Usage Examples

### Windows Examples

```powershell
# Check available disks first
Get-Disk

# Dry run to see what would happen
.\diskpart_clean_all.ps1 -DeviceNumber 1 -DryRun

# Execute wipe with confirmation
.\diskpart_clean_all.ps1 -DeviceNumber 1 -Confirm
# (Will prompt: Type 'YES' to continue)

# Custom log directory
.\diskpart_clean_all.ps1 -DeviceNumber 2 -Confirm -LogDir "C:\WipeLogs"

# SIMULATE mode for testing
.\diskpart_clean_all.ps1 -DeviceNumber -1 -Confirm
```

### Linux Examples

```bash
# Check available devices first
lsblk

# Dry run to see what would happen
./purge_dd.sh --device=/dev/sdb --method=zero --dry-run

# Execute zero wipe with confirmation
./purge_dd.sh --device=/dev/sdb --method=zero --confirm
# (Will prompt: Type 'YES' to continue)

# Random data wipe
./purge_dd.sh --device=/dev/sdc --method=random --confirm

# ATA Secure Erase (with automatic fallback)
./purge_dd.sh --device=/dev/sdb --method=hdparm --confirm

# ATA Secure Erase without fallback (fails if not supported)
./purge_dd.sh --device=/dev/sdb --method=hdparm --confirm --no-fallback

# Custom log directory
./purge_dd.sh --device=/dev/sdb --method=zero --confirm --log-dir=/var/log/wipes

# SIMULATE mode for testing
./purge_dd.sh --device=SIMULATE --method=hdparm --confirm
```

## 📊 Logging

### Log Files
Both scripts create timestamped log files:

**Windows:**
```
./logs/diskwipe_disk1_20251205_143022.log
```

**Linux:**
```
./logs/diskwipe__dev_sdb_20251205_143022.log
```

### Log Contents
Each log contains:
- Timestamp of operation
- Device information
- Method used
- Full command output
- Duration
- Exit code
- SHA256 hash (computed and displayed at end)

### Example Log Output
```
[2025-12-05 14:30:22] Starting disk wipe operation
[2025-12-05 14:30:22] Target: Disk 1
[2025-12-05 14:30:22] Method: diskpart CLEAN ALL
[2025-12-05 14:30:22] Disk Info: Size=120.03GB, PartitionStyle=GPT
[2025-12-05 14:30:23] Executing diskpart...
[2025-12-05 14:32:45] Wipe completed in 142.5 seconds
[2025-12-05 14:32:45] Exit Code: 0
```

## 🧪 Testing with SIMULATE Mode

Both scripts include a **SIMULATE mode** for safe testing without actual hardware:

### Windows SIMULATE
```powershell
.\diskpart_clean_all.ps1 -DeviceNumber -1 -Confirm
```

### Linux SIMULATE
```bash
./purge_dd.sh --device=SIMULATE --method=zero --confirm
```

SIMULATE mode:
- Generates realistic demo logs
- No actual disk operations
- Safe for testing Flutter apps
- Returns success (exit code 0)
- Produces valid SHA256 hash

## ⚠️ Safety Warnings

### DO NOT run these scripts:
- Without testing in SIMULATE mode first
- Without verifying the device number/path
- On devices with mounted partitions
- On your system drive
- Without backups of important data
- In production without dry-run testing

### ALWAYS:
- Use --dry-run first
- Double-check device identifiers
- Unmount all partitions
- Verify backups before proceeding
- Test with SIMULATE mode
- Review logs after completion

## 🔧 Integration with Backend

Both scripts output JSON-compatible data for easy backend integration:

### Script Output Format
```
Log File: ./logs/diskwipe_disk1_20251205_143022.log
Log SHA256: abc123def456...
Exit Code: 0
```

### Backend Integration Example
```javascript
const { exec } = require('child_process');

// Windows
exec(
  'powershell -File ./scripts/windows/diskpart_clean_all.ps1 -DeviceNumber 1 -Confirm',
  (error, stdout, stderr) => {
    const logHashMatch = stdout.match(/Log SHA256: ([a-f0-9]+)/);
    const exitCode = error ? error.code : 0;
    // Process results...
  }
);

// Linux
exec(
  './scripts/linux/purge_dd.sh --device=/dev/sdb --method=zero --confirm <<< "YES"',
  (error, stdout, stderr) => {
    const logHashMatch = stdout.match(/Log SHA256: ([a-f0-9]+)/);
    const exitCode = error ? error.code : 0;
    // Process results...
  }
);
```

## 📈 Exit Codes

Both scripts use standard exit codes:

- `0` - Success
- `1` - General error
- Other non-zero - Specific failures

## 📄 License

MIT
