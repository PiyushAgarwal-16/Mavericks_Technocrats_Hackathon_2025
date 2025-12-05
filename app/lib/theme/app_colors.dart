import 'package:flutter/material.dart';

class AppColors {
  // Main Background
  static const Color background = Color(0xFF030014); // Deep Dark Blue/Black

  // Primary Gradient Colors
  static const Color violet = Color(0xFF7B2CBF);
  static const Color cyan = Color(0xFF00D1FF); // Neon Cyan
  static const Color pink = Color(0xFFFF0080); // Accent Pink

  // Glassmorphism
  static final Color glassSurface = const Color(0xFF171932).withOpacity(0.6);
  static final Color glassBorder = Colors.white.withOpacity(0.08);

  // Text
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF94A3B8); // Muted Blue-Grey

  // Functional
  static const Color error = Color(0xFFFF4D4D);
  static const Color success = Color(0xFF00E676);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [violet, cyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient cardBorderGradient = LinearGradient(
    colors: [Color(0xFF7B2CBF), Color(0x007B2CBF), Color(0xFF00D1FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
