import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:printing/printing.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/storage_device.dart';
import '../models/wipe_result.dart';
import '../services/certificate_generator.dart';
import '../services/device_scanner.dart';
import '../widgets/app_scaffold.dart';

/// Screen to preview and submit certificate to backend
class CertificatePreviewScreen extends StatefulWidget {
  final WipeResult wipeResult;
  final StorageDevice device;
  final String method;
  final String? userId;
  final String? backendUrl;
  final String? authToken;

  const CertificatePreviewScreen({
    super.key,
    required this.wipeResult,
    required this.device,
    required this.method,
    this.userId,
    this.backendUrl,
    this.authToken,
  });

  @override
  State<CertificatePreviewScreen> createState() =>
      _CertificatePreviewScreenState();
}

class _CertificatePreviewScreenState extends State<CertificatePreviewScreen> {
  bool _isGenerating = false;
  bool _generationSuccess = false;
  File? _pdfFile;
  String? _certificateId;
  String? _verificationUrl;
  String? _signature;
  String? _errorMessage;
  late CertificateGenerator _certificateGenerator;
  final _deviceScanner = DeviceScanner();

  @override
  void initState() {
    super.initState();
    _certificateGenerator = CertificateGenerator(
      backendUrl: widget.backendUrl ?? 'http://localhost:5000',
      authToken: widget.authToken,
    );
    
    // Auto-generate certificate after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _generateCertificate();
    });
  }

  Future<void> _generateCertificate() async {
    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      final result = await _certificateGenerator.generateAndUpload(
        wipeResult: widget.wipeResult,
        device: widget.device,
        method: widget.method,
        userId: widget.userId ?? 'default-user',
      );

      setState(() {
        _isGenerating = false;
        _generationSuccess = result.success;
        _pdfFile = result.pdfFile;
        _certificateId = result.wipeId;
        _verificationUrl = result.verificationUrl;
        _signature = result.signature;
        _errorMessage = result.errorMessage;
      });

      if (result.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Certificate generated and uploaded successfully!'),
            backgroundColor: Colors.green,
          ),
        );

        // Attempt to save to USB drive
        try {
          final mountPath = await _deviceScanner.getMountPath(widget.device.deviceId);
          if (mountPath != null && _pdfFile != null) {
            // Fix for mixed separators on Windows (e.g. C:/Users/.../file.pdf)
            final normalizedPath = _pdfFile!.path.replaceAll('/', Platform.pathSeparator);
            final fileName = normalizedPath.split(Platform.pathSeparator).last;
            
            final usbFile = File('$mountPath$fileName');
            await _pdfFile!.copy(usbFile.path);
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Certificate saved to USB: ${usbFile.path}'),
                  backgroundColor: Colors.blue,
                ),
              );
            }
          }
        } catch (e) {
          print('Failed to save to USB: $e');
          if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Failed to save to USB: $e'),
                  backgroundColor: Colors.orange,
                ),
              );
          }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${result.errorMessage}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isGenerating = false;
        _errorMessage = e.toString();
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to generate certificate: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _viewPdfPreview() async {
    if (_pdfFile == null || !await _pdfFile!.exists()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF file not found')),
      );
      return;
    }

    // Navigate to PDF preview screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PdfPreviewScreen(pdfFile: _pdfFile!),
      ),
    );
  }

  Future<void> _openVerificationUrl() async {
    if (_verificationUrl == null) return;
    
    final uri = Uri.parse(_verificationUrl!);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open verification URL')),
      );
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label copied to clipboard')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: const Text('Wipe Certificate'),
        backgroundColor: Colors.transparent,
        elevation: 0,
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
            if (!_generationSuccess) ...[
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
                        'Create a cryptographically signed certificate and PDF report to verify this wipe operation.',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isGenerating ? null : _generateCertificate,
                          icon: _isGenerating
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.upload),
                          label: Text(
                            _isGenerating
                                ? 'Generating...'
                                : 'Generate Certificate & PDF',
                          ),
                        ),
                      ),
                      if (_errorMessage != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          _errorMessage!,
                          style: const TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                      ],
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
                      if (_certificateId != null)
                        _buildCopyableField(
                          'Certificate ID',
                          _certificateId!,
                        ),
                      if (_verificationUrl != null) ...[
                        const SizedBox(height: 8),
                        _buildCopyableField(
                          'Verification URL',
                          _verificationUrl!,
                        ),
                      ],
                      if (_signature != null) ...[
                        const SizedBox(height: 8),
                        _buildCopyableField(
                          'Digital Signature',
                          '${_signature!.substring(0, 32)}...',
                        ),
                      ],
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _viewPdfPreview,
                              icon: const Icon(Icons.picture_as_pdf),
                              label: const Text('View PDF'),
                            ),
                          ),
                          if (_verificationUrl != null) ...[
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _openVerificationUrl,
                                icon: const Icon(Icons.open_in_browser),
                                label: const Text('Verify Online'),
                              ),
                            ),
                          ],
                        ],
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
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
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

/// Screen to preview the generated PDF certificate
class PdfPreviewScreen extends StatelessWidget {
  final File pdfFile;

  const PdfPreviewScreen({
    super.key,
    required this.pdfFile,
  });

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: const Text('Certificate PDF Preview'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () async {
              // Share PDF using the printing package
              await Printing.sharePdf(
                bytes: await pdfFile.readAsBytes(),
                filename: pdfFile.path.split('/').last,
              );
            },
            tooltip: 'Share PDF',
          ),
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () async {
              // Print PDF using the printing package
              await Printing.layoutPdf(
                onLayout: (format) => pdfFile.readAsBytes(),
              );
            },
            tooltip: 'Print PDF',
          ),
        ],
      ),
      body: PdfPreview(
        build: (format) => pdfFile.readAsBytes(),
        canChangePageFormat: false,
        canChangeOrientation: false,
        canDebug: false,
        pdfFileName: pdfFile.path.split('/').last,
        actions: [
          PdfPreviewAction(
            icon: const Icon(Icons.save),
            onPressed: (context, build, pageFormat) async {
              // Save dialog
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('PDF saved to: ${pdfFile.path}'),
                  duration: const Duration(seconds: 3),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
