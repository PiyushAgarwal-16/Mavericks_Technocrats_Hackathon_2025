/// Represents a physical storage device detected on the system
class StorageDevice {
  /// Device identifier (e.g., "0", "1" for Windows; "/dev/sda", "/dev/sdb" for Linux)
  final String deviceId;

  /// Friendly name or model of the device
  final String name;

  /// Size in bytes
  final int? sizeBytes;

  /// Whether the device is currently mounted
  final bool isMounted;

  /// Whether this is the system/boot device (not safe to wipe)
  final bool isSystemDevice;

  /// Additional device info (serial number, etc.)
  final Map<String, String> metadata;

  const StorageDevice({
    required this.deviceId,
    required this.name,
    this.sizeBytes,
    this.isMounted = false,
    this.isSystemDevice = false,
    this.metadata = const {},
  });

  /// Human-readable size string (e.g., "120.0 GB")
  String get sizeFormatted {
    if (sizeBytes == null) return 'Unknown';
    if (sizeBytes! < 1024) return '$sizeBytes B';
    if (sizeBytes! < 1024 * 1024) {
      return '${(sizeBytes! / 1024).toStringAsFixed(1)} KB';
    }
    if (sizeBytes! < 1024 * 1024 * 1024) {
      return '${(sizeBytes! / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(sizeBytes! / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  /// Whether this device is safe to wipe
  bool get isSafeToWipe => !isSystemDevice && !isMounted;

  @override
  String toString() {
    return 'StorageDevice(id: $deviceId, name: $name, size: $sizeFormatted, safe: $isSafeToWipe)';
  }
}
