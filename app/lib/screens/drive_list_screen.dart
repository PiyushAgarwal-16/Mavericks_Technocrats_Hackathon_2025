import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../models/storage_device.dart';
import '../services/device_scanner.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/glass_card.dart';
import '../theme/app_colors.dart';
import 'wipe_options_screen.dart';

/// Screen to display and select storage devices for wiping
class DriveListScreen extends StatefulWidget {
  const DriveListScreen({super.key});

  @override
  State<DriveListScreen> createState() => _DriveListScreenState();
}

class _DriveListScreenState extends State<DriveListScreen> {
  final DeviceScanner _scanner = DeviceScanner();
  List<StorageDevice>? _devices;
  String? _error;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _scanDevices();
  }

  Future<void> _scanDevices() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Simulate a small delay for the "scanning" effect
      await Future.delayed(const Duration(milliseconds: 800));
      final devices = await _scanner.scanDevices();
      setState(() {
        _devices = devices;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to scan devices: $e';
        _isLoading = false;
      });
    }
  }

  void _selectDevice(StorageDevice device) {
    if (!device.isSafeToWipe) {
      _showWarningDialog(device);
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WipeOptionsScreen(device: device),
      ),
    );
  }

  void _showWarningDialog(StorageDevice device) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppColors.glassBorder)),
        title: Text('⚠️ Security Warning',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.error)),
        content: Text(
          device.isSystemDevice
              ? 'CRITICAL: This is your SYSTEM DRIVE. Wiping it will destroy your OS.'
              : 'Device is currently MOUNTED. Unmount partitions before wiping.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('ACKNOWLEDGE', style: TextStyle(color: AppColors.textSecondary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: Text('ZeroTrace', style: Theme.of(context).textTheme.displayMedium),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.cyan),
            onPressed: _isLoading ? null : _scanDevices,
            tooltip: 'Refresh scan',
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.cyan),
            const SizedBox(height: 16),
            Text('SCANNING SECTORS...',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(letterSpacing: 2)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: GlassCard(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('SCAN FAILED', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.error)),
              const SizedBox(height: 8),
              Text(_error!, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: _scanDevices,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.cyan),
                  foregroundColor: AppColors.cyan,
                ),
                child: const Text('RETRY OPERATION'),
              ),
            ],
          ),
        ),
      );
    }

    if (_devices == null || _devices!.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.usb_off, size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text('NO DRIVES DETECTED',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.textSecondary)),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Text(
            'SELECT TARGET DRIVE',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: AppColors.cyan,
                  letterSpacing: 1.5,
                ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _devices!.length,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemBuilder: (context, index) {
              final device = _devices![index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildDeviceCard(device, index),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDeviceCard(StorageDevice device, int index) {
    final isSafe = device.isSafeToWipe;
    
    return GlassCard(
      onTap: () => _selectDevice(device),
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSafe 
                  ? AppColors.cyan.withOpacity(0.1) 
                  : AppColors.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSafe ? AppColors.cyan.withOpacity(0.3) : AppColors.error.withOpacity(0.3),
              ),
            ),
            child: Icon(
              device.isSystemDevice ? Icons.desktop_windows : Icons.storage,
              size: 32,
              color: isSafe ? AppColors.cyan : AppColors.error,
            ),
          ),
          const SizedBox(width: 20),
          
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  device.name.toUpperCase(),
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.violet.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        device.deviceId,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.violet),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      device.sizeFormatted,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textPrimary, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                  ],
                ),
                if (!isSafe) ...[
                  const SizedBox(height: 8),
                  Text(
                    device.isSystemDevice ? '⚠️ SYSTEM DRIVE' : '⚠️ MOUNTED (UNSAFE)',
                    style: TextStyle(
                      color: AppColors.error,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ],
            ),
          ),
          
          // Arrow
          Icon(
            Icons.chevron_right, 
            color: isSafe ? AppColors.cyan : AppColors.textSecondary.withOpacity(0.5)
          ),
        ],
      ),
    );
  }
}
