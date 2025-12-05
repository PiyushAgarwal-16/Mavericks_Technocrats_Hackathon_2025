import 'dart:io';
import 'package:zerotrace_app/models/storage_device.dart';
import 'package:zerotrace_app/models/wipe_result.dart';
import 'package:zerotrace_app/services/certificate_generator.dart';

/// Example usage of CertificateGenerator service
void main() async {
  // 1. Create a mock wipe result (in real app, this comes from WipeRunner)
  final wipeResult = WipeResult(
    success: true,
    logContent: '''
Wipe started at 2025-12-05 10:30:00
Device: 0
Method: zero
Status: Writing zeros to disk...
Progress: 100%
Wipe completed successfully
Exit code: 0
''',
    logHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    exitCode: 0,
    durationSeconds: 120.5,
  );

  // 2. Create a mock device (in real app, this comes from DeviceScanner)
  final device = StorageDevice(
    deviceId: '0',
    name: 'Samsung SSD 850 EVO 250GB',
    sizeBytes: 250059350016,
    isMounted: false,
    isSystemDevice: false,
    metadata: {
      'SerialNumber': 'S2R5NX0H123456',
      'Model': 'Samsung SSD 850 EVO',
    },
  );

  // 3. Initialize certificate generator
  final generator = CertificateGenerator(
    backendUrl: 'http://localhost:5000',
    authToken: 'your-jwt-token-here',
  );

  print('Generating certificate...');

  // 4. Generate PDF and upload to backend
  final result = await generator.generateAndUpload(
    wipeResult: wipeResult,
    device: device,
    method: 'zero',
    userId: 'user-123',
  );

  // 5. Handle result
  if (result.success) {
    print('✓ Certificate generated successfully!');
    print('  Wipe ID: ${result.wipeId}');
    print('  PDF saved to: ${result.pdfFile?.path}');
    print('  Verification URL: ${result.verificationUrl}');
    print('  Digital Signature: ${result.signature?.substring(0, 32)}...');
  } else {
    print('✗ Certificate generation failed');
    print('  Error: ${result.errorMessage}');
  }

  // 6. Example: Generate PDF only (without backend upload)
  print('\nGenerating PDF only...');
  final pdfFile = await generator.generatePdfCertificate(
    wipeResult: wipeResult,
    device: device,
    method: 'zero',
  );
  print('✓ PDF saved to: ${pdfFile.path}');

  // 7. Example: Create certificate payload
  print('\nCertificate payload:');
  final payload = generator.createCertificatePayload(
    wipeResult: wipeResult,
    device: device,
    method: 'zero',
    userId: 'user-123',
  );
  print('  Wipe ID: ${payload['wipeId']}');
  print('  Device: ${payload['deviceModel']}');
  print('  Method: ${payload['method']}');
  print('  Log Hash: ${payload['logHash']}');
}
