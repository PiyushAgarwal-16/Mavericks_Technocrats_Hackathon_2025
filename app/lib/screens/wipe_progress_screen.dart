import 'dart:io';
import 'package:flutter/material.dart';
import '../models/storage_device.dart';
import '../models/wipe_result.dart';
import '../services/wipe_runner.dart';
import 'certificate_preview_screen.dart';

/// Screen that shows live wipe progress with streaming output
class WipeProgressScreen extends StatefulWidget {
  final StorageDevice device;
  final String method;
  final bool useDryRun;
  final bool demoMode;

  const WipeProgressScreen({
    super.key,
    required this.device,
    required this.method,
    this.useDryRun = false,
    this.demoMode = false,
  });

  @override
  State<WipeProgressScreen> createState() => _WipeProgressScreenState();
}

class _WipeProgressScreenState extends State<WipeProgressScreen> {
  late WipeRunner _runner;
  final List<String> _outputLines = [];
  final ScrollController _scrollController = ScrollController();
  
  bool _isRunning = true;
  WipeResult? _result;
  String _status = 'Initializing...';

  @override
  void initState() {
    super.initState();
    _startWipe();
  }

  void _startWipe() async {
    setState(() {
      _status = 'Starting wipe process...';
    });

    _runner = WipeRunner(
      devicePathOrNumber: widget.device.deviceId,
      isWindows: Platform.isWindows,
      useDryRun: widget.useDryRun,
      method: widget.method,
      demoMode: widget.demoMode,
    );

    // Listen to stdout
    _runner.stdoutStream.listen(
      (line) {
        setState(() {
          _outputLines.add('[OUT] $line');
          _status = 'Running...';
        });
        _scrollToBottom();
      },
      onError: (error) {
        setState(() {
          _outputLines.add('[ERROR] $error');
        });
        _scrollToBottom();
      },
    );

    // Listen to stderr
    _runner.stderrStream.listen(
      (line) {
        setState(() {
          _outputLines.add('[ERR] $line');
        });
        _scrollToBottom();
      },
      onError: (error) {
        setState(() {
          _outputLines.add('[ERROR] $error');
        });
        _scrollToBottom();
      },
    );

    // Start the wipe and wait for result
    try {
      final result = await _runner.start();
      setState(() {
        _result = result;
        _isRunning = false;
        _status = result.success ? 'Completed Successfully' : 'Failed';
      });
    } catch (e) {
      setState(() {
        _result = WipeResult.failure(
          errorMessage: 'Unexpected error: $e',
          exitCode: -1,
        );
        _isRunning = false;
        _status = 'Error';
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _navigateToCertificate() {
    if (_result != null && _result!.success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => CertificatePreviewScreen(
            wipeResult: _result!,
            device: widget.device,
            method: widget.method,
          ),
        ),
      );
    }
  }

  @override
  void dispose() {
    _runner.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_isRunning) {
          final shouldPop = await _showCancelDialog();
          return shouldPop ?? false;
        }
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Wipe Progress'),
          automaticallyImplyLeading: !_isRunning,
        ),
        body: Column(
          children: [
            // Status header
            Container(
              padding: const EdgeInsets.all(16),
              color: _getStatusColor(),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (_isRunning)
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      else
                        Icon(
                          _result?.success == true
                              ? Icons.check_circle
                              : Icons.error,
                          color: Colors.white,
                        ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _status,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${widget.device.name} (${widget.device.deviceId})',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (_result != null && !_isRunning) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Exit Code: ${_result!.exitCode}',
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ),
                        if (_result!.durationSeconds != null)
                          Text(
                            'Duration: ${_result!.durationSeconds!.toStringAsFixed(1)}s',
                            style: const TextStyle(color: Colors.white70),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Output log
            Expanded(
              child: Container(
                color: Colors.black,
                child: _outputLines.isEmpty
                    ? const Center(
                        child: Text(
                          'Waiting for output...',
                          style: TextStyle(color: Colors.white54),
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(8),
                        itemCount: _outputLines.length,
                        itemBuilder: (context, index) {
                          final line = _outputLines[index];
                          final isError = line.startsWith('[ERR]') ||
                              line.startsWith('[ERROR]');
                          
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 2),
                            child: Text(
                              line,
                              style: TextStyle(
                                color: isError ? Colors.red : Colors.green,
                                fontFamily: 'monospace',
                                fontSize: 12,
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ),

            // Result summary (shown when complete)
            if (_result != null && !_isRunning) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  border: const Border(
                    top: BorderSide(color: Colors.grey, width: 1),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Result Summary',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_result!.logHash.isNotEmpty)
                      Text('Log Hash: ${_result!.logHash.substring(0, 16)}...'),
                    if (_result!.logFilePath != null)
                      Text('Log File: ${_result!.logFilePath}'),
                  ],
                ),
              ),
            ],

            // Action buttons
            if (!_isRunning && _result != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Back to Devices'),
                      ),
                    ),
                    if (_result!.success) ...[
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _navigateToCertificate,
                          child: const Text('Generate Certificate'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor() {
    if (_isRunning) return Colors.blue;
    if (_result?.success == true) return Colors.green;
    return Colors.red;
  }

  Future<bool?> _showCancelDialog() {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Wipe?'),
        content: const Text(
          'The wipe operation is still running. Are you sure you want to cancel?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Continue Wipe'),
          ),
          ElevatedButton(
            onPressed: () {
              _runner.cancel();
              Navigator.pop(context, true);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Cancel Wipe'),
          ),
        ],
      ),
    );
  }
}
