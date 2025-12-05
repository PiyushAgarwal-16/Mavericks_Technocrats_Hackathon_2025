import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/wipe_result.dart';
import '../models/storage_device.dart';
import 'offline_certificate_queue.dart';

/// Service for generating and uploading wipe certificates
class CertificateGenerator {
  /// Backend API base URL
  final String backendUrl;

  /// JWT authentication token
  final String? authToken;

  CertificateGenerator({
    required this.backendUrl,
    this.authToken,
  });

  /// Generate a unique wipe ID
  String _generateWipeId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = DateTime.now().microsecondsSinceEpoch.toRadixString(16).toUpperCase();
    return 'ZT-$timestamp-$random';
  }

  /// Create certificate JSON payload
  Map<String, dynamic> createCertificatePayload({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
    String? wipeId,
  }) {
    final timestamp = DateTime.now().toUtc().toIso8601String();
    final certificateWipeId = wipeId ?? _generateWipeId();

    return {
      'wipeId': certificateWipeId,
      'deviceModel': device.name,
      'serialNumber': device.metadata['SerialNumber'] ?? device.metadata['serialNumber'],
      'method': method,
      'timestamp': timestamp,
      'logHash': wipeResult.logHash,
      'rawLog': wipeResult.logContent,
      'devicePath': device.deviceId,
      'duration': wipeResult.durationSeconds?.toInt() ?? 0,
      'exitCode': wipeResult.exitCode,
    };
  }

  /// Generate PDF certificate
  Future<File> generatePdfCertificate({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    String? wipeId,
  }) async {
    final pdf = pw.Document();
    final timestamp = DateTime.now().toUtc();
    final certificateWipeId = wipeId ?? _generateWipeId();

    // Add certificate page
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: pw.EdgeInsets.zero, // Zero margin for full-width header
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              // Header Bar (Blue)
              pw.Container(
                width: double.infinity,
                height: 80, // Approx 20mm scaled
                color: PdfColor.fromInt(0x0B5ED7), // Primary Blue from website
                alignment: pw.Alignment.center,
                child: pw.Text(
                  'ZeroTrace Certificate of Erasure',
                  style: pw.TextStyle(
                    fontSize: 24, // 22pt approx
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.white,
                  ),
                ),
              ),
              
              pw.SizedBox(height: 40),

              // Certification Statement
              pw.Text(
                'This document certifies that the data on the device listed below',
                textAlign: pw.TextAlign.center,
                style: const pw.TextStyle(fontSize: 12),
              ),
              pw.SizedBox(height: 5),
              pw.Text(
                'has been permanently erased in accordance with NIST 800-88 standards.',
                textAlign: pw.TextAlign.center,
                style: const pw.TextStyle(fontSize: 12),
              ),

              pw.SizedBox(height: 30),

              // Details Box
              pw.Container(
                width: 400, // Approx 150mm
                padding: const pw.EdgeInsets.symmetric(vertical: 20, horizontal: 30),
                decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColors.grey400),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    _buildDetailRow('Certificate ID:', certificateWipeId),
                    pw.SizedBox(height: 15),
                    _buildDetailRow('Device Model:', device.name),
                    pw.SizedBox(height: 15),
                    _buildDetailRow('IMEI / Serial:', device.metadata['SerialNumber'] ?? device.metadata['serialNumber'] ?? 'N/A'),
                    pw.SizedBox(height: 15),
                    _buildDetailRow('Erasure Date:', '${timestamp.day}/${timestamp.month}/${timestamp.year}'),
                    pw.SizedBox(height: 15),
                    _buildDetailRow('Method:', 'NIST 800-88 Purge (3-Pass)'), // Standardized display name
                  ],
                ),
              ),

              pw.Spacer(),

              // Footer
              pw.Text(
                'ZeroTrace Inc. - Secure Data Wiping Solutions',
                style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
              ),
              pw.SizedBox(height: 30),
            ],
          );
        },
      ),
    );

    // Save PDF to local storage
    final directory = await getApplicationDocumentsDirectory();
    final certificatesDir = Directory('${directory.path}/certificates');
    if (!await certificatesDir.exists()) {
      await certificatesDir.create(recursive: true);
    }

    final file = File('${certificatesDir.path}/certificate_$certificateWipeId.pdf');
    await file.writeAsBytes(await pdf.save());

    return file;
  }

  /// Helper to build detail row for certificate
  pw.Widget _buildDetailRow(String label, String value) {
    return pw.Row(
      children: [
        pw.Expanded(
          flex: 2,
          child: pw.Text(
            label,
            style: pw.TextStyle(
              fontSize: 12,
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.black,
            ),
          ),
        ),
        pw.Expanded(
          flex: 3,
          child: pw.Text(
            value,
            style: const pw.TextStyle(
              fontSize: 12,
              color: PdfColors.black,
            ),
          ),
        ),
      ],
    );
  }

  /// Upload certificate and logs to backend
  Future<CertificateUploadResult> uploadToBackend({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
    String? wipeId,
  }) async {
    const maxRetries = 3;
    
    for (int attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Create certificate payload
        final payload = createCertificatePayload(
          wipeResult: wipeResult,
          device: device,
          method: method,
          userId: userId,
          wipeId: wipeId,
        );

        // Make API request
        final response = await http.post(
          Uri.parse('$backendUrl/certificates'),
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'ZEROTRACE_AGENT_KEY_2025',
            if (authToken != null) 'Authorization': 'Bearer $authToken',
          },
          body: jsonEncode(payload),
        ).timeout(
          Duration(seconds: 15 + (attempt * 5)), // Increase timeout on retries
        );

        if (response.statusCode == 201) {
          final data = jsonDecode(response.body) as Map<String, dynamic>;
          
          return CertificateUploadResult(
            success: true,
            wipeId: data['wipeId'] as String,
            verificationUrl: data['verificationUrl'] as String?,
            signature: data['signature'] as String?,
            logHash: data['logHash'] as String?,
          );
        } else if (response.statusCode >= 500 && attempt < maxRetries - 1) {
          // Server error - retry
          await Future.delayed(Duration(seconds: 2 * (attempt + 1)));
          continue;
        } else {
          // Client error or final retry - return error
          final error = response.statusCode == 400 || response.statusCode == 401
              ? jsonDecode(response.body)['error']
              : 'Server error: ${response.statusCode}';
          
          return CertificateUploadResult(
            success: false,
            errorMessage: error,
          );
        }
      } catch (e) {
        // Network error or timeout
        if (attempt < maxRetries - 1) {
          // Wait before retrying (exponential backoff: 2s, 4s, 8s)
          await Future.delayed(Duration(seconds: 2 * (attempt + 1)));
          continue;
        }
        
        return CertificateUploadResult(
          success: false,
          errorMessage: 'Upload failed after $maxRetries attempts: $e',
        );
      }
    }
    
    // Should never reach here, but just in case
    return CertificateUploadResult(
      success: false,
      errorMessage: 'Upload failed after $maxRetries attempts',
    );
  }

  /// Generate PDF and upload to backend in one operation
  Future<CertificateGenerationResult> generateAndUpload({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
  }) async {
    try {
      // Generate a consistent ID for this wipe operation
      // We use the same ID for both the PDF and the backend record
      final wipeId = _generateWipeId();

      // Generate PDF first
      final pdfFile = await generatePdfCertificate(
        wipeResult: wipeResult,
        device: device,
        method: method,
        wipeId: wipeId,
      );

      // Upload to backend
      CertificateUploadResult uploadResult;
      try {
        uploadResult = await uploadToBackend(
          wipeResult: wipeResult,
          device: device,
          method: method,
          userId: userId,
          wipeId: wipeId,
        );
      } catch (e) {
        // Fallback for offline mode - add to queue for later upload
        uploadResult = CertificateUploadResult(
          success: false,
          errorMessage: 'Offline mode: Server unreachable ($e)',
          wipeId: wipeId, // Ensure we keep the local ID
        );
        
        // Add to offline queue for automatic retry when online
        final pendingCert = PendingCertificate.fromWipe(
          wipeId: wipeId,
          wipeResult: wipeResult,
          device: device,
          method: method,
          userId: userId,
        );
        await OfflineCertificateQueue().addToQueue(pendingCert);
      }

      // If upload failed but PDF generation worked, consider it a partial success (Offline Mode)
      // The user still gets their PDF certificate.
      final isOfflineSuccess = !uploadResult.success && pdfFile.existsSync();
      
      // Use the ID from upload result if available (server might have canonicalized it), 
      // otherwise use our local ID.
      final finalWipeId = uploadResult.wipeId ?? wipeId;
      
      final pendingCount = OfflineCertificateQueue().pendingCount;
      final offlineMessage = pendingCount > 0
          ? 'PDF Certificate saved locally. $pendingCount wipe record(s) pending upload. Will automatically sync when internet connection is restored.'
          : 'PDF Certificate saved locally. Wipe record will be uploaded when internet connection is restored.';
      
      return CertificateGenerationResult(
        success: uploadResult.success || isOfflineSuccess,
        pdfFile: pdfFile,
        wipeId: finalWipeId,
        verificationUrl: uploadResult.verificationUrl,
        signature: uploadResult.signature,
        errorMessage: uploadResult.success 
            ? null 
            : offlineMessage,
      );
    } catch (e) {
      return CertificateGenerationResult(
        success: false,
        errorMessage: 'Certificate generation failed: $e',
      );
    }
  }
}

/// Result of certificate upload to backend
class CertificateUploadResult {
  final bool success;
  final String? wipeId;
  final String? verificationUrl;
  final String? signature;
  final String? logHash;
  final String? errorMessage;

  CertificateUploadResult({
    required this.success,
    this.wipeId,
    this.verificationUrl,
    this.signature,
    this.logHash,
    this.errorMessage,
  });
}

/// Result of complete certificate generation and upload
class CertificateGenerationResult {
  final bool success;
  final File? pdfFile;
  final String? wipeId;
  final String? verificationUrl;
  final String? signature;
  final String? errorMessage;

  CertificateGenerationResult({
    required this.success,
    this.pdfFile,
    this.wipeId,
    this.verificationUrl,
    this.signature,
    this.errorMessage,
  });
}
