import 'package:flutter/material.dart';
import '../models/storage_device.dart';
import '../services/device_scanner.dart';
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
        title: const Text('⚠️ Warning'),
        content: Text(
          device.isSystemDevice
              ? 'This is your system device. Wiping it will make your system unbootable.'
              : 'This device is currently mounted. Please unmount all partitions before wiping.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Drive to Wipe'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _scanDevices,
            tooltip: 'Refresh devices',
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Scanning devices...'),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _scanDevices,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_devices == null || _devices!.isEmpty) {
      return const Center(
        child: Text('No storage devices found'),
      );
    }

    return ListView.builder(
      itemCount: _devices!.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final device = _devices![index];
        return _buildDeviceCard(device);
      },
    );
  }

  Widget _buildDeviceCard(StorageDevice device) {
    final isSafe = device.isSafeToWipe;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(
          device.isSystemDevice ? Icons.computer : Icons.storage,
          size: 40,
          color: isSafe ? Colors.blue : Colors.orange,
        ),
        title: Text(
          device.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${device.deviceId}'),
            Text('Size: ${device.sizeFormatted}'),
            if (!isSafe)
              Text(
                device.isSystemDevice ? '⚠️ SYSTEM DEVICE' : '⚠️ MOUNTED',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              ),
          ],
        ),
        trailing: Icon(
          isSafe ? Icons.chevron_right : Icons.warning,
          color: isSafe ? null : Colors.orange,
        ),
        onTap: () => _selectDevice(device),
        enabled: true, // Allow tap even if unsafe to show warning
      ),
    );
  }
}
