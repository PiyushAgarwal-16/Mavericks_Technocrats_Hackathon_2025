import 'dart:convert';
import 'dart:io';
import '../models/storage_device.dart';

/// Service for scanning and detecting physical storage devices
class DeviceScanner {
  /// Scan for available storage devices on the current platform
  Future<List<StorageDevice>> scanDevices() async {
    if (Platform.isWindows) {
      return _scanWindowsDevices();
    } else if (Platform.isLinux) {
      return _scanLinuxDevices();
    } else {
      throw UnsupportedError('Platform ${Platform.operatingSystem} not supported');
    }
  }

  /// Scan devices on Windows using Get-PhysicalDisk
  Future<List<StorageDevice>> _scanWindowsDevices() async {
    try {
      // Try Get-PhysicalDisk first (more detailed info)
      final result = await Process.run(
        'powershell',
        [
          '-Command',
          'Get-PhysicalDisk | ConvertTo-Json'
        ],
      );

      if (result.exitCode == 0 && result.stdout.toString().isNotEmpty) {
        return _parseWindowsPhysicalDisk(result.stdout.toString());
      }
    } catch (e) {
      // Fall back to wmic if Get-PhysicalDisk fails
      print('Get-PhysicalDisk failed, trying wmic: $e');
    }

    // Fallback: use wmic diskdrive
    try {
      final result = await Process.run(
        'wmic',
        ['diskdrive', 'list', 'brief'],
      );

      if (result.exitCode == 0) {
        return _parseWmicOutput(result.stdout.toString());
      }
    } catch (e) {
      print('wmic failed: $e');
    }

    return [];
  }

  /// Parse Get-PhysicalDisk JSON output
  List<StorageDevice> _parseWindowsPhysicalDisk(String jsonOutput) {
    final devices = <StorageDevice>[];

    try {
      final decoded = jsonDecode(jsonOutput);
      final diskList = decoded is List ? decoded : [decoded];

      for (final disk in diskList) {
        // Check if this is the boot disk
        final isSystemDevice = disk['BootFromDisk'] == true ||
            disk['IsBoot'] == true ||
            disk['DeviceId'] == '0';

        devices.add(StorageDevice(
          deviceId: disk['DeviceId']?.toString() ?? disk['Number']?.toString() ?? '?',
          name: disk['FriendlyName']?.toString() ?? 
                disk['Model']?.toString() ?? 
                'Unknown Disk',
          sizeBytes: _parseSize(disk['Size']),
          isMounted: disk['PartitionStyle']?.toString() != 'RAW',
          isSystemDevice: isSystemDevice,
          metadata: {
            'BusType': disk['BusType']?.toString() ?? 'Unknown',
            'MediaType': disk['MediaType']?.toString() ?? 'Unknown',
            'SerialNumber': disk['SerialNumber']?.toString() ?? '',
          },
        ));
      }
    } catch (e) {
      print('Error parsing Get-PhysicalDisk output: $e');
    }

    return devices;
  }

  /// Parse wmic output (fallback for older Windows)
  List<StorageDevice> _parseWmicOutput(String output) {
    final devices = <StorageDevice>[];
    final lines = output.split('\n').where((line) => line.trim().isNotEmpty).toList();

    // Skip header line
    for (int i = 1; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) continue;

      // Parse wmic format (space-separated, roughly)
      final parts = line.split(RegExp(r'\s{2,}'));
      if (parts.isEmpty) continue;

      devices.add(StorageDevice(
        deviceId: i.toString(),
        name: parts[0],
        sizeBytes: null,
        isMounted: true, // Assume mounted if detected by wmic
        isSystemDevice: i == 0, // First disk is usually system
        metadata: {},
      ));
    }

    return devices;
  }

  /// Scan devices on Linux using lsblk
  Future<List<StorageDevice>> _scanLinuxDevices() async {
    try {
      // Use lsblk with JSON output for easier parsing
      final result = await Process.run(
        'lsblk',
        [
          '-d', // List devices only (no partitions)
          '-o', 'NAME,SIZE,TYPE,MOUNTPOINT,MODEL',
          '-b', // Bytes for size
          '-J', // JSON output
        ],
      );

      if (result.exitCode == 0) {
        return _parseLsblkJson(result.stdout.toString());
      }
    } catch (e) {
      print('lsblk failed: $e');
    }

    // Fallback: parse /sys/block
    return _parseLinuxSysBlock();
  }

  /// Parse lsblk JSON output
  List<StorageDevice> _parseLsblkJson(String jsonOutput) {
    final devices = <StorageDevice>[];

    try {
      final decoded = jsonDecode(jsonOutput);
      final blockdevices = decoded['blockdevices'] as List;

      for (final device in blockdevices) {
        // Skip if not a disk (skip loop, rom, etc.)
        if (device['type'] != 'disk') continue;

        final name = device['name']?.toString() ?? '';
        final devicePath = '/dev/$name';

        // Check if device or any of its partitions are mounted
        bool isMounted = device['mountpoint'] != null;

        // Determine if system device (check common patterns)
        final isSystemDevice = _isLinuxSystemDevice(devicePath);

        devices.add(StorageDevice(
          deviceId: devicePath,
          name: device['model']?.toString() ?? name,
          sizeBytes: _parseSize(device['size']),
          isMounted: isMounted,
          isSystemDevice: isSystemDevice,
          metadata: {
            'type': device['type']?.toString() ?? 'disk',
          },
        ));
      }
    } catch (e) {
      print('Error parsing lsblk output: $e');
    }

    return devices;
  }

  /// Fallback: parse /sys/block directory
  Future<List<StorageDevice>> _parseLinuxSysBlock() async {
    final devices = <StorageDevice>[];
    final sysBlockDir = Directory('/sys/block');

    if (!await sysBlockDir.exists()) {
      return devices;
    }

    await for (final entity in sysBlockDir.list()) {
      if (entity is! Directory) continue;

      final name = entity.path.split('/').last;
      
      // Skip virtual devices (loop, ram, dm-*, etc.)
      if (name.startsWith('loop') ||
          name.startsWith('ram') ||
          name.startsWith('dm-')) {
        continue;
      }

      final devicePath = '/dev/$name';
      final isSystemDevice = _isLinuxSystemDevice(devicePath);

      devices.add(StorageDevice(
        deviceId: devicePath,
        name: name,
        sizeBytes: null,
        isMounted: false, // Can't easily determine without lsblk
        isSystemDevice: isSystemDevice,
        metadata: {},
      ));
    }

    return devices;
  }

  /// Check if a Linux device is the system/boot device
  bool _isLinuxSystemDevice(String devicePath) {
    // Common patterns for system devices
    // This is a heuristic - in production, you'd want to check mount points
    if (devicePath.contains('sda') || devicePath.contains('nvme0n1')) {
      return true; // First device is often the system disk
    }
    return false;
  }

  /// Parse size value (handles both int and string representations)
  int? _parseSize(dynamic size) {
    if (size == null) return null;
    if (size is int) return size;
    if (size is String) {
      return int.tryParse(size);
    }
    return null;
  }

  /// Get detailed information about a specific device
  Future<StorageDevice?> getDeviceInfo(String deviceId) async {
    final devices = await scanDevices();
    try {
      return devices.firstWhere((d) => d.deviceId == deviceId);
    } catch (e) {
      return null;
    }
  }

  /// Check if a device is currently mounted
  Future<bool> isDeviceMounted(String devicePath) async {
    if (Platform.isLinux) {
      try {
        final result = await Process.run('mount', []);
        return result.stdout.toString().contains(devicePath);
      } catch (e) {
        print('Error checking mount status: $e');
        return false;
      }
    } else if (Platform.isWindows) {
      try {
        final result = await Process.run(
          'powershell',
          ['-Command', 'Get-Disk -Number $devicePath | Get-Partition'],
        );
        return result.exitCode == 0 && result.stdout.toString().isNotEmpty;
      } catch (e) {
        print('Error checking mount status: $e');
        return false;
      }
    }
    return false;
  }
}
