import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/services/firebase_bootstrap.dart';
import 'core/theme/app_theme.dart';
import 'presentation/app/auth_gate.dart';

/// Makeovers by Prachi — studio admin app.
///
/// Firebase config comes from --dart-define values (see docs/ADMIN_APP.md).
/// Push notifications are intentionally not initialised for go-live.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Fonts are bundled in assets/google_fonts; never fetch at runtime.
  GoogleFonts.config.allowRuntimeFetching = false;
  final theme = AppTheme.light; // starts loading the bundled fonts
  final result = await bootstrapFirebase();
  // Avoid a flash of fallback text on first paint (bounded wait).
  try {
    await GoogleFonts.pendingFonts().timeout(const Duration(seconds: 3));
  } catch (_) {
    // Fall back to system fonts rather than blocking startup.
  }
  runApp(AdminApp(bootstrap: result, theme: theme));
}

class AdminApp extends StatelessWidget {
  final FirebaseBootstrapResult bootstrap;
  final ThemeData? theme;
  const AdminApp({super.key, required this.bootstrap, this.theme});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Makeovers by Prachi — Admin',
      debugShowCheckedModeBanner: false,
      theme: theme ?? AppTheme.light,
      home: bootstrap.ok
          ? const AuthGate()
          : _StartupProblem(result: bootstrap),
    );
  }
}

class _StartupProblem extends StatelessWidget {
  final FirebaseBootstrapResult result;
  const _StartupProblem({required this.result});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notConfigured = result.missingKeys.isNotEmpty;
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.cloud_off, size: 40, color: theme.colorScheme.error),
                const SizedBox(height: 12),
                Text(
                  notConfigured
                      ? 'Firebase is not configured'
                      : 'Firebase failed to start',
                  style: theme.textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                if (notConfigured) ...[
                  const Text(
                    'This build is missing required --dart-define values:',
                  ),
                  const SizedBox(height: 8),
                  for (final k in result.missingKeys) SelectableText('• $k'),
                  const SizedBox(height: 12),
                  const Text(
                    'Rebuild with the Firebase web app config, e.g.\n'
                    'flutter run --dart-define-from-file=firebase.env.json\n'
                    'See docs/ADMIN_APP.md.',
                  ),
                ] else
                  SelectableText(result.error ?? 'Unknown error'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
