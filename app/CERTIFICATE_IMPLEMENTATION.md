# Certificate Generator Implementation

## Overview

Implemented complete certificate generation and management system for the ZeroTrace Flutter desktop application.

## ✅ Implementation Summary

### 1. CertificateGenerator Service (`lib/services/certificate_generator.dart`)

**Features:**
- ✅ Generate unique wipe IDs (`ZT-timestamp-hex` format)
- ✅ Create certificate JSON payload from WipeResult + Device info
- ✅ Generate professional PDF certificates using `pdf` package
- ✅ Upload certificates and logs to backend via POST /certificates
- ✅ Support for JWT authentication
- ✅ Comprehensive error handling

**Key Methods:**
```dart
createCertificatePayload()   // Build JSON for backend
generatePdfCertificate()     // Create PDF document
uploadToBackend()            // POST to API
generateAndUpload()          // Complete workflow
```

**PDF Certificate Contents:**
- Header: "ZeroTrace — Purge-level Wipe Certificate"
- Certificate ID (unique wipe ID)
- Device Information table (model, ID, serial, size)
- Wipe Details table (method, timestamp, duration, exit code, status)
- Verification section with SHA256 log hash
- Professional styling with colors and borders
- Footer with timestamp and branding

### 2. Updated CertificatePreviewScreen (`lib/screens/certificate_preview_screen.dart`)

**New Features:**
- ✅ Integration with CertificateGenerator service
- ✅ Generate PDF and upload in one action
- ✅ PDF preview using `printing` package
- ✅ Share PDF functionality
- ✅ Print PDF functionality
- ✅ Open verification URL in browser
- ✅ Copy certificate ID, URL, and signature
- ✅ Error handling with user feedback
- ✅ Loading states during generation

**UI Components:**
- Success/error status cards
- Device information display
- Wipe details display
- Certificate generation button
- PDF preview button
- Verification URL launcher
- Copyable fields for ID, URL, signature

### 3. PdfPreviewScreen (embedded in certificate_preview_screen.dart)

**Features:**
- ✅ Full PDF preview using `printing` package's PdfPreview widget
- ✅ Share PDF button
- ✅ Print PDF button
- ✅ Save confirmation
- ✅ Professional layout

### 4. Dependencies (`pubspec.yaml`)

**Added Packages:**
```yaml
pdf: ^3.10.8           # PDF document generation
printing: ^5.12.0      # PDF preview & printing
http: ^1.2.0           # HTTP API client
crypto: ^3.0.3         # SHA256 hashing
path_provider: ^2.1.2  # File system paths
url_launcher: ^6.2.4   # Open URLs in browser
```

### 5. Documentation

**Created Files:**
- ✅ Updated `app/README.md` with comprehensive documentation
- ✅ Created `lib/examples/certificate_generator_example.dart` with usage examples

**Documentation Includes:**
- Setup instructions
- Configuration guide
- Usage workflow (4 steps)
- API integration details
- Security notes
- Troubleshooting guide
- Building for production

## 🎯 Requirements Met

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Input: WipeResult, Device, Method, Timestamp, User ID | ✅ | `createCertificatePayload()` |
| Create certificate JSON | ✅ | Full payload with all fields |
| Generate PDF with header, body, footer | ✅ | Professional PDF with tables |
| PDF shows device details | ✅ | Device info table included |
| PDF shows wipe details | ✅ | Wipe details table included |
| PDF shows logHash | ✅ | Verification section with hash |
| Save PDF locally | ✅ | Saved to Documents/certificates/ |
| Upload to backend POST /certificates | ✅ | Full API integration |
| CertificatePreviewScreen with PDF preview | ✅ | Using `printing` package |

## 📊 Certificate Flow

```
1. WipeResult (from WipeRunner)
   ↓
2. CertificatePreviewScreen
   ↓
3. User clicks "Generate Certificate & PDF"
   ↓
4. CertificateGenerator.generateAndUpload()
   ├─→ generatePdfCertificate() → PDF file saved locally
   └─→ uploadToBackend() → POST to /certificates
       ↓
5. Backend returns: wipeId, verificationUrl, signature
   ↓
6. UI updates with success state
   ├─→ "View PDF" → Opens PdfPreviewScreen
   └─→ "Verify Online" → Opens verification URL in browser
```

## 🔐 Backend Integration

### Request Format

```json
POST /certificates
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "wipeId": "ZT-1733389800000-ABCD1234",
  "deviceModel": "Samsung SSD 850 EVO 250GB",
  "serialNumber": "S2R5NX0H123456",
  "method": "zero",
  "timestamp": "2025-12-05T10:30:00.000Z",
  "logHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "rawLog": "Wipe started at...\n...",
  "devicePath": "0",
  "duration": 120,
  "exitCode": 0
}
```

### Response Format

```json
{
  "wipeId": "ZT-1733389800000-ABCD1234",
  "verificationUrl": "http://localhost:5000/certificates/ZT-1733389800000-ABCD1234",
  "signature": "BASE64_ENCODED_RSA_SIGNATURE",
  "logHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## 📱 Usage Example

```dart
// Initialize generator
final generator = CertificateGenerator(
  backendUrl: 'http://localhost:5000',
  authToken: userJwtToken,
);

// Generate and upload
final result = await generator.generateAndUpload(
  wipeResult: wipeResult,
  device: device,
  method: 'zero',
  userId: userId,
);

// Handle result
if (result.success) {
  print('Certificate ID: ${result.wipeId}');
  print('PDF Path: ${result.pdfFile?.path}');
  print('Verify at: ${result.verificationUrl}');
} else {
  print('Error: ${result.errorMessage}');
}
```

## 🎨 PDF Certificate Layout

```
┌─────────────────────────────────────────┐
│        ZeroTrace (Blue Header)          │
│   Purge-level Wipe Certificate         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Certificate ID                          │
│ ZT-1733389800000-ABCD1234              │
└─────────────────────────────────────────┘

Device Information
┌─────────────┬───────────────────────────┐
│ Device Model│ Samsung SSD 850 EVO 250GB │
│ Device ID   │ 0                         │
│ Serial #    │ S2R5NX0H123456           │
│ Storage Size│ 233.0 GB                  │
└─────────────┴───────────────────────────┘

Wipe Details
┌─────────────┬───────────────────────────┐
│ Method      │ ZERO                      │
│ Timestamp   │ 2025-12-05T10:30:00.000Z  │
│ Duration    │ 120.50 seconds            │
│ Exit Code   │ 0                         │
│ Status      │ SUCCESS                   │
└─────────────┴───────────────────────────┘

Verification
┌─────────────────────────────────────────┐
│ Log Hash (SHA256)                       │
│ e3b0c44298fc1c149afbf4c8996f...        │
└─────────────────────────────────────────┘

───────────────────────────────────────────
Generated: 2025-12-05 10:30:00
ZeroTrace Certification System
```

## 🚀 Next Steps

To use this implementation:

1. **Install Flutter dependencies:**
   ```bash
   cd app
   flutter pub get
   ```

2. **Configure backend URL:**
   Update `backendUrl` in your app configuration or pass it to CertificateGenerator

3. **Implement authentication:**
   Obtain JWT token from backend login and pass to CertificateGenerator

4. **Integrate with existing screens:**
   Navigate to CertificatePreviewScreen after WipeProgressScreen completes

5. **Test end-to-end:**
   - Run wipe operation
   - Generate certificate
   - Verify PDF is created
   - Confirm backend upload succeeds
   - Test verification URL

## 🔧 Testing

```dart
// Mock test
final mockWipe = WipeResult(
  success: true,
  logContent: 'Test wipe log',
  logHash: 'abc123...',
  exitCode: 0,
  durationSeconds: 120,
);

final mockDevice = StorageDevice(
  deviceId: '0',
  name: 'Test Device',
  sizeBytes: 250000000000,
);

final result = await generator.generateAndUpload(
  wipeResult: mockWipe,
  device: mockDevice,
  method: 'zero',
  userId: 'test-user',
);

assert(result.success == true);
assert(result.pdfFile != null);
assert(await result.pdfFile!.exists());
```

## ✨ Features

- ✅ Professional PDF certificates
- ✅ Digital signatures from backend
- ✅ Offline PDF storage
- ✅ Online verification support
- ✅ Share and print functionality
- ✅ Comprehensive error handling
- ✅ Loading states and user feedback
- ✅ Copy-to-clipboard for important fields
- ✅ JWT authentication support
- ✅ Cross-platform (Windows, Linux, macOS)
