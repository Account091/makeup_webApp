import 'package:animations/animations.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand colours for the admin app (match the website: deep plum, champagne,
/// antique gold). Screens should prefer `Theme.of(context)`; these constants
/// exist to build the theme, gradients and the status colour table.
class BrandColors {
  BrandColors._();

  static const Color plum = Color(0xFF4A1942); // primary
  static const Color plumInk = Color(0xFF2C1320); // headings / website plum
  static const Color plumDark = plumInk;
  static const Color plumDeep = Color(0xFF1C0A14);
  static const Color plumSoft = Color(0xFFF4EAF0);
  static const Color gold = Color(0xFFA8813A); // antique gold accent
  static const Color goldBright = Color(0xFFD4AF37);
  static const Color goldSoft = Color(0xFFF7EEDC);
  static const Color roseGold = Color(0xFFB76E79);
  static const Color ivory = Color(0xFFFBF8F3); // scaffold
  static const Color offWhite = ivory;
  static const Color champagne = Color(0xFFF4ECE1);
  static const Color champagneDeep = Color(0xFFEBDFCF);
  static const Color outline = Color(0xFFEADFD3); // hairlines
  static const Color muted = Color(0xFF7B6A70); // secondary text
  static const Color error = Color(0xFFB3261E);

  static const LinearGradient plumGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF5A2150), plum, plumDeep],
    stops: [0, 0.45, 1],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE3C77E), goldBright, gold],
  );
}

/// Status colour table, defined once. Used by `StatusChip` and the calendar.
class StatusColors {
  StatusColors._();

  static const Color depositPending = Color(0xFF3B6CB0);
  static const Color awaitingVerification = Color(0xFFC07A10);
  static const Color confirmed = Color(0xFF2E7D57);
  static const Color rejected = Color(0xFFC0392B);
  static const Color expired = Color(0xFF8A8580);
  static const Color cancelled = Color(0xFF8D5B4C);
  static const Color completed = Color(0xFF6B3FA0);
  static const Color unknown = Color(0xFF9E9E9E);

  // Calendar
  static const Color hold = awaitingVerification;
  static const Color booked = confirmed;
  static const Color blocked = Color(0xFF5F6670);
}

/// Soft, warm shadows used by cards and floating surfaces.
class AppShadows {
  AppShadows._();

  static const List<BoxShadow> soft = [
    BoxShadow(color: Color(0x0F2C1320), blurRadius: 24, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x0A2C1320), blurRadius: 2, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> lifted = [
    BoxShadow(color: Color(0x1A2C1320), blurRadius: 32, offset: Offset(0, 14)),
    BoxShadow(color: Color(0x0D2C1320), blurRadius: 4, offset: Offset(0, 2)),
  ];
}

class AppTheme {
  AppTheme._();

  static const double radius = 18;

  /// Serif display face (page titles, brand, greeting).
  static TextStyle serif({
    double size = 24,
    FontWeight weight = FontWeight.w600,
    Color color = BrandColors.plumInk,
    double? height,
    double letterSpacing = 0,
  }) => GoogleFonts.playfairDisplay(
    fontSize: size,
    fontWeight: weight,
    color: color,
    height: height,
    letterSpacing: letterSpacing,
  );

  static ThemeData get light {
    final scheme =
        ColorScheme.fromSeed(
          seedColor: BrandColors.plum,
          brightness: Brightness.light,
        ).copyWith(
          primary: BrandColors.plum,
          onPrimary: Colors.white,
          primaryContainer: BrandColors.plumSoft,
          onPrimaryContainer: BrandColors.plumInk,
          secondary: BrandColors.gold,
          onSecondary: Colors.white,
          secondaryContainer: BrandColors.goldSoft,
          onSecondaryContainer: const Color(0xFF5A4215),
          tertiary: BrandColors.roseGold,
          surface: BrandColors.ivory,
          onSurface: BrandColors.plumInk,
          onSurfaceVariant: BrandColors.muted,
          surfaceContainerLowest: Colors.white,
          surfaceContainerLow: const Color(0xFFFAF5EE),
          surfaceContainer: BrandColors.champagne,
          surfaceContainerHigh: BrandColors.champagneDeep,
          surfaceContainerHighest: const Color(0xFFE4D6C4),
          outline: const Color(0xFFC2B2A6),
          outlineVariant: BrandColors.outline,
          error: BrandColors.error,
          shadow: BrandColors.plumInk,
        );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      visualDensity: VisualDensity.standard,
    );
    final ui = GoogleFonts.manropeTextTheme(
      base.textTheme,
    ).apply(bodyColor: BrandColors.plumInk, displayColor: BrandColors.plumInk);
    final text = ui.copyWith(
      displaySmall: serif(size: 32, height: 1.15),
      headlineLarge: serif(size: 30, height: 1.2),
      headlineMedium: serif(size: 26, height: 1.2),
      headlineSmall: serif(size: 22, height: 1.25),
      titleLarge: ui.titleLarge?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
      ),
      titleMedium: ui.titleMedium?.copyWith(
        fontSize: 15.5,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.1,
      ),
      titleSmall: ui.titleSmall?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: ui.bodyLarge?.copyWith(fontSize: 15, height: 1.45),
      bodyMedium: ui.bodyMedium?.copyWith(fontSize: 14, height: 1.45),
      bodySmall: ui.bodySmall?.copyWith(
        fontSize: 12.5,
        height: 1.4,
        color: BrandColors.muted,
      ),
      labelLarge: ui.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.1,
      ),
      labelMedium: ui.labelMedium?.copyWith(
        fontSize: 12.5,
        fontWeight: FontWeight.w600,
      ),
      labelSmall: ui.labelSmall?.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.4,
      ),
    );

    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(14),
    );
    const transitions = SharedAxisPageTransitionsBuilder(
      transitionType: SharedAxisTransitionType.horizontal,
    );

    OutlineInputBorder border(Color c, [double w = 1]) => OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: BorderSide(color: c, width: w),
    );

    return base.copyWith(
      scaffoldBackgroundColor: BrandColors.ivory,
      textTheme: text,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: transitions,
          TargetPlatform.iOS: transitions,
          TargetPlatform.windows: transitions,
          TargetPlatform.macOS: transitions,
          TargetPlatform.linux: transitions,
          TargetPlatform.fuchsia: transitions,
        },
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: BrandColors.ivory,
        surfaceTintColor: Colors.transparent,
        foregroundColor: BrandColors.plumInk,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: serif(size: 22),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
          side: const BorderSide(color: BrandColors.outline),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: border(BrandColors.outline),
        enabledBorder: border(BrandColors.outline),
        focusedBorder: border(BrandColors.plum, 1.6),
        errorBorder: border(BrandColors.error),
        focusedErrorBorder: border(BrandColors.error, 1.6),
        labelStyle: text.bodyMedium?.copyWith(color: BrandColors.muted),
        floatingLabelStyle: text.bodyMedium?.copyWith(
          color: BrandColors.plum,
          fontWeight: FontWeight.w600,
        ),
        hintStyle: text.bodyMedium?.copyWith(color: const Color(0xFFA89A9E)),
        helperStyle: text.bodySmall,
        helperMaxLines: 2,
        errorMaxLines: 2,
        prefixIconColor: BrandColors.muted,
        suffixIconColor: BrandColors.muted,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(64, 46),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: shape,
          textStyle: text.labelLarge,
          elevation: 0,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(64, 46),
          shape: shape,
          textStyle: text.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(64, 46),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          shape: shape,
          foregroundColor: BrandColors.plum,
          backgroundColor: Colors.white,
          side: const BorderSide(color: BrandColors.outline),
          textStyle: text.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: BrandColors.plum,
          textStyle: text.labelLarge,
          shape: shape,
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(foregroundColor: BrandColors.plumInk),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: BrandColors.plum,
        foregroundColor: Colors.white,
        elevation: 2,
        highlightElevation: 4,
        extendedTextStyle: text.labelLarge,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: Colors.white,
        selectedColor: BrandColors.plum,
        secondarySelectedColor: BrandColors.plum,
        checkmarkColor: Colors.white,
        showCheckmark: false,
        side: const BorderSide(color: BrandColors.outline),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
        labelStyle: text.labelMedium?.copyWith(color: BrandColors.plumInk),
        secondaryLabelStyle: text.labelMedium?.copyWith(color: Colors.white),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        titleTextStyle: serif(size: 22),
        contentTextStyle: text.bodyMedium?.copyWith(color: BrandColors.muted),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: BrandColors.ivory,
        surfaceTintColor: Colors.transparent,
        modalBackgroundColor: BrandColors.ivory,
        showDragHandle: true,
        dragHandleColor: Color(0xFFD8CABC),
        dragHandleSize: Size(40, 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        clipBehavior: Clip.antiAlias,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: BrandColors.plumInk,
        contentTextStyle: text.bodyMedium?.copyWith(color: Colors.white),
        actionTextColor: BrandColors.goldBright,
        elevation: 6,
        insetPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        shape: shape,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: BrandColors.plumSoft,
        elevation: 0,
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (s) => text.labelSmall?.copyWith(
            letterSpacing: 0.1,
            fontWeight: s.contains(WidgetState.selected)
                ? FontWeight.w800
                : FontWeight.w600,
            color: s.contains(WidgetState.selected)
                ? BrandColors.plum
                : BrandColors.muted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (s) => IconThemeData(
            size: 24,
            color: s.contains(WidgetState.selected)
                ? BrandColors.plum
                : BrandColors.muted,
          ),
        ),
      ),
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: BrandColors.champagne,
        indicatorColor: BrandColors.plumSoft,
        selectedIconTheme: const IconThemeData(color: BrandColors.plum),
        unselectedIconTheme: const IconThemeData(color: BrandColors.muted),
        selectedLabelTextStyle: text.labelMedium?.copyWith(
          color: BrandColors.plum,
          fontWeight: FontWeight.w800,
        ),
        unselectedLabelTextStyle: text.labelMedium?.copyWith(
          color: BrandColors.muted,
        ),
      ),
      badgeTheme: BadgeThemeData(
        backgroundColor: BrandColors.gold,
        textColor: Colors.white,
        textStyle: text.labelSmall?.copyWith(fontSize: 10),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? Colors.white : null,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? BrandColors.plum : null,
        ),
        trackOutlineColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? BrandColors.plum : null,
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: BrandColors.plum,
        linearTrackColor: BrandColors.champagne,
        circularTrackColor: Colors.transparent,
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: BrandColors.plumInk,
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: text.labelSmall?.copyWith(color: Colors.white),
        waitDuration: const Duration(milliseconds: 400),
      ),
      dividerTheme: const DividerThemeData(
        color: BrandColors.outline,
        space: 1,
        thickness: 1,
      ),
      listTileTheme: ListTileThemeData(
        iconColor: BrandColors.plum,
        titleTextStyle: text.titleSmall,
        subtitleTextStyle: text.bodySmall,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: text.bodyMedium,
      ),
      datePickerTheme: DatePickerThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        headerBackgroundColor: BrandColors.plum,
        headerForegroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      ),
    );
  }
}
