import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../core/auth/staff_claims.dart';
import '../../data/admin/admin_repositories.dart';
import '../common/widgets/admin_widgets.dart';
import 'admin_shell.dart';
import 'login_screen.dart';

/// Signed out -> [LoginScreen]. Signed in -> refresh ID token and require
/// staff claims before building the shell (and opening any stream).
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snap) {
        if (snap.hasError) {
          return Scaffold(body: ErrorView(error: snap.error!));
        }
        if (snap.connectionState == ConnectionState.waiting) {
          return const BrandSplash();
        }
        final user = snap.data;
        if (user == null) return const LoginScreen();
        return _ClaimsGate(key: ValueKey(user.uid), user: user);
      },
    );
  }
}

class _ClaimsGate extends StatefulWidget {
  final User user;
  const _ClaimsGate({super.key, required this.user});

  @override
  State<_ClaimsGate> createState() => _ClaimsGateState();
}

class _ClaimsGateState extends State<_ClaimsGate> {
  late Future<IdTokenResult> _token;

  @override
  void initState() {
    super.initState();
    _token = widget.user.getIdTokenResult(true);
  }

  Future<void> _signOut() => FirebaseAuth.instance.signOut();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<IdTokenResult>(
      future: _token,
      builder: (context, snap) {
        if (snap.hasError) {
          return Scaffold(
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ErrorView(
                  error: snap.error!,
                  onRetry: () => setState(() {
                    _token = widget.user.getIdTokenResult(true);
                  }),
                ),
                TextButton(onPressed: _signOut, child: const Text('Sign out')),
              ],
            ),
          );
        }
        if (!snap.hasData) {
          return const BrandSplash(message: 'Opening your studio…');
        }

        final access = evaluateStaffClaims(snap.data!.claims);
        if (!access.granted) {
          return _NoAccess(
            email: widget.user.email ?? widget.user.uid,
            reason: access.reason ?? '',
            onSignOut: _signOut,
          );
        }
        final session = AdminSession(
          uid: widget.user.uid,
          email: widget.user.email ?? '',
          role: access.role!,
          displayName: widget.user.displayName,
        );
        return MultiRepositoryProvider(
          providers: [
            RepositoryProvider.value(value: session),
            RepositoryProvider(
              create: (_) => AdminRepositories(FirebaseFirestore.instance),
            ),
          ],
          child: const AdminShell(),
        );
      },
    );
  }
}

class _NoAccess extends StatelessWidget {
  final String email;
  final String reason;
  final VoidCallback onSignOut;
  const _NoAccess({
    required this.email,
    required this.reason,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.lock_outline,
                  size: 40,
                  color: theme.colorScheme.error,
                ),
                const SizedBox(height: 12),
                Text(
                  "This account doesn't have staff access",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Signed in as $email ($reason). Ask the studio owner to grant access, then sign in again.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: onSignOut,
                  child: const Text('Sign out'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
