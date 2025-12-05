import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/wipe_result.dart';
import '../models/storage_device.dart';

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
        margin: const pw.EdgeInsets.all(40),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.all(20),
                decoration: pw.BoxDecoration(
                  color: PdfColors.blue900,
                  borderRadius: pw.BorderRadius.circular(8),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    pw.Text(
                      'ZeroTrace',
                      style: pw.TextStyle(
                        fontSize: 32,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.white,
                      ),
                    ),
                    pw.SizedBox(height: 8),
                    pw.Text(
                      'Purge-level Wipe Certificate',
                      style: const pw.TextStyle(
                        fontSize: 18,
                        color: PdfColors.white,
                      ),
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 30),

              // Certificate ID
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.all(16),
                decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColors.grey400),
                  borderRadius: pw.BorderRadius.circular(4),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'Certificate ID',
                      style: pw.TextStyle(
                        fontSize: 12,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.grey600,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      certificateWipeId,
                      style: pw.TextStyle(
                        fontSize: 16,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),

              // Device Information
              pw.Text(
                'Device Information',
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 12),
              _buildPdfTable([
                ['Device Model', device.name],
                ['Device ID', device.deviceId],
                ['Serial Number', device.metadata['SerialNumber'] ?? device.metadata['serialNumber'] ?? 'N/A'],
                ['Storage Size', device.sizeFormatted],
              ]),
              pw.SizedBox(height: 20),

              // Wipe Details
              pw.Text(
                'Wipe Details',
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 12),
              _buildPdfTable([
                ['Method', method.toUpperCase()],
                ['Timestamp', timestamp.toIso8601String()],
                ['Duration', wipeResult.durationSeconds != null
                    ? '${wipeResult.durationSeconds!.toStringAsFixed(2)} seconds'
                    : 'N/A'],
                ['Exit Code', wipeResult.exitCode.toString()],
                ['Status', wipeResult.success ? 'SUCCESS' : 'FAILED'],
              ]),
              pw.SizedBox(height: 20),

              // Verification
              pw.Text(
                'Verification',
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 12),
              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColors.grey200,
                  borderRadius: pw.BorderRadius.circular(4),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      'Log Hash (SHA256)',
                      style: pw.TextStyle(
                        fontSize: 10,
                        fontWeight: pw.FontWeight.bold,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      wipeResult.logHash,
                      style: const pw.TextStyle(
                        fontSize: 9,
                      ),
                    ),
                  ],
                ),
              ),

              pw.Spacer(),

              // Footer
              pw.Divider(),
              pw.SizedBox(height: 8),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text(
                    'Generated: ${timestamp.toLocal().toString().split('.')[0]}',
                    style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
                  ),
                  pw.Text(
                    'ZeroTrace Certification System',
                    style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600),
                  ),
                ],
              ),
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

  /// Helper to build PDF table
  pw.Widget _buildPdfTable(List<List<String>> rows) {
    return pw.Table(
      border: pw.TableBorder.all(color: PdfColors.grey300),
      columnWidths: {
        0: const pw.FlexColumnWidth(1),
        1: const pw.FlexColumnWidth(2),
      },
      children: rows.map((row) {
        return pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(8),
              child: pw.Text(
                row[0],
                style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(8),
              child: pw.Text(
                row[1],
                style: const pw.TextStyle(fontSize: 11),
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  /// Upload certificate and logs to backend
  Future<CertificateUploadResult> uploadToBackend({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
  }) async {
    try {
      // Create certificate payload
      final payload = createCertificatePayload(
        wipeResult: wipeResult,
        device: device,
        method: method,
        userId: userId,
      );

      // Make API request
      final response = await http.post(
        Uri.parse('$backendUrl/certificates'),
        headers: {
          'Content-Type': 'application/json',
          if (authToken != null) 'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode(payload),
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
      } else {
        final error = response.statusCode == 400 || response.statusCode == 401
            ? jsonDecode(response.body)['error']
            : 'Server error: ${response.statusCode}';
        
        return CertificateUploadResult(
          success: false,
          errorMessage: error,
        );
      }
    } catch (e) {
      return CertificateUploadResult(
        success: false,
        errorMessage: 'Network error: $e',
      );
    }
  }

  /// Generate PDF and upload to backend in one operation
  Future<CertificateGenerationResult> generateAndUpload({
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
  }) async {
    try {
      // Generate PDF first
      final pdfFile = await generatePdfCertificate(
        wipeResult: wipeResult,
        device: device,
        method: method,
      );

      // Upload to backend
      final uploadResult = await uploadToBackend(
        wipeResult: wipeResult,
        device: device,
        method: method,
        userId: userId,
      );

      return CertificateGenerationResult(
        success: uploadResult.success,
        pdfFile: pdfFile,
        wipeId: uploadResult.wipeId,
        verificationUrl: uploadResult.verificationUrl,
        signature: uploadResult.signature,
        errorMessage: uploadResult.errorMessage,
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
