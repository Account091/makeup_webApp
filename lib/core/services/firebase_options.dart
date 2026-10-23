import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Firebase configuration read from `--dart-define` values at build time.
///
/// Required: FIREBASE_API_KEY, FIREBASE_APP_ID, FIREBASE_MESSAGING_SENDER_ID,
/// FIREBASE_PROJECT_ID. Optional: FIREBASE_STORAGE_BUCKET,
/// FIREBASE_AUTH_DOMAIN, FIREBASE_MEASUREMENT_ID, FIREBASE_ANDROID_APP_ID,
/// FIREBASE_ANDROID_API_KEY, FIREBASE_IOS_APP_ID, FIREBASE_IOS_API_KEY,
/// FIREBASE_IOS_BUNDLE_ID, FIREBASE_VAPID_KEY, USE_FIREBASE_EMULATOR.
/// See docs/ADMIN_APP.md.
class DefaultFirebaseOptions {
  DefaultFirebaseOptions._();

  static const String apiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const String appId = String.fromEnvironment('FIREBASE_APP_ID');
  static const String messagingSenderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
  );
  static const String projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const String storageBucket = String.fromEnvironment(
    'FIREBASE_STORAGE_BUCKET',
  );
  static const String authDomain = String.fromEnvironment(
    'FIREBASE_AUTH_DOMAIN',
  );
  static const String measurementId = String.fromEnvironment(
    'FIREBASE_MEASUREMENT_ID',
  );
  static const String androidAppId = String.fromEnvironment(
    'FIREBASE_ANDROID_APP_ID',
  );
  static const String androidApiKey = String.fromEnvironment(
    'FIREBASE_ANDROID_API_KEY',
  );
  static const String iosAppId = String.fromEnvironment('FIREBASE_IOS_APP_ID');
  static const String iosApiKey = String.fromEnvironment(
    'FIREBASE_IOS_API_KEY',
  );
  static const String iosBundleId = String.fromEnvironment(
    'FIREBASE_IOS_BUNDLE_ID',
  );
  static const String fcmVapidKey = String.fromEnvironment(
    'FIREBASE_VAPID_KEY',
  );
  static const bool useEmulator = bool.fromEnvironment('USE_FIREBASE_EMULATOR');

  static String _or(String value, String fallback) =>
      value.isNotEmpty ? value : fallback;

  /// Names of required dart-defines that are missing for this platform.
  static List<String> get missingKeys {
    final missing = <String>[];
    if (_platformApiKey.isEmpty) missing.add('FIREBASE_API_KEY');
    if (_platformAppId.isEmpty) missing.add('FIREBASE_APP_ID');
    if (messagingSenderId.isEmpty) missing.add('FIREBASE_MESSAGING_SENDER_ID');
    if (projectId.isEmpty) missing.add('FIREBASE_PROJECT_ID');
    return missing;
  }

  static bool get isConfigured => missingKeys.isEmpty;

  static bool get _isAndroid =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
  static bool get _isApple =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.iOS ||
          defaultTargetPlatform == TargetPlatform.macOS);

  static String get _platformApiKey {
    if (_isAndroid) return _or(androidApiKey, apiKey);
    if (_isApple) return _or(iosApiKey, apiKey);
    return apiKey;
  }

  static String get _platformAppId {
    if (_isAndroid) return _or(androidAppId, appId);
    if (_isApple) return _or(iosAppId, appId);
    return appId;
  }

  static String get _bucket =>
      _or(storageBucket, projectId.isEmpty ? '' : '$projectId.appspot.com');

  static String get _authDomain =>
      _or(authDomain, projectId.isEmpty ? '' : '$projectId.firebaseapp.com');

  /// Options for the running platform. Web, Windows, Linux reuse the web
  /// config (the FlutterFire desktop plugins accept web options).
  static FirebaseOptions get currentPlatform {
    if (_isAndroid) {
      return FirebaseOptions(
        apiKey: _platformApiKey,
        appId: _platformAppId,
        messagingSenderId: messagingSenderId,
        projectId: projectId,
        storageBucket: _bucket,
      );
    }
    if (_isApple) {
      return FirebaseOptions(
        apiKey: _platformApiKey,
        appId: _platformAppId,
        messagingSenderId: messagingSenderId,
        projectId: projectId,
        storageBucket: _bucket,
        iosBundleId: iosBundleId.isEmpty ? null : iosBundleId,
      );
    }
    return FirebaseOptions(
      apiKey: apiKey,
      appId: appId,
      messagingSenderId: messagingSenderId,
      projectId: projectId,
      authDomain: _authDomain,
      storageBucket: _bucket,
      measurementId: measurementId.isEmpty ? null : measurementId,
    );
  }

  /// Emulator host: Android emulators reach the host machine via 10.0.2.2.
  static String get emulatorHost => _isAndroid ? '10.0.2.2' : '127.0.0.1';
}
