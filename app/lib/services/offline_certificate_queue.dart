import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/wipe_result.dart';
import '../models/storage_device.dart';

/// Service for managing offline certificate uploads
/// Stores failed uploads and retries them when internet connection is restored
class OfflineCertificateQueue {
  static final OfflineCertificateQueue _instance = OfflineCertificateQueue._internal();
  factory OfflineCertificateQueue() => _instance;
  OfflineCertificateQueue._internal();

  final List<PendingCertificate> _queue = [];
  bool _isProcessing = false;
  final Connectivity _connectivity = Connectivity();

  /// Initialize the queue and load pending certificates
  Future<void> initialize() async {
    await _loadQueue();
    _startConnectivityMonitoring();
  }

  /// Add a certificate to the offline queue
  Future<void> addToQueue(PendingCertificate certificate) async {
    _queue.add(certificate);
    await _saveQueue();
  }

  /// Get count of pending uploads
  int get pendingCount => _queue.length;

  /// Get all pending certificates
  List<PendingCertificate> get pending => List.unmodifiable(_queue);

  /// Process the queue and upload pending certificates
  Future<int> processQueue({required String backendUrl, String? authToken}) async {
    if (_isProcessing) return 0;
    
    _isProcessing = true;
    int uploadedCount = 0;

    try {
      final itemsToProcess = List<PendingCertificate>.from(_queue);
      
      for (var certificate in itemsToProcess) {
        try {
          final success = await _uploadCertificate(
            certificate,
            backendUrl: backendUrl,
            authToken: authToken,
          );

          if (success) {
            _queue.remove(certificate);
            uploadedCount++;
          }
        } catch (e) {
          print('Failed to upload certificate ${certificate.wipeId}: $e');
          // Keep in queue for next attempt
        }
      }

      if (uploadedCount > 0) {
        await _saveQueue();
      }
    } finally {
      _isProcessing = false;
    }

    return uploadedCount;
  }

  /// Upload a single certificate
  Future<bool> _uploadCertificate(
    PendingCertificate certificate, {
    required String backendUrl,
    String? authToken,
  }) async {
    final url = Uri.parse('$backendUrl/api/certificates');
    
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    
    if (authToken != null) {
      headers['Authorization'] = 'Bearer $authToken';
    }

    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(certificate.payload),
    ).timeout(
      const Duration(seconds: 30),
      onTimeout: () => throw Exception('Upload timeout'),
    );

    return response.statusCode == 201 || response.statusCode == 200;
  }

  /// Save queue to local storage
  Future<void> _saveQueue() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/pending_certificates.json');
      
      final queueData = {
        'certificates': _queue.map((c) => c.toJson()).toList(),
      };
      
      await file.writeAsString(jsonEncode(queueData));
    } catch (e) {
      print('Error saving certificate queue: $e');
    }
  }

  /// Load queue from local storage
  Future<void> _loadQueue() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/pending_certificates.json');
      
      if (await file.exists()) {
        final contents = await file.readAsString();
        final data = jsonDecode(contents) as Map<String, dynamic>;
        
        final certificates = (data['certificates'] as List<dynamic>)
            .map((json) => PendingCertificate.fromJson(json as Map<String, dynamic>))
            .toList();
        
        _queue.clear();
        _queue.addAll(certificates);
      }
    } catch (e) {
      print('Error loading certificate queue: $e');
    }
  }

  /// Start monitoring connectivity changes
  void _startConnectivityMonitoring() {
    _connectivity.onConnectivityChanged.listen((result) async {
      if (result != ConnectivityResult.none && _queue.isNotEmpty) {
        print('Internet connection restored. Processing ${_queue.length} pending certificates...');
        // Note: You'll need to provide backendUrl and authToken from app context
        // This is a placeholder - you should trigger this from your app state
      }
    });
  }

  /// Clear all pending certificates (for testing or manual reset)
  Future<void> clearQueue() async {
    _queue.clear();
    await _saveQueue();
  }
}

/// Represents a certificate pending upload
class PendingCertificate {
  final String wipeId;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  final int retryCount;

  PendingCertificate({
    required this.wipeId,
    required this.payload,
    required this.timestamp,
    this.retryCount = 0,
  });

  /// Create from wipe data
  factory PendingCertificate.fromWipe({
    required String wipeId,
    required WipeResult wipeResult,
    required StorageDevice device,
    required String method,
    required String userId,
  }) {
    return PendingCertificate(
      wipeId: wipeId,
      timestamp: DateTime.now(),
      payload: {
        'wipeId': wipeId,
        'userId': userId,
        'deviceModel': device.name,
        'serialNumber': device.serialNumber,
        'method': method,
        'timestamp': DateTime.now().toIso8601String(),
        'rawLog': wipeResult.logContent,
        'devicePath': device.deviceId,
        'duration': wipeResult.durationSeconds.toDouble(),
        'exitCode': wipeResult.exitCode,
      },
    );
  }

  /// Convert to JSON for storage
  Map<String, dynamic> toJson() {
    return {
      'wipeId': wipeId,
      'payload': payload,
      'timestamp': timestamp.toIso8601String(),
      'retryCount': retryCount,
    };
  }

  /// Create from JSON
  factory PendingCertificate.fromJson(Map<String, dynamic> json) {
    return PendingCertificate(
      wipeId: json['wipeId'] as String,
      payload: json['payload'] as Map<String, dynamic>,
      timestamp: DateTime.parse(json['timestamp'] as String),
      retryCount: json['retryCount'] as int? ?? 0,
    );
  }

  /// Create a copy with incremented retry count
  PendingCertificate withIncrementedRetry() {
    return PendingCertificate(
      wipeId: wipeId,
      payload: payload,
      timestamp: timestamp,
      retryCount: retryCount + 1,
    );
  }
}
