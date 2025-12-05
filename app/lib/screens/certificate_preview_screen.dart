import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/storage_device.dart';
import '../models/wipe_result.dart';

/// Screen to preview and submit certificate to backend
class CertificatePreviewScreen extends StatefulWidget {
  final WipeResult wipeResult;
  final StorageDevice device;
  final String method;

  const CertificatePreviewScreen({
    super.key,
    required this.wipeResult,
    required this.device,
    required this.method,
  });

  @override
  State<CertificatePreviewScreen> createState() =>
      _CertificatePreviewScreenState();
}

class _CertificatePreviewScreenState extends State<CertificatePreviewScreen> {
  bool _isUploading = false;
  bool _uploadSuccess = false;
  String? _certificateId;
  String? _verificationUrl;

  Future<void> _submitToBackend() async {
    setState(() {
      _isUploading = true;
    });

    // TODO: Implement actual API call to backend
    // This would use the ApiService to POST to /api/certificates
    // Payload would include:
    // - deviceModel: device.name
    // - serialNumber: device.metadata['SerialNumber']
    // - method: method
    // - timestamp: ISO8601 timestamp
    // - rawLog: wipeResult.logContent
    // - devicePath: device.deviceId
    // - duration: wipeResult.durationSeconds
    // - exitCode: wipeResult.exitCode

    await Future.delayed(const Duration(seconds: 2)); // Simulate API call

    setState(() {
      _isUploading = false;
      _uploadSuccess = true;
      _certificateId = 'ZT-${DateTime.now().millisecondsSinceEpoch}-ABC123';
      _verificationUrl = 'https://zerotrace.app/verify/$_certificateId';
    });
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label copied to clipboard')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wipe Certificate'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Success header
            Card(
              color: Colors.green[50],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Colors.green[700],
                      size: 48,
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Wipe Completed Successfully',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Generate a certificate to verify this wipe',
                            style: TextStyle(color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Device information
            const Text(
              'Device Information',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildInfoRow('Device', widget.device.name),
                    _buildInfoRow('ID', widget.device.deviceId),
                    _buildInfoRow('Size', widget.device.sizeFormatted),
                    _buildInfoRow('Method', widget.method.toUpperCase()),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Wipe details
            const Text(
              'Wipe Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildInfoRow(
                      'Duration',
                      widget.wipeResult.durationSeconds != null
                          ? '${widget.wipeResult.durationSeconds!.toStringAsFixed(1)} seconds'
                          : 'Unknown',
                    ),
                    _buildInfoRow(
                      'Exit Code',
                      widget.wipeResult.exitCode.toString(),
                    ),
                    _buildInfoRow(
                      'Log Hash',
                      widget.wipeResult.logHash.isNotEmpty
                          ? '${widget.wipeResult.logHash.substring(0, 16)}...'
                          : 'N/A',
                      onTap: widget.wipeResult.logHash.isNotEmpty
                          ? () => _copyToClipboard(
                                widget.wipeResult.logHash,
                                'Log hash',
                              )
                          : null,
                    ),
                    if (widget.wipeResult.logFilePath != null)
                      _buildInfoRow(
                        'Log File',
                        widget.wipeResult.logFilePath!,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Certificate section
            if (!_uploadSuccess) ...[
              const Text(
                'Generate Certificate',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.workspace_premium, size: 64),
                      const SizedBox(height: 16),
                      const Text(
                        'Create a cryptographically signed certificate to verify this wipe operation.',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isUploading ? null : _submitToBackend,
                          icon: _isUploading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.upload),
                          label: Text(
                            _isUploading
                                ? 'Generating...'
                                : 'Generate Certificate',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              // Certificate generated successfully
              const Text(
                'Certificate Generated',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Icon(
                        Icons.verified,
                        color: Colors.blue[700],
                        size: 64,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Certificate Created Successfully',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildCopyableField(
                        'Certificate ID',
                        _certificateId!,
                      ),
                      const SizedBox(height: 8),
                      _buildCopyableField(
                        'Verification URL',
                        _verificationUrl!,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            // TODO: Open verification URL in browser
                          },
                          icon: const Icon(Icons.open_in_browser),
                          label: const Text('View Certificate'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),

            // Done button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  // Return to home/drive list
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                child: const Text('Done'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {VoidCallback? onTap}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: InkWell(
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 100,
              child: Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.black54,
                ),
              ),
            ),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      value,
                      style: const TextStyle(fontFamily: 'monospace'),
                    ),
                  ),
                  if (onTap != null)
                    const Icon(Icons.copy, size: 16, color: Colors.blue),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCopyableField(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.black54,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(fontFamily: 'monospace'),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.copy, size: 20),
                onPressed: () => _copyToClipboard(value, label),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
