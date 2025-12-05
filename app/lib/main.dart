import 'package:flutter/material.dart';
import 'screens/drive_list_screen.dart';

void main() {
  runApp(const ZeroTraceApp());
}

class ZeroTraceApp extends StatelessWidget {
  const ZeroTraceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ZeroTrace',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB), // blue-600
          primary: const Color(0xFF2563EB), // blue-600
          background: const Color(0xFFEFF6FF), // blue-50
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFEFF6FF), // blue-50
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 4,
          shadowColor: Colors.black.withOpacity(0.1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB), // blue-600
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ),
      home: const DriveListScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
