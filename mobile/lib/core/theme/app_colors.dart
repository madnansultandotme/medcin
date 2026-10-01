import 'package:flutter/material.dart';

/// Medcin color palette matching the web dashboard
class AppColors {
  // Primary Colors
  static const Color clay = Color(0xFF1769AA);
  static const Color sage = Color(0xFF2F80B7);
  static const Color amber = Color(0xFF4B91C5);

  // Text Colors
  static const Color ink = Color(0xFF102A43);
  static const Color muted = Color(0xFF5C7185);

  // Background Colors
  static const Color paper = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color mist = Color(0xFFD7E7F5);

  // Status Colors
  static const Color success = sage;
  static const Color warning = amber;
  static const Color error = Color(0xFFD32F2F);
  static const Color info = clay;

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [clay, sage],
  );
}
