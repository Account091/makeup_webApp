import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/foundation.dart';

import 'firebase_options.dart';

/// Outcome of starting Firebase.
class FirebaseBootstrapResult {
  final bool ok;
  final List<String> missingKeys;
  final String? error;

  const FirebaseBootstrapResult._(this.ok, this.missingKeys, this.error);

  const FirebaseBootstrapResult.success() : this._(true, const [], null);
  const FirebaseBootstrapResult.notConfigured(List<String> missing)
    : this._(false, missing, null);
  const FirebaseBootstrapResult.failed(String error)
    : this._(false, const [], error);
}

/// Initialises Firebase from dart-defines and, when `USE_FIREBASE_EMULATOR`
/// is true, points Auth/Firestore/Storage at the local emulators.
Future<FirebaseBootstrapResult> bootstrapFirebase() async {
  if (!DefaultFirebaseOptions.isConfigured) {
    return FirebaseBootstrapResult.notConfigured(
      DefaultFirebaseOptions.missingKeys,
    );
  }
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    if (DefaultFirebaseOptions.useEmulator) {
      final host = DefaultFirebaseOptions.emulatorHost;
      await FirebaseAuth.instance.useAuthEmulator(host, 9099);
      FirebaseFirestore.instance.useFirestoreEmulator(host, 8080);
      await FirebaseStorage.instance.useStorageEmulator(host, 9199);
      debugPrint('[Firebase] Using local emulators on $host');
    }
    return const FirebaseBootstrapResult.success();
  } catch (e) {
    return FirebaseBootstrapResult.failed(e.toString());
  }
}
