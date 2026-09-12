import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
/// Registered Firebase Project ID: tiktok1-d7d25
/// Sender ID: 858543997223
/// FCM VAPID Key: BMK_vFCGK73UqyP5IuxgcFGjuqNZMya8xSv-gg2P3XVU7y968tSRwveSX3EqK6HB048IB4fWv1pvgfrLvfm_vWw
class DefaultFirebaseOptions {
  static const String fcmVapidKey =
      'BMK_vFCGK73UqyP5IuxgcFGjuqNZMya8xSv-gg2P3XVU7y968tSRwveSX3EqK6HB048IB4fWv1pvgfrLvfm_vWw';

  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  /// Registered Web App Configuration for Firebase Project: tiktok1-d7d25
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyTiktok1D7d25WebApiKeyPlaceholder',
    appId: '1:858543997223:web:tiktok1d7d25webapp',
    messagingSenderId: '858543997223',
    projectId: 'tiktok1-d7d25',
    authDomain: 'tiktok1-d7d25.firebaseapp.com',
    storageBucket: 'tiktok1-d7d25.appspot.com',
    measurementId: 'G-TIKTOK1D7D25',
  );

  /// Registered Android App Configuration for Firebase Project: tiktok1-d7d25
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyTiktok1D7d25AndroidApiKeyPlaceholder',
    appId: '1:858543997223:android:tiktok1d7d25androidapp',
    messagingSenderId: '858543997223',
    projectId: 'tiktok1-d7d25',
    storageBucket: 'tiktok1-d7d25.appspot.com',
  );

  /// Registered iOS App Configuration for Firebase Project: tiktok1-d7d25
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyTiktok1D7d25IosApiKeyPlaceholder',
    appId: '1:858543997223:ios:tiktok1d7d25iosapp',
    messagingSenderId: '858543997223',
    projectId: 'tiktok1-d7d25',
    storageBucket: 'tiktok1-d7d25.appspot.com',
    iosBundleId: 'com.makeoversbyprachi.app',
  );
}
