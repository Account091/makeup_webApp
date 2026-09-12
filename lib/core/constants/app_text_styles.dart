import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle get headingDisplay => GoogleFonts.playfairDisplay(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: AppColors.deepPlum,
        letterSpacing: 0.5,
      );

  static TextStyle get headingTitle => GoogleFonts.playfairDisplay(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.deepPlum,
      );

  static TextStyle get sectionHeader => GoogleFonts.montserrat(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.deepPlum,
        letterSpacing: 0.8,
      );

  static TextStyle get bodyPrimary => GoogleFonts.montserrat(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: AppColors.deepPlum,
      );

  static TextStyle get bodySecondary => GoogleFonts.montserrat(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.mutedGray,
      );

  static TextStyle get badgeText => GoogleFonts.montserrat(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      );
}
