# ZeroTrace Flutter Desktop Application

Cross-platform desktop application for managing secure drive wipes with certificate generation.

## Features

✅ **Device Detection**: Automatically scan and list storage devices
✅ **Wipe Execution**: Run Windows (diskpart) and Linux (dd) wipe scripts
✅ **Live Progress**: Real-time streaming of wipe operation output
✅ **PDF Certificates**: Generate professional PDF certificates with device details
✅ **Backend Integration**: Upload certificates and logs to ZeroTrace backend
✅ **Digital Signatures**: RSA-SHA256 signed certificates for verification
✅ **Offline Support**: PDF certificates saved locally for offline viewing

## Project Structure

```
app/
├── lib/
│   ├── models/
│   │   ├── storage_device.dart    # Storage device data model
│   │   └── wipe_result.dart       # Wipe operation result model
│   ├── services/
│   │   ├── device_scanner.dart    # Platform-specific device detection
│   │   ├── wipe_runner.dart       # Execute wipe scripts with live streaming
│   │   └── certificate_generator.dart  # PDF generation & backend upload
│   └── screens/
│       ├── drive_list_screen.dart        # List available drives
│       ├── wipe_options_screen.dart      # Select wipe method
│       ├── wipe_progress_screen.dart     # Live wipe progress
│       └── certificate_preview_screen.dart  # Certificate preview & upload
├── pubspec.yaml               # Dependencies
└── README.md                  # This file
```

## Setup Instructions

### Prerequisites

- Flutter SDK 3.0+
- Dart SDK 3.0+
- Administrator/root privileges (for drive detection and wiping)

### Installation

```bash
# Navigate to app directory
cd app

# Install dependencies
flutter pub get

# Run on desktop (Windows/Linux/macOS)
flutter run -d windows  # Windows
flutter run -d linux    # Linux
flutter run -d macos    # macOS
```

### Configuration

Update backend URL and authentication in your app:

```dart
// In certificate_preview_screen.dart or via config
final backendUrl = 'http://localhost:5000';  // Change to your backend URL
final authToken = 'your-jwt-token';          // From login
final userId = 'your-user-id';               // From authentication
```

## Usage

### 1. Device Selection

Launch the app and view available storage devices:

```dart
// DriveListScreen automatically scans devices on startup
// Shows device name, size, and safety status
```

### 2. Wipe Configuration

Select a device and choose wipe method:

- **Zero Fill**: Write zeros to all sectors (fast, less secure)
- **Random**: Write random data (slower, more secure)
- **DOD**: Department of Defense 3-pass wipe (most secure)

### 3. Live Monitoring

Monitor wipe progress in real-time:

- Live stdout/stderr streaming from wipe script
- Progress updates (if supported by script)
- Estimated time remaining
- Current operation details

### 4. Certificate Generation

After successful wipe:

1. **PDF Generation**: Creates professional certificate with:
   - Device information (model, serial, size)
   - Wipe details (method, duration, exit code)
   - SHA256 log hash for verification
   - Timestamp and unique certificate ID

2. **Backend Upload**: Automatically uploads:
   - Certificate metadata (JSON)
   - Complete wipe log
   - Returns signed certificate with verification URL

3. **Local Storage**: PDF saved to:
   - Windows: `%USERPROFILE%\Documents\certificates\`
   - Linux/macOS: `~/Documents/certificates/`

## API Integration

### Certificate Upload Endpoint

```dart
POST /certificates
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "wipeId": "ZT-1234567890-ABCD",
  "deviceModel": "Samsung SSD 850",
  "serialNumber": "S2R5NX0H123456",
  "method": "zero",
  "timestamp": "2025-12-05T10:30:00.000Z",
  "logHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "rawLog": "Wipe started at...",
  "devicePath": "0",
  "duration": 120,
  "exitCode": 0
}
```

**Response:**

```json
{
  "wipeId": "ZT-1234567890-ABCD",
  "verificationUrl": "https://zerotrace.app/certificates/ZT-1234567890-ABCD",
  "signature": "BASE64_RSA_SIGNATURE",
  "logHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## Dependencies

### Core Dependencies

- **flutter**: Framework
- **pdf**: ^3.10.8 - PDF document generation
- **printing**: ^5.12.0 - PDF preview and printing
- **http**: ^1.2.0 - HTTP client for API calls
- **crypto**: ^3.0.3 - SHA256 hashing
- **path_provider**: ^2.1.2 - Local file storage paths
- **url_launcher**: ^6.2.4 - Open verification URLs

## Services

### CertificateGenerator

Main service for certificate operations:

```dart
final generator = CertificateGenerator(
  backendUrl: 'http://localhost:5000',
  authToken: jwtToken,
);

// Generate PDF and upload to backend
final result = await generator.generateAndUpload(
  wipeResult: wipeResult,
  device: device,
  method: 'zero',
  userId: userId,
);

if (result.success) {
  print('Certificate: ${result.wipeId}');
  print('PDF: ${result.pdfFile?.path}');
  print('URL: ${result.verificationUrl}');
}
```

### Key Methods

**createCertificatePayload**: Build JSON payload
**generatePdfCertificate**: Create PDF document
**uploadToBackend**: POST to backend API
**generateAndUpload**: Complete workflow (PDF + upload)

## Security Notes

⚠️ **Administrator Privileges Required**
- Windows: Run as Administrator for diskpart access
- Linux: Run with sudo for dd/device access

⚠️ **Data Destruction Warning**
- Wiping is irreversible
- App shows safety warnings before wipe
- System devices are marked as unsafe

⚠️ **Authentication**
- Backend requires JWT authentication
- Tokens should be stored securely
- Use environment variables for production

## Building for Production

```bash
# Windows
flutter build windows --release

# Linux
flutter build linux --release

# macOS
flutter build macos --release

# Build artifacts in:
# build/windows/runner/Release/
# build/linux/x64/release/bundle/
# build/macos/Build/Products/Release/
```

## Troubleshooting

### Device Not Detected

- Ensure administrator/root privileges
- Check if device is mounted (unmount before wiping)
- Verify wmic/lsblk commands work in terminal

### PDF Generation Fails

- Check write permissions to Documents folder
- Ensure path_provider has correct permissions
- Verify disk space available

### Backend Upload Fails

- Check backend URL is accessible
- Verify JWT token is valid
- Ensure CORS is configured on backend
- Check network connectivity

### Certificate Preview Not Loading

- Ensure `printing` package is properly installed
- Check PDF file exists and is readable
- Verify file permissions

## License

See main repository LICENSE file.

## Architecture

```
app/
├── lib/
│   ├── main.dart
│   ├── models/          # Data models
│   ├── services/        # API services
│   ├── providers/       # State management
│   ├── screens/         # UI screens
│   ├── widgets/         # Reusable widgets
│   └── utils/           # Utilities
├── android/
├── ios/
├── test/
└── pubspec.yaml
```

## API Integration

The app will integrate with the backend API:

```dart
// Example API service
class ZeroTraceApi {
  static const baseUrl = 'https://api.zerotrace.com';
  
  Future<Certificate> verifyCertificate(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/certificates/verify/$id'),
    );
    return Certificate.fromJson(jsonDecode(response.body));
  }
  
  Future<Certificate> createCertificate(CertificateRequest request) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/certificates'),
      headers: {'Authorization': 'Bearer $token'},
      body: jsonEncode(request.toJson()),
    );
    return Certificate.fromJson(jsonDecode(response.body));
  }
}
```

## Development Timeline

**Phase 1:** Basic UI and certificate verification (2-4 hours)  
**Phase 2:** Certificate display and details (2-3 hours)  
**Phase 3:** QR code integration (1-2 hours)  
**Phase 4:** Polish and testing (1-2 hours)

**Total estimated:** 6-11 hours for MVP

---

*This is a placeholder for future development during the hackathon.*
