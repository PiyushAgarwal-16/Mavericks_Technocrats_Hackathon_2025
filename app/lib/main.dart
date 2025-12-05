import 'package:flutter/material.dart';
import 'screens/drive_list_screen.dart';
import 'theme/zerotrace_theme.dart';

void main() {
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
