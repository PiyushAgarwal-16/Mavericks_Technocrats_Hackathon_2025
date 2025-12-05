import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/storage_device.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../theme/app_colors.dart';
import 'wipe_progress_screen.dart';

/// Screen for configuring wipe options before execution
class WipeOptionsScreen extends StatefulWidget {
  final StorageDevice device;

  const WipeOptionsScreen({
    super.key,
    required this.device,
  });

  @override
  State<WipeOptionsScreen> createState() => _WipeOptionsScreenState();
}

class _WipeOptionsScreenState extends State<WipeOptionsScreen> {
  String _selectedMethod = 'zero';
  bool _useDryRun = false;
  bool _demoMode = false;

  final List<Map<String, String>> _linuxMethods = [
    {
      'id': 'zero',
      'name': 'Zero Wipe',
      'description': 'Overwrite with zeros (fast, secure)',
    },
    {
      'id': 'random',
      'name': 'Random Wipe',
      'description': 'Overwrite with random data (slower, more secure)',
    },
    {
      'id': 'hdparm',
      'name': 'ATA Secure Erase',
      'description': 'Firmware-level erase (fastest, very secure)',
    },
  ];

  void _startWipe() {
    // Show confirmation dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppColors.error.withOpacity(0.5))),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: AppColors.error),
            const SizedBox(width: 8),
            Text('CONFIRM DESTRUCTION',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.error)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'PERMANENT DATA LOSS IMMINENT',
              style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, letterSpacing: 1),
            ),
            const SizedBox(height: 16),
            _buildDialogInfoRow('TARGET', widget.device.name),
            _buildDialogInfoRow('ID', widget.device.deviceId),
            _buildDialogInfoRow('CAPACITY', widget.device.sizeFormatted),
            const SizedBox(height: 16),
            if (_demoMode)
              Text(
                '🧪 DEMO MODE ACTIVE - No data will be written.',
                style: TextStyle(color: AppColors.cyan, fontWeight: FontWeight.bold),
              )
            else if (_useDryRun)
              Text(
                '🔍 DRY RUN - Command preview only.',
                style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
              )
            else
              Text(
                '🔥 ACTION IS IRREVERSIBLE.',
                style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('ABORT', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToProgress();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _useDryRun || _demoMode ? Colors.orange : AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: Text(_useDryRun || _demoMode ? 'PROCEED' : 'DESTROY DATA'),
          ),
        ],
      ),
    );
  }

  Widget _buildDialogInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(color: Colors.white, fontFamily: 'monospace')),
          ),
        ],
      ),
    );
  }

  void _navigateToProgress() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WipeProgressScreen(
          device: widget.device,
          method: _selectedMethod,
          useDryRun: _useDryRun,
          demoMode: _demoMode,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: Text('Wipe Configuration', style: Theme.of(context).textTheme.displayMedium),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.cyan),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Device info card
            Text('TARGET DEVICE', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.cyan)),
            const SizedBox(height: 8),
            GlassCard(
              child: Row(
                children: [
                  Icon(Icons.storage, size: 48, color: AppColors.cyan),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.device.name, style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 4),
                        Text('ID: ${widget.device.deviceId}', style: Theme.of(context).textTheme.bodySmall),
                        Text('SIZE: ${widget.device.sizeFormatted}', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Method selection (Linux only)
            if (Platform.isLinux) ...[
              Text('ERASURE ALGORITHM', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.cyan)),
              const SizedBox(height: 8),
              GlassCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: _linuxMethods.map((method) {
                    final isSelected = _selectedMethod == method['id'];
                    return RadioListTile<String>(
                      title: Text(method['name']!, style: TextStyle(color: isSelected ? AppColors.cyan : Colors.white)),
                      subtitle: Text(method['description']!, style: TextStyle(color: AppColors.textSecondary)),
                      value: method['id']!,
                      groupValue: _selectedMethod,
                      activeColor: AppColors.cyan,
                      onChanged: (value) {
                        setState(() {
                          _selectedMethod = value!;
                        });
                      },
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 32),
            ],

            // Options
            Text('OPERATION PARAMETERS', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.cyan)),
            const SizedBox(height: 8),
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Demo Mode', style: TextStyle(color: Colors.white)),
                    subtitle: const Text('Simulate wipe process (Safe)', style: TextStyle(color: AppColors.textSecondary)),
                    value: _demoMode,
                    activeColor: AppColors.cyan,
                    onChanged: (value) {
                      setState(() {
                        _demoMode = value;
                        if (value) _useDryRun = false;
                      });
                    },
                  ),
                  Divider(color: AppColors.glassBorder, height: 1),
                  SwitchListTile(
                    title: const Text('Dry Run', style: TextStyle(color: Colors.white)),
                    subtitle: const Text('Preview commands only', style: TextStyle(color: AppColors.textSecondary)),
                    value: _useDryRun,
                    activeColor: AppColors.cyan,
                    onChanged: _demoMode ? null : (value) {
                      setState(() {
                        _useDryRun = value;
                      });
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 48),

            // Start button
            GradientButton(
              text: _demoMode ? 'INITIALIZE DEMO' : (_useDryRun ? 'RUN PREVIEW' : 'INITIATE WIPE PROTOCOL'),
              icon: Icons.dangerous,
              isFullWidth: true,
              onPressed: _startWipe,
            ),
          ],
        ),
      ),
    );
  }
}
