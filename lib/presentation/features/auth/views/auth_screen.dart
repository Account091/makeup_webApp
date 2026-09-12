import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/firebase_auth_service.dart';
import '../../../../core/services/firebase_messaging_service.dart';
import '../../payment/views/upi_qr_payment_dialog.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final FirebaseAuthService _authService = FirebaseAuthService();
  final FirebaseMessagingService _messagingService = FirebaseMessagingService();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isSignUp = false;
  bool _isLoading = false;
  String? _statusMessage;
  String? _fcmToken;

  @override
  void initState() {
    super.initState();
    _loadFcmToken();
  }

  Future<void> _loadFcmToken() async {
    final token = await _messagingService.getToken();
    if (mounted) {
      setState(() {
        _fcmToken = token ?? 'FCM Token unavailable in offline/sim mode';
      });
    }
  }

  Future<void> _handleEmailPasswordAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _statusMessage = 'Please enter both email and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      if (_isSignUp) {
        await _authService.registerWithEmailAndPassword(
          email: email,
          password: password,
        );
        setState(() => _statusMessage = 'Account created successfully!');
      } else {
        await _authService.signInWithEmailAndPassword(
          email: email,
          password: password,
        );
        setState(() => _statusMessage = 'Signed in successfully!');
      }
    } catch (e) {
      setState(() => _statusMessage = 'Auth Error: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      await _authService.signInWithGoogle();
      setState(() => _statusMessage = 'Google Sign-In successful!');
    } catch (e) {
      setState(() => _statusMessage = 'Google Auth Error: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handlePasswordlessEmailLink() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _statusMessage = 'Please enter your email for passwordless sign-in.');
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      await _authService.sendPasswordlessEmailLink(
        email: email,
        actionCodeUrl: 'https://tiktok1-d7d25.firebaseapp.com/auth-finish',
      );
      setState(() => _statusMessage = 'Passwordless sign-in link sent to $email!');
    } catch (e) {
      setState(() => _statusMessage = 'Passwordless Link Error: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: _authService.authStateChanges,
      builder: (context, snapshot) {
        final user = snapshot.data;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Firebase Authentication & FCM Console'),
            backgroundColor: AppColors.deepPlum,
            foregroundColor: Colors.white,
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 550),
                child: Container(
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Target Firebase Project: tiktok1-d7d25',
                        style: AppTextStyles.headingTitle.copyWith(
                          color: AppColors.deepPlum,
                          fontSize: 18,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        user != null
                            ? 'Logged in as: ${user.email ?? user.uid}'
                            : 'Sign in to access luxury bookings & customer portal',
                        style: AppTextStyles.bodyPrimary,
                        textAlign: TextAlign.center,
                      ),
                      const Divider(height: 32),
                      if (user != null) ...[
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.blushPink,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green, size: 48),
                              const SizedBox(height: 8),
                              Text('Active Session', style: AppTextStyles.sectionHeader),
                              Text('UID: ${user.uid}', style: AppTextStyles.bodySecondary),
                              Text('Email: ${user.email ?? 'N/A'}', style: AppTextStyles.bodyPrimary),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () async => await _authService.signOut(),
                                icon: const Icon(Icons.logout),
                                label: const Text('Sign Out'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.redAccent,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else ...[
                        TextField(
                          controller: _emailController,
                          decoration: const InputDecoration(
                            labelText: 'Email Address',
                            prefixIcon: Icon(Icons.email_outlined),
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                          obscureText: true,
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _handleEmailPasswordAuth,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.deepPlum,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.all(16),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(_isSignUp ? 'Create Account' : 'Sign In with Email/Password'),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            TextButton(
                              onPressed: () => setState(() => _isSignUp = !_isSignUp),
                              child: Text(_isSignUp
                                  ? 'Already have an account? Sign In'
                                  : 'Need an account? Register'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: _isLoading ? null : _handleGoogleSignIn,
                          icon: const Icon(Icons.g_mobiledata, size: 28),
                          label: const Text('Sign In with Google'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.all(14),
                          ),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: _isLoading ? null : _handlePasswordlessEmailLink,
                          icon: const Icon(Icons.mark_email_read_outlined),
                          label: const Text('Send Passwordless Sign-In Link'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.all(14),
                          ),
                        ),
                      ],
                      if (_statusMessage != null) ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.blushPink,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.deepPlum.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            _statusMessage!,
                            style: AppTextStyles.bodyPrimary.copyWith(color: AppColors.deepPlum),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                      const Divider(height: 36),
                      Text(
                        'FCM Device Token Status:',
                        style: AppTextStyles.sectionHeader,
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        _fcmToken ?? 'Fetching FCM token...',
                        style: AppTextStyles.bodySecondary.copyWith(fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          UpiQrPaymentDialog.show(
                            context,
                            amount: 7500,
                            bookingId: 'BK-2026-TEST',
                            serviceName: 'Signature Bridal Makeover Deposit',
                          );
                        },
                        icon: const Icon(Icons.qr_code_2),
                        label: const Text('Test UPI QR Payment (5-Min Upload Flow)'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.roseGold,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
