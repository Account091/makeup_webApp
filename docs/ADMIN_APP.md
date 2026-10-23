# Admin app (Flutter) — run & build

The Flutter app in `lib/` is the studio's only admin tool. It talks to Firestore
directly as a signed-in staff user (custom claims `role` in owner/admin/super_admin,
`orgId: makeovers_by_prachi`). Data shapes follow `docs/BOOKING_CONTRACT.md`.

## Firebase config (dart-defines)

Nothing is hard-coded. Required: `FIREBASE_API_KEY`, `FIREBASE_APP_ID`,
`FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_PROJECT_ID`.
Optional: `FIREBASE_STORAGE_BUCKET` (default `<project>.appspot.com`),
`FIREBASE_AUTH_DOMAIN` (default `<project>.firebaseapp.com`), `FIREBASE_MEASUREMENT_ID`,
`FIREBASE_ANDROID_APP_ID`, `FIREBASE_ANDROID_API_KEY`, `FIREBASE_IOS_APP_ID`,
`FIREBASE_IOS_API_KEY`, `FIREBASE_IOS_BUNDLE_ID`, `USE_FIREBASE_EMULATOR=true`.
Web, Windows and Linux use the web app config. If a required value is missing the
app shows a "Firebase is not configured" screen.

Easiest: put them in `firebase.env.json` (git-ignored) and pass
`--dart-define-from-file`:

```json
{
  "FIREBASE_API_KEY": "AIza...",
  "FIREBASE_APP_ID": "1:1234567890:web:abc123",
  "FIREBASE_MESSAGING_SENDER_ID": "1234567890",
  "FIREBASE_PROJECT_ID": "makeovers-by-prachi",
  "FIREBASE_STORAGE_BUCKET": "makeovers-by-prachi.appspot.com",
  "FIREBASE_AUTH_DOMAIN": "makeovers-by-prachi.firebaseapp.com",
  "FIREBASE_ANDROID_APP_ID": "1:1234567890:android:def456"
}
```

## Commands

```sh
# Run against production
flutter run -d chrome --dart-define-from-file=firebase.env.json
flutter run -d windows --dart-define-from-file=firebase.env.json
flutter run -d <android-device> --dart-define-from-file=firebase.env.json

# Run against local emulators (auth 9099, firestore 8080, storage 9199;
# Android uses 10.0.2.2 automatically)
firebase emulators:start --only auth,firestore,storage
flutter run -d chrome \
  --dart-define=FIREBASE_PROJECT_ID=demo-makeovers \
  --dart-define=FIREBASE_API_KEY=demo \
  --dart-define=FIREBASE_APP_ID=1:1:web:1 \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=1 \
  --dart-define=USE_FIREBASE_EMULATOR=true

# Release build for web hosting
flutter build web --release --dart-define-from-file=firebase.env.json

# Checks
flutter analyze
flutter test
```

## Staff accounts

There is no sign-up screen. Create the user in Firebase Auth and set custom claims
(`{ role: "owner", orgId: "makeovers_by_prachi" }`) with the Admin SDK. Users without
these claims see "This account doesn't have staff access". After changing claims,
sign out and sign in again.

## Modules

Dashboard, Bookings, Payments (verification queue), Calendar, Services, Customers,
Settings (`settings/business`), Notifications. Push notifications are not enabled.
