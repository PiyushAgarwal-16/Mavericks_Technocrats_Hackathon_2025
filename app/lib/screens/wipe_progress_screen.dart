import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/storage_device.dart';
import '../models/wipe_result.dart';
import '../services/wipe_runner.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../theme/app_colors.dart';
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
  String _status = 'INITIALIZING PROTOCOLS...';

  @override
  void initState() {
    super.initState();
    _startWipe();
  }

  void _startWipe() async {
    // Small delay for UI entrance
    await Future.delayed(const Duration(milliseconds: 500));

    setState(() {
      _status = 'EXECUTING WIPE SEQUENCE...';
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
          _outputLines.add('[LOG] $line');
          _status = 'WIPING SECTORS...';
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
          _outputLines.add('[SYS] $line');
        });
        _scrollToBottom();
      },
      onError: (error) {
        setState(() {
          _outputLines.add('[FATAL] $error');
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
        _status = result.success ? 'SEQUENCE COMPLETE' : 'SEQUENCE FAILED';
      });
    } catch (e) {
      setState(() {
        _result = WipeResult.failure(
          errorMessage: 'Unexpected error: $e',
          exitCode: -1,
        );
        _isRunning = false;
        _status = 'CRITICAL ERROR';
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 100),
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
      child: AppScaffold(
        appBar: AppBar(
          title: Text('Operation Progress', style: Theme.of(context).textTheme.displayMedium),
          automaticallyImplyLeading: !_isRunning,
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Status Panel
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        if (_isRunning)
                          const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.cyan,
                            ),
                          )
                        else
                          Icon(
                            _result?.success == true ? Icons.check_circle : Icons.error,
                            color: _result?.success == true ? AppColors.success : AppColors.error,
                            size: 28,
                          ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _status,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      color: _statusColor,
                                      letterSpacing: 1.2,
                                    ),
                              ),
                              Text(
                                'TARGET: ${widget.device.name} (${widget.device.deviceId})',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    if (_result != null && !_isRunning) ...[
                      const SizedBox(height: 16),
                      Divider(color: AppColors.glassBorder),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('EXIT CODE: ${_result!.exitCode}', style: const TextStyle(fontFamily: 'monospace', color: AppColors.textSecondary)),
                          if (_result?.durationSeconds != null)
                             Text(
                              'DURATION: ${_result!.durationSeconds!.toStringAsFixed(1)}s',
                               style: const TextStyle(fontFamily: 'monospace', color: AppColors.cyan)
                             ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Terminal Output
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.glassBorder),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.terminal, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text('SYSTEM LOG', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Divider(color: AppColors.glassBorder, height: 1),
                      Expanded(
                        child: _outputLines.isEmpty
                            ? Center(
                                child: Text('WAITING FOR STREAM...', style: TextStyle(color: AppColors.textSecondary.withOpacity(0.5))),
                              )
                            : ListView.builder(
                                controller: _scrollController,
                                itemCount: _outputLines.length,
                                itemBuilder: (context, index) {
                                  final line = _outputLines[index];
                                  final isError = line.contains('[ERR]') || line.contains('[FATAL]') || line.contains('[ERROR]');
                                  
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 2),
                                    child: Text(
                                      line,
                                      style: TextStyle(
                                        color: isError ? AppColors.error : AppColors.success,
                                        fontFamily: 'monospace',
                                        fontSize: 12,
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                ), // Fade in
              ),

              // Actions
              if (!_isRunning) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: AppColors.textSecondary),
                        ),
                        child: Text('RETURN TO MENU', style: TextStyle(color: AppColors.textPrimary)),
                      ),
                    ),
                    if (_result?.success == true) ...[
                       const SizedBox(width: 16),
                       Expanded(
                         child: GradientButton(
                           text: 'GENERATE CERTIFICATE',
                           icon: Icons.workspace_premium,
                           onPressed: _navigateToCertificate,
                         ),
                       ),
                    ],
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color get _statusColor {
    if (_isRunning) return AppColors.cyan;
    if (_result?.success == true) return AppColors.success;
    return AppColors.error;
  }

  Future<bool?> _showCancelDialog() {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: AppColors.error)),
        title: const Text('ABORT SEQUENCE?', style: TextStyle(color: AppColors.error)),
        content: const Text(
          'Detailed wipe logs may be interrupted. Physical data state will be unknown.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('CONTINUE', style: TextStyle(color: Colors.white)),
          ),
          ElevatedButton(
            onPressed: () {
              _runner.cancel();
              Navigator.pop(context, true);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('FORCE ABORT'),
          ),
        ],
      ),
    );
  }
}
