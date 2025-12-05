import 'dart:io';
import 'package:flutter/material.dart';
import '../models/storage_device.dart';
import '../widgets/app_scaffold.dart';
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
        title: const Text('⚠️ Confirm Wipe'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'This will PERMANENTLY delete all data on:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Device: ${widget.device.name}'),
            Text('ID: ${widget.device.deviceId}'),
            Text('Size: ${widget.device.sizeFormatted}'),
            const SizedBox(height: 16),
            if (_demoMode)
              const Text(
                '🧪 DEMO MODE - No actual wipe will occur',
                style: TextStyle(
                  color: Colors.blue,
                  fontWeight: FontWeight.bold,
                ),
              )
            else if (_useDryRun)
              const Text(
                '🔍 DRY RUN - Preview only, no changes',
                style: TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              )
            else
              const Text(
                '🔥 THIS CANNOT BE UNDONE!',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToProgress();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _useDryRun || _demoMode ? Colors.orange : Colors.red,
            ),
            child: Text(_useDryRun || _demoMode ? 'Continue' : 'WIPE NOW'),
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
        title: const Text('Wipe Options'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Device info card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Selected Device',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Name: ${widget.device.name}'),
                    Text('ID: ${widget.device.deviceId}'),
                    Text('Size: ${widget.device.sizeFormatted}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Method selection (Linux only)
            if (Platform.isLinux) ...[
              const Text(
                'Wipe Method',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              ..._linuxMethods.map((method) {
                return RadioListTile<String>(
                  title: Text(method['name']!),
                  subtitle: Text(method['description']!),
                  value: method['id']!,
                  groupValue: _selectedMethod,
                  onChanged: (value) {
                    setState(() {
                      _selectedMethod = value!;
                    });
                  },
                );
              }),
              const SizedBox(height: 24),
            ],

            // Options
            const Text(
              'Options',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              title: const Text('Demo Mode'),
              subtitle: const Text(
                'Safe testing mode - generates fake logs without touching hardware',
              ),
              value: _demoMode,
              onChanged: (value) {
                setState(() {
                  _demoMode = value;
                  if (value) {
                    _useDryRun = false; // Demo mode overrides dry-run
                  }
                });
              },
            ),
            SwitchListTile(
              title: const Text('Dry Run'),
              subtitle: const Text(
                'Preview commands without executing',
              ),
              value: _useDryRun,
              onChanged: _demoMode ? null : (value) {
                setState(() {
                  _useDryRun = value;
                });
              },
            ),
            const SizedBox(height: 32),

            // Warning box
            if (!_demoMode && !_useDryRun)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'This will PERMANENTLY erase all data on the selected device. This action cannot be undone!',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Start button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _startWipe,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _useDryRun || _demoMode ? Colors.orange : Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  _demoMode
                      ? 'START DEMO'
                      : _useDryRun
                          ? 'PREVIEW WIPE'
                          : 'START WIPE',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
