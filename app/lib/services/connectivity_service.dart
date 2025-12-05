import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'offline_certificate_queue.dart';

/// Service for monitoring connectivity and automatically uploading pending certificates
class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult>? _subscription;
  bool _isOnline = false;
  Timer? _retryTimer;

  // Default backend URL - should be configured from app settings
  String backendUrl = 'https://maverickstechnocratshackathon2025-production.up.railway.app';
  String? authToken;

  /// Start monitoring connectivity changes
  void startMonitoring() {
    // Check initial connectivity
    _checkInitialConnectivity();

    // Listen for connectivity changes
    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      _handleConnectivityChange(result);
    });

    // Also set up periodic retry timer (every 5 minutes)
    _retryTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (_isOnline) {
        _tryUploadPending();
      }
    });
  }

  /// Stop monitoring
  void stopMonitoring() {
    _subscription?.cancel();
    _retryTimer?.cancel();
  }

  /// Check initial connectivity status
  Future<void> _checkInitialConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      _handleConnectivityChange(result);
    } catch (e) {
      print('Error checking initial connectivity: $e');
    }
  }

  /// Handle connectivity changes
  void _handleConnectivityChange(ConnectivityResult result) {
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;

    print('Connectivity changed: $result (Online: $_isOnline)');

    // If we just came online, try to upload pending certificates
    if (!wasOnline && _isOnline) {
      print('Internet connection restored. Checking for pending certificates...');
      _tryUploadPending();
    }
  }

  /// Try to upload pending certificates
  Future<void> _tryUploadPending() async {
    final queue = OfflineCertificateQueue();
    
    if (queue.pendingCount == 0) {
      return;
    }

    print('Attempting to upload ${queue.pendingCount} pending certificate(s)...');

    try {
      final uploadedCount = await queue.processQueue(
        backendUrl: backendUrl,
        authToken: authToken,
      );

      if (uploadedCount > 0) {
        print('✅ Successfully uploaded $uploadedCount certificate(s)');
        print('   Remaining in queue: ${queue.pendingCount}');
      }
    } catch (e) {
      print('Error processing certificate queue: $e');
    }
  }

  /// Manually trigger upload attempt
  Future<int> manualSync() async {
    if (!_isOnline) {
      print('Cannot sync: Device is offline');
      return 0;
    }

    return await OfflineCertificateQueue().processQueue(
      backendUrl: backendUrl,
      authToken: authToken,
    );
  }

  /// Get current connectivity status
  bool get isOnline => _isOnline;

  /// Get pending upload count
  int get pendingUploads => OfflineCertificateQueue().pendingCount;

  /// Configure backend URL and auth token
  void configure({required String url, String? token}) {
    backendUrl = url;
    authToken = token;
  }
}
