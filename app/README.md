# Flutter App (TODO)

This directory will contain the Flutter mobile application for ZeroTrace.

## Planned Features

- [ ] Device wipe initiation from mobile
- [ ] Real-time wipe progress monitoring
- [ ] Certificate generation and storage
- [ ] QR code scanning for quick verification
- [ ] Offline certificate viewing
- [ ] Push notifications for wipe completion

## Setup Instructions

```bash
# Initialize Flutter project
flutter create app
cd app

# Add dependencies to pubspec.yaml
# - http or dio for API calls
# - qr_flutter for QR code generation
# - qr_code_scanner for scanning
# - provider or riverpod for state management
# - secure_storage for local certificate caching

# Run app
flutter run
```

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
