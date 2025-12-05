import 'package:flutter/material.dart';

/// A consistent scaffold for the application with the gradient background
class AppScaffold extends StatelessWidget {
  final Widget? body;
  final PreferredSizeWidget? appBar;
  final Widget? floatingActionButton;

  const AppScaffold({
    super.key,
    this.body,
    this.appBar,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true, // Allow gradient to extend behind app bar? Maybe not for standard app bars.
      appBar: appBar,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFEFF6FF), // blue-50
              Color(0xFFE0E7FF), // indigo-100
            ],
          ),
        ),
        child: body,
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}
