import 'package:flutter/material.dart';
import 'screens/drive_list_screen.dart';
import 'theme/zerotrace_theme.dart';
import 'services/offline_certificate_queue.dart';
import 'services/connectivity_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize offline certificate queue
  await OfflineCertificateQueue().initialize();
  
  // Start connectivity monitoring and auto-upload service
  ConnectivityService().startMonitoring();
  
  runApp(const ZeroTraceApp());
}

class ZeroTraceApp extends StatelessWidget {
  const ZeroTraceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ZeroTrace',
      theme: ZeroTraceTheme.theme,
      home: const DriveListScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
