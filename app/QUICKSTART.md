# Quick Start Guide - Certificate Generator

## Installation

```bash
cd app
flutter pub get
```

## Basic Usage

### 1. Import Required Classes

```dart
import 'package:zerotrace_app/services/certificate_generator.dart';
import 'package:zerotrace_app/models/wipe_result.dart';
import 'package:zerotrace_app/models/storage_device.dart';
```

### 2. Initialize Generator

```dart
final generator = CertificateGenerator(
  backendUrl: 'http://localhost:5000',
  authToken: yourJwtToken, // Optional: from login
);
```

### 3. Generate Certificate

```dart
// After wipe completes, you have:
// - WipeResult wipeResult
// - StorageDevice device
// - String method (e.g., 'zero', 'random', 'dod')
// - String userId

final result = await generator.generateAndUpload(
  wipeResult: wipeResult,
  device: device,
  method: method,
  userId: userId,
);

if (result.success) {
  // Success!
  print('Certificate ID: ${result.wipeId}');
  print('PDF saved to: ${result.pdfFile?.path}');
  print('Verify at: ${result.verificationUrl}');
} else {
  // Handle error
  print('Error: ${result.errorMessage}');
}
```

## Integration with Existing App

### In WipeProgressScreen (after wipe completes)

```dart
// After wipe finishes successfully
if (wipeResult.success) {
  // Navigate to certificate screen
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => CertificatePreviewScreen(
        wipeResult: wipeResult,
        device: device,
        method: method,
        userId: currentUserId,
        backendUrl: 'http://localhost:5000',
        authToken: currentAuthToken,
      ),
    ),
  );
}
```

### User Flow

```
WipeProgressScreen (wipe completes)
        ↓
CertificatePreviewScreen (shows wipe details)
        ↓
User clicks "Generate Certificate & PDF"
        ↓
CertificateGenerator creates PDF & uploads
        ↓
Success! Show certificate ID and actions:
  - View PDF (opens PdfPreviewScreen)
  - Verify Online (opens browser)
  - Copy ID/URL
```

## Configuration

### Backend URL

Update based on environment:

```dart
// Development
final backendUrl = 'http://localhost:5000';

// Staging
final backendUrl = 'https://staging.zerotrace.app';

// Production
final backendUrl = 'https://api.zerotrace.app';
```

### Authentication

Obtain JWT token from backend:

```dart
// Login flow
final response = await http.post(
  Uri.parse('$backendUrl/auth/login'),
  body: jsonEncode({'email': email, 'password': password}),
  headers: {'Content-Type': 'application/json'},
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  final token = data['token'];
  final userId = data['user']['_id'];
  
  // Use token with CertificateGenerator
  final generator = CertificateGenerator(
    backendUrl: backendUrl,
    authToken: token,
  );
}
```

## Customization

### Custom PDF Styling

Edit `certificate_generator.dart`:

```dart
// Change header color
color: PdfColors.blue900, // Change to your brand color

// Change fonts
style: pw.TextStyle(fontSize: 32, fontWeight: pw.FontWeight.bold)

// Add logo
pw.Image(logoImage, width: 100, height: 100)
```

### Custom Certificate Fields

Add extra fields to payload:

```dart
final payload = {
  ...createCertificatePayload(...),
  'customField': 'customValue',
  'organizationName': 'Your Organization',
};
```

## Testing

### Mock Data

```dart
// Create mock wipe result
final mockWipe = WipeResult(
  success: true,
  logContent: 'Wipe log content here',
  logHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  exitCode: 0,
  durationSeconds: 120.5,
);

// Create mock device
final mockDevice = StorageDevice(
  deviceId: '0',
  name: 'Test Device 500GB',
  sizeBytes: 500000000000,
  metadata: {'SerialNumber': 'TEST123456'},
);
```

### Test Certificate Generation

```dart
void testCertificateGeneration() async {
  final generator = CertificateGenerator(
    backendUrl: 'http://localhost:5000',
  );
  
  final result = await generator.generateAndUpload(
    wipeResult: mockWipe,
    device: mockDevice,
    method: 'zero',
    userId: 'test-user',
  );
  
  assert(result.success, 'Certificate generation failed');
  assert(result.pdfFile != null, 'PDF file not created');
  assert(await result.pdfFile!.exists(), 'PDF file does not exist');
  
  print('✓ Test passed!');
}
```

## Troubleshooting

### "Permission denied" when saving PDF

```dart
// Check write permissions
final directory = await getApplicationDocumentsDirectory();
print('Documents directory: ${directory.path}');

// Ensure directory exists
final certDir = Directory('${directory.path}/certificates');
if (!await certDir.exists()) {
  await certDir.create(recursive: true);
}
```

### "Network error" when uploading

```dart
// Add timeout
final response = await http.post(
  uri,
  headers: headers,
  body: body,
).timeout(Duration(seconds: 30));
```

### PDF preview not showing

```dart
// Verify printing package is installed
flutter pub get

// Check if file exists
if (await pdfFile.exists()) {
  print('PDF size: ${await pdfFile.length()} bytes');
}
```

## Production Checklist

- [ ] Update backend URL to production
- [ ] Implement proper authentication flow
- [ ] Add error logging/monitoring
- [ ] Test with real wipe operations
- [ ] Verify PDF generation on all platforms
- [ ] Test backend upload with real API
- [ ] Add retry logic for network failures
- [ ] Implement certificate caching
- [ ] Add analytics/tracking
- [ ] Security audit for JWT handling

## Support

For issues or questions:
1. Check `app/README.md` for detailed documentation
2. Review `CERTIFICATE_IMPLEMENTATION.md` for implementation details
3. See `lib/examples/certificate_generator_example.dart` for usage examples
4. Check backend integration tests in `backend/tests/integration.test.ts`

## License

See main repository LICENSE file.
