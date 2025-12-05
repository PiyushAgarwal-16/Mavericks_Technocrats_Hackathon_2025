/// Result of a disk wipe operation
class WipeResult {
  /// Whether the wipe completed successfully
  final bool success;

  /// Full log content from the wipe operation
  final String logContent;

  /// SHA256 hash of the log file
  final String logHash;

  /// Exit code from the wipe script
  final int exitCode;

  /// Path to the log file on disk
  final String? logFilePath;

  /// Duration of the wipe operation in seconds
  final double? durationSeconds;

  const WipeResult({
    required this.success,
    required this.logContent,
    required this.logHash,
    required this.exitCode,
    this.logFilePath,
    this.durationSeconds,
  });

  /// Create a WipeResult representing a failure
  factory WipeResult.failure({
    required String errorMessage,
    required int exitCode,
  }) {
    return WipeResult(
      success: false,
      logContent: errorMessage,
      logHash: '',
      exitCode: exitCode,
    );
  }

  @override
  String toString() {
    return 'WipeResult(success: $success, exitCode: $exitCode, logHash: $logHash)';
  }
}
