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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const DriveListScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
