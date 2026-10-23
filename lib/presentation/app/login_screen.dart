import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../common/widgets/admin_widgets.dart';

/// Email + password sign-in for staff. No sign-up: staff accounts are
/// created by the owner with custom claims.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  static String _message(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-credential':
      case 'wrong-password':
      case 'user-not-found':
      case 'invalid-email':
        return 'Incorrect email or password.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'network-request-failed':
        return 'No network connection.';
      default:
        return e.message ?? e.code;
    }
  }

  Future<void> _signIn() async {
    if (!_form.currentState!.validate()) return;
    tapHaptic();
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _email.text.trim(),
        password: _password.text,
      );
      // AuthGate reacts to authStateChanges().
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _message(e));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgotPassword() async {
    final email = _email.text.trim();
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      setState(
        () => _error = 'Enter your email above, then tap "Forgot password".',
      );
      return;
    }
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      if (mounted) {
        showSuccessSnack(
          context,
          'If $email has an account, a reset link has been sent.',
        );
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) setState(() => _error = _message(e));
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  Widget _formCard(BuildContext context, {required bool showBrand}) {
    final theme = Theme.of(context);
    return Form(
      key: _form,
      child: AutofillGroup(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (showBrand) ...[
              const Center(child: BrandMark(size: 64)),
              const SizedBox(height: 16),
              const BrandWordmark(size: 24, align: CrossAxisAlignment.center),
              const SizedBox(height: 28),
            ],
            Text('Welcome back', style: AppTheme.serif(size: 28)),
            const SizedBox(height: 4),
            Text(
              'Sign in to manage bookings, payments and your calendar.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: BrandColors.muted,
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.mail_outline_rounded),
              ),
              validator: (v) =>
                  (v == null || !v.contains('@')) ? 'Enter your email' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _password,
              obscureText: _obscure,
              autofillHints: const [AutofillHints.password],
              onFieldSubmitted: (_) => _signIn(),
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
                suffixIcon: IconButton(
                  tooltip: _obscure ? 'Show password' : 'Hide password',
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(
                    _obscure
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                ),
              ),
              validator: (v) =>
                  (v == null || v.isEmpty) ? 'Enter your password' : null,
            ),
            AnimatedSize(
              duration: motion(context, const Duration(milliseconds: 220)),
              curve: Curves.easeOutCubic,
              child: _error == null
                  ? const SizedBox(width: double.infinity)
                  : Padding(
                      padding: const EdgeInsets.only(top: 14),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.error.withValues(
                            alpha: 0.07,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.colorScheme.error.withValues(
                              alpha: 0.25,
                            ),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline_rounded,
                              size: 18,
                              color: theme.colorScheme.error,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _error!,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.error,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
            const SizedBox(height: 22),
            FilledButton(
              style: FilledButton.styleFrom(minimumSize: const Size(0, 52)),
              onPressed: _busy ? null : _signIn,
              child: AnimatedSwitcher(
                duration: motion(context, const Duration(milliseconds: 200)),
                child: _busy
                    ? const SizedBox(
                        key: ValueKey('busy'),
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.2,
                          color: Colors.white,
                        ),
                      )
                    : const Row(
                        key: ValueKey('label'),
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Sign in'),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_rounded, size: 18),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _busy ? null : _forgotPassword,
              child: const Text('Forgot password?'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 900;
    if (wide) {
      return Scaffold(
        backgroundColor: BrandColors.ivory,
        body: Row(
          children: [
            const Expanded(flex: 5, child: _BrandPanel()),
            Expanded(
              flex: 4,
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(40),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 400),
                    child: FadeSlideIn(
                      child: _formCard(context, showBrand: false),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }
    return Scaffold(
      backgroundColor: BrandColors.ivory,
      body: Stack(
        children: [
          Positioned(
            top: -120,
            left: -60,
            right: -60,
            child: Container(
              height: 300,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  colors: [
                    BrandColors.goldSoft,
                    BrandColors.ivory.withValues(alpha: 0),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: FadeSlideIn(
                    child: _formCard(context, showBrand: true),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    Widget feature(IconData icon, String text) => Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: BrandColors.goldBright),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.82),
                fontSize: 14.5,
              ),
            ),
          ),
        ],
      ),
    );

    return Container(
      decoration: const BoxDecoration(gradient: BrandColors.plumGradient),
      child: Stack(
        children: [
          Positioned(right: -120, top: -120, child: _ring(420, 0.16)),
          Positioned(right: -40, top: -40, child: _ring(260, 0.1)),
          Positioned(
            left: -80,
            bottom: -140,
            child: Container(
              width: 360,
              height: 360,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: BrandColors.goldBright.withValues(alpha: 0.06),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(56, 48, 56, 48),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    BrandMark(size: 44, onDark: true),
                    SizedBox(width: 14),
                    BrandWordmark(onDark: true, size: 18),
                  ],
                ),
                const Spacer(),
                Text(
                  'Your studio,\nbeautifully in order.',
                  style: AppTheme.serif(
                    size: 44,
                    color: Colors.white,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Verify deposits, keep your calendar and look after every bride — from one calm place.',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 16,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 32),
                feature(
                  Icons.verified_outlined,
                  'Approve UPI payments in seconds',
                ),
                feature(
                  Icons.calendar_month_outlined,
                  'Live calendar of holds and bookings',
                ),
                feature(
                  Icons.people_alt_outlined,
                  'Every client and their events',
                ),
                const Spacer(),
                Text(
                  '© Makeovers by Prachi · Jodhpur',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.4),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget _ring(double size, double alpha) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      border: Border.all(
        color: BrandColors.goldBright.withValues(alpha: alpha),
        width: 1.2,
      ),
    ),
  );
}
