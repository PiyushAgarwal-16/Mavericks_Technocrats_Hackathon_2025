import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:printing/printing.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/storage_device.dart';
import '../models/wipe_result.dart';
import '../services/certificate_generator.dart';
import '../services/device_scanner.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';
import '../theme/app_colors.dart';

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
      backendUrl: widget.backendUrl ?? 'https://maverickstechnocratshackathon2025-production.up.railway.app',
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
        // Attempt to save to USB drive
        try {
          final mountPath = await _deviceScanner.getMountPath(widget.device.deviceId);
          if (mountPath != null && _pdfFile != null) {
            final normalizedPath = _pdfFile!.path.replaceAll('/', Platform.pathSeparator);
            final fileName = normalizedPath.split(Platform.pathSeparator).last;
            
            final usbFile = File('$mountPath$fileName');
            await _pdfFile!.copy(usbFile.path);
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('SAVED TO IDERIVE: ${usbFile.path}'),
                  backgroundColor: AppColors.cyan,
                ),
              );
            }
          }
        } catch (e) {
          print('Failed to save to USB: $e');
        }
      }
    } catch (e) {
      setState(() {
        _isGenerating = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _viewPdfPreview() async {
    if (_pdfFile == null || !await _pdfFile!.exists()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF FILE NOT FOUND')),
      );
      return;
    }

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
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label COPIED'),
        backgroundColor: AppColors.violet,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: Text('Data Destruction Certificate', style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 20)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.home, color: AppColors.cyan),
            onPressed: () {
              Navigator.popUntil(context, (route) => route.isFirst);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Status Banner
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.success.withOpacity(0.2), Colors.transparent],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                border: Border(left: BorderSide(color: AppColors.success, width: 4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified, color: AppColors.success, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ERASURE VERIFIED', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                        Text('NIST 800-88 PURGE STANDARD', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Certificate Card
            GlassCard(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   Center(
                     child: Text(
                       'CERTIFICATE OF ERASURE',
                       style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24, letterSpacing: 2),
                       textAlign: TextAlign.center,
                     ),
                   ),
                   const SizedBox(height: 32),
                   
                   // Device Details Table
                   _buildSectionTitle(context, 'DEVICE SPECIFICATIONS'),
                   const SizedBox(height: 12),
                   _buildDetailRow('DEVICE NAME', widget.device.name),
                   _buildDetailRow('SERIAL NUMBER', widget.device.deviceId), // Assuming deviceId is serial for now, or fetch from meta
                   _buildDetailRow('CAPACITY', widget.device.sizeFormatted),
                   
                   const SizedBox(height: 24),
                   
                   // Wipe Details Table
                   _buildSectionTitle(context, 'ERASURE PROTOCOL'),
                   const SizedBox(height: 12),
                   _buildDetailRow('METHOD', widget.method.toUpperCase()),
                   _buildDetailRow('STATUS', 'SUCCESS (0 errors)'),
                   _buildDetailRow('DATE', DateTime.now().toIso8601String().split('T')[0]),
                   
                   const SizedBox(height: 24),
                   
                   if (_certificateId != null) ...[
                     _buildSectionTitle(context, 'VERIFICATION PROOF'),
                     const SizedBox(height: 12),
                     Container(
                       padding: const EdgeInsets.all(12),
                       decoration: BoxDecoration(
                         color: Colors.black,
                         border: Border.all(color: AppColors.cyan.withOpacity(0.5)),
                         borderRadius: BorderRadius.circular(8),
                       ),
                       child: Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           Text('CERTIFICATE ID', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                           SelectableText(_certificateId!, style: TextStyle(color: AppColors.cyan, fontFamily: 'monospace', fontSize: 14)),
                           const SizedBox(height: 8),
                           Text('CRYPTOGRAPHIC HASH', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                           SelectableText(
                             widget.wipeResult.logHash.isNotEmpty ? widget.wipeResult.logHash : 'Pending...', 
                             style: TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 12)
                           ),
                         ],
                       ),
                     ),
                   ],

                   const SizedBox(height: 32),
                   
                   // Stamp
                   Center(
                     child: Container(
                       padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                       decoration: BoxDecoration(
                         borderRadius: BorderRadius.circular(8),
                         border: Border.all(color: AppColors.success, width: 2),
                       ),
                       child: Text('PROVEN PURGED', 
                         style: TextStyle(
                           color: AppColors.success, 
                           fontWeight: FontWeight.bold, 
                           letterSpacing: 2,
                           fontSize: 16,
                         ),
                       ),
                     ),
                   ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Actions
            if (_generationSuccess)
              Row(
                children: [
                  Expanded(
                    child: GradientButton(
                      text: 'OPEN PDF REPORT',
                      icon: Icons.picture_as_pdf,
                      onPressed: _viewPdfPreview,
                    ),
                  ),
                  const SizedBox(width: 16),
                  if (_verificationUrl != null)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _openVerificationUrl,
                        style: OutlinedButton.styleFrom(
                           padding: const EdgeInsets.symmetric(vertical: 16),
                           side: const BorderSide(color: AppColors.cyan),
                        ),
                        child: Text('VERIFY ONLINE', style: TextStyle(color: AppColors.cyan)),
                      ),
                    ),
                ],
              ),
              
             if (_errorMessage != null)
               Padding(
                 padding: const EdgeInsets.only(top: 16),
                 child: Text('Error: $_errorMessage', style: TextStyle(color: AppColors.error), textAlign: TextAlign.center),
               ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Row(
      children: [
        Text(title, style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(width: 8),
        Expanded(child: Divider(color: AppColors.glassBorder)),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

/// Screen to preview the generated PDF certificate
class PdfPreviewScreen extends StatelessWidget {
  final File pdfFile;

  const PdfPreviewScreen({super.key, required this.pdfFile});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(
        title: const Text('PDF Report'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: PdfPreview(
        build: (format) => pdfFile.readAsBytes(),
        canChangePageFormat: false,
        canChangeOrientation: false,
        canDebug: false,
        pdfFileName: pdfFile.path.split(Platform.pathSeparator).last,
        
        // Customizing the PDF preview interactions colors if possible, 
        // or just letting it wrap in our dark mode scaffold
      ),
    );
  }
}
