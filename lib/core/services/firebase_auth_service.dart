import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

/// Comprehensive Auth service handling Email/Password, Google Sign-In,
/// and Passwordless Email Link authentication for Firebase project: tiktok1-d7d25.
class FirebaseAuthService {
  final FirebaseAuth _auth;

  FirebaseAuthService({FirebaseAuth? auth})
      : _auth = auth ?? FirebaseAuth.instance;

  /// Stream of current user authentication state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Current authenticated Firebase User
  User? get currentUser => _auth.currentUser;

  /// 1. Email & Password Sign In
  Future<UserCredential?> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      debugPrint('[FirebaseAuth] Sign in successful for ${credential.user?.email}');
      return credential;
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Sign in error (${e.code}): ${e.message}');
      rethrow;
    }
  }

  /// 2. Email & Password Registration
  Future<UserCredential?> registerWithEmailAndPassword({
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      if (displayName != null && displayName.isNotEmpty) {
        await credential.user?.updateDisplayName(displayName);
      }
      debugPrint('[FirebaseAuth] Account created for ${credential.user?.email}');
      return credential;
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Register error (${e.code}): ${e.message}');
      rethrow;
    }
  }

  /// 3. Passwordless Email Link Authentication (Send Link)
  Future<void> sendPasswordlessEmailLink({
    required String email,
    required String actionCodeUrl,
  }) async {
    try {
      final actionCodeSettings = ActionCodeSettings(
        url: actionCodeUrl,
        handleCodeInApp: true,
        androidPackageName: 'com.makeoversbyprachi.app',
        androidInstallApp: true,
        androidMinimumVersion: '12',
        iOSBundleId: 'com.makeoversbyprachi.app',
      );

      await _auth.sendSignInLinkToEmail(
        email: email.trim(),
        actionCodeSettings: actionCodeSettings,
      );
      debugPrint('[FirebaseAuth] Passwordless sign-in link sent to $email');
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Email link error (${e.code}): ${e.message}');
      rethrow;
    }
  }

  /// 4. Passwordless Email Link Authentication (Complete Sign In)
  Future<UserCredential?> signInWithEmailLink({
    required String email,
    required String emailLink,
  }) async {
    try {
      if (_auth.isSignInWithEmailLink(emailLink)) {
        final credential = await _auth.signInWithEmailLink(
          email: email.trim(),
          emailLink: emailLink,
        );
        debugPrint('[FirebaseAuth] Email link sign in completed for ${credential.user?.email}');
        return credential;
      } else {
        throw FirebaseAuthException(
          code: 'invalid-email-link',
          message: 'The provided link is not a valid sign-in link.',
        );
      }
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Email link completion error (${e.code}): ${e.message}');
      rethrow;
    }
  }

  /// 5. Google Sign In (Platform specific / Web support)
  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleAuthProvider googleProvider = GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');

      if (kIsWeb) {
        final credential = await _auth.signInWithPopup(googleProvider);
        debugPrint('[FirebaseAuth] Web Google Sign In success: ${credential.user?.email}');
        return credential;
      } else {
        final credential = await _auth.signInWithProvider(googleProvider);
        debugPrint('[FirebaseAuth] Native Google Sign In success: ${credential.user?.email}');
        return credential;
      }
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Google Sign In error (${e.code}): ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('[FirebaseAuth] Google Sign In generic error: $e');
      rethrow;
    }
  }

  /// 6. Send Password Reset Email
  Future<void> sendPasswordResetEmail({required String email}) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
      debugPrint('[FirebaseAuth] Password reset email sent to $email');
    } on FirebaseAuthException catch (e) {
      debugPrint('[FirebaseAuth] Password reset error (${e.code}): ${e.message}');
      rethrow;
    }
  }

  /// 7. Sign Out
  Future<void> signOut() async {
    await _auth.signOut();
    debugPrint('[FirebaseAuth] User signed out');
  }
}
