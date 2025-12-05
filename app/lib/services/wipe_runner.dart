import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../models/wipe_result.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

/// Service for executing external wipe scripts with live output streaming
class WipeRunner {
  final String devicePathOrNumber;
  final bool isWindows;
  final bool useDryRun;
  final String method;
  final bool demoMode;

  Process? _process;
  final _stdoutController = StreamController<String>.broadcast();
  final _stderrController = StreamController<String>.broadcast();

  final StringBuffer _stdoutBuffer = StringBuffer();
  final StringBuffer _stderrBuffer = StringBuffer();

  /// Stream of stdout lines from the wipe script
  Stream<String> get stdoutStream => _stdoutController.stream;

  /// Stream of stderr lines from the wipe script
  Stream<String> get stderrStream => _stderrController.stream;

  WipeRunner({
    required this.devicePathOrNumber,
    required this.isWindows,
    required this.useDryRun,
    required this.method,
    this.demoMode = false,
  });


  /// Helper to extract script from assets to a temporary file
  Future<String> _extractScript(String assetPath) async {
    try {
      final byteData = await rootBundle.load(assetPath);
      final buffer = byteData.buffer;
      final tempDir = await getTemporaryDirectory();
      // Use a unique name or specific name
      final fileName = assetPath.split('/').last;
      final tempFile = File('${tempDir.path}/$fileName');
      
      // Write to file (overwrite if exists to ensure latest version)
      await tempFile.writeAsBytes(
          buffer.asUint8List(byteData.offsetInBytes, byteData.lengthInBytes));
          
      return tempFile.path;
    } catch (e) {
      throw Exception('Failed to extract script from assets: $e');
    }
  }

  /// Build the command and arguments for the wipe script
  List<dynamic> _buildCommand(String scriptPath) {
    if (isWindows) {
      // Windows: PowerShell script (now extracted to temp)
      final deviceNum = demoMode ? '-1' : devicePathOrNumber;
      
      final args = [
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        scriptPath,
        '-DeviceNumber',
        deviceNum,
        '-FileSystem',
        'FAT32',
        '-VolumeName',
        'USB_DRIVE',
        '-AutoElevate', // Automatically request UAC elevation
        '-SkipConfirmation', // Skip the YES prompt - fully automatic!
      ];

      if (useDryRun || demoMode) {
        args.add('-DryRun');
      } else {
        args.add('-Confirm');
      }

      return ['powershell', args];
    } else {
      // Linux: bash purge_dd.sh
      // For Linux, we might need a similar extraction if deployed as AppImage, 
      // but for now keeping relative path logic or assuming installed tool.
      // IF we bundled linux script, we would pass extracted path here too.
      // For now, assuming scriptPath is valid.
      
      final devicePath = demoMode ? 'SIMULATE' : devicePathOrNumber;

      final args = [
        scriptPath,
        '--device=$devicePath',
        '--method=$method',
      ];

      if (useDryRun || demoMode) {
        args.add('--dry-run');
      } else {
        args.add('--confirm');
      }

      return ['bash', args];
    }
  }

  /// Start the wipe process and return the result when complete
  Future<WipeResult> start() async {
    final startTime = DateTime.now();

    try {
      String scriptPath;
      if (isWindows) {
        scriptPath = await _extractScript('assets/scripts/diskpart_clean_format.ps1');
      } else {
        // Fallback for Linux dev environment, or implement extraction there too
        scriptPath = '../../scripts/linux/purge_dd.sh'; 
      }

      final command = _buildCommand(scriptPath);
      final executable = command[0] as String;
      final arguments = command[1] as List<String>;

      _process = await Process.start(
        executable,
        arguments,
        runInShell: true,
      );

      // Listen to stdout
      _process!.stdout
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
        (line) {
          _stdoutBuffer.writeln(line);
          _stdoutController.add(line);
        },
        onError: (error) {
          _stderrController.add('stdout error: $error');
        },
      );

      // Listen to stderr
      _process!.stderr
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
        (line) {
          _stderrBuffer.writeln(line);
          _stderrController.add(line);
        },
        onError: (error) {
          _stderrController.add('stderr error: $error');
        },
      );

      // No need to send YES to stdin - using -SkipConfirmation flag instead

      // Wait for process to complete
      final exitCode = await _process!.exitCode;
      final endTime = DateTime.now();
      final duration = endTime.difference(startTime).inSeconds.toDouble();

      // Close streams
      await _stdoutController.close();
      await _stderrController.close();

      // Parse output for log hash
      final output = _stdoutBuffer.toString();
      final logHash = _extractLogHash(output);
      final logFilePath = _extractLogFilePath(output);

      // Read log file if available
      String logContent = output;
      if (logFilePath != null && File(logFilePath).existsSync()) {
        logContent = await File(logFilePath).readAsString();
      }

      return WipeResult(
        success: exitCode == 0,
        logContent: logContent,
        logHash: logHash,
        exitCode: exitCode,
        logFilePath: logFilePath,
        durationSeconds: duration,
      );
    } catch (e) {
      if (!_stdoutController.isClosed) await _stdoutController.close();
      if (!_stderrController.isClosed) await _stderrController.close();

      return WipeResult.failure(
        errorMessage: 'Failed to execute wipe script: $e',
        exitCode: -1,
      );
    }
  }

  /// Extract SHA256 hash from script output
  String _extractLogHash(String output) {
    // Try multiple common patterns for hash extraction
    final patterns = [
      RegExp(r'Log SHA256:\s*([a-f0-9]{64})', caseSensitive: false),
      RegExp(r'SHA256:\s*([a-f0-9]{64})', caseSensitive: false),
      RegExp(r'Hash:\s*([a-f0-9]{64})', caseSensitive: false),
      RegExp(r'Checksum:\s*([a-f0-9]{64})', caseSensitive: false),
      RegExp(r'\b([a-f0-9]{64})\b', caseSensitive: false), // Any 64-char hex string
    ];
    
    for (final regex in patterns) {
      final match = regex.firstMatch(output);
      if (match != null && match.group(1) != null) {
        return match.group(1)!;
      }
    }
    
    // If no hash found in output, generate one from the log content
    // This ensures we always have a hash for verification
    final bytes = utf8.encode(output);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Extract log file path from script output
  String? _extractLogFilePath(String output) {
    // Look for patterns like: "Log File: ./logs/diskwipe_..."
    final regex = RegExp(r'Log File:\s*(.+\.log)');
    final match = regex.firstMatch(output);
    return match?.group(1)?.trim();
  }

  /// Cancel the running wipe process
  Future<void> cancel() async {
    if (_process != null) {
      _process!.kill();
      await _stdoutController.close();
      await _stderrController.close();
    }
  }

  /// Dispose resources
  void dispose() {
    if (!_stdoutController.isClosed) {
      _stdoutController.close();
    }
    if (!_stderrController.isClosed) {
      _stderrController.close();
    }
  }
}
