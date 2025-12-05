import 'dart:io';
import 'package:http/http.dart' as http;

/// Simple utility to test network connectivity
class NetworkTest {
  /// Test if device has internet access
  static Future<bool> hasInternetAccess() async {
    try {
      // Try to reach a reliable endpoint
      final result = await http.get(
        Uri.parse('https://www.google.com'),
      ).timeout(const Duration(seconds: 5));
      
      return result.statusCode == 200;
    } catch (e) {
      print('Internet check failed: $e');
      return false;
    }
  }

  /// Test if backend is reachable
  static Future<bool> canReachBackend(String backendUrl) async {
    try {
      final result = await http.get(
        Uri.parse('$backendUrl/health'),
      ).timeout(const Duration(seconds: 10));
      
      print('Backend response: ${result.statusCode}');
      return result.statusCode == 200;
    } catch (e) {
      print('Backend check failed: $e');
      return false;
    }
  }

  /// Comprehensive network diagnostic
  static Future<Map<String, dynamic>> runDiagnostics(String backendUrl) async {
    print('Running network diagnostics...');
    
    final hasInternet = await hasInternetAccess();
    print('Internet access: $hasInternet');
    
    final canReach = await canReachBackend(backendUrl);
    print('Backend reachable: $canReach');
    
    // Check DNS resolution
    String? backendIp;
    try {
      final uri = Uri.parse(backendUrl);
      final addresses = await InternetAddress.lookup(uri.host);
      backendIp = addresses.isNotEmpty ? addresses.first.address : null;
      print('Backend IP: $backendIp');
    } catch (e) {
      print('DNS lookup failed: $e');
    }
    
    return {
      'hasInternet': hasInternet,
      'backendReachable': canReach,
      'backendIp': backendIp,
    };
  }
}
