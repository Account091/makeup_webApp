import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Background message handler required for FCM push notifications
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM Background] Handling background message: ${message.messageId}');
  debugPrint('[FCM Background] Data: ${message.data}');
}

/// Firebase Cloud Messaging service for push notifications, topics, & tokens
class FirebaseMessagingService {
  final FirebaseMessaging _fcm;

  FirebaseMessagingService({FirebaseMessaging? fcm})
      : _fcm = fcm ?? FirebaseMessaging.instance;

  /// Initialize FCM permissions & setup event listeners
  Future<void> initialize() async {
    try {
      // 1. Request Push Notification permissions
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Set background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 3. Handle foreground notifications
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('[FCM Foreground] Received message: ${message.notification?.title}');
        debugPrint('[FCM Foreground] Body: ${message.notification?.body}');
        debugPrint('[FCM Foreground] Data payload: ${message.data}');
      });

      // 4. Handle notification tap when app opened from background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('[FCM App Opened] Notification tapped: ${message.data}');
      });

      // 5. Get initial FCM Token
      String? token = await getToken();
      debugPrint('[FCM Token] Initial device token: $token');

      // 6. Token refresh listener
      _fcm.onTokenRefresh.listen((newToken) {
        debugPrint('[FCM Token Refresh] New token: $newToken');
        // Store or update in Firestore customer_profiles / artist_profiles
      });
    } catch (e) {
      debugPrint('[FCM] Initialization notice/error: $e');
    }
  }

  /// Get active FCM registration token
  Future<String?> getToken() async {
    try {
      if (kIsWeb) {
        // VAPID Key can be configured for web push
        return await _fcm.getToken();
      }
      return await _fcm.getToken();
    } catch (e) {
      debugPrint('[FCM] Error fetching token: $e');
      return null;
    }
  }

  /// Subscribe to broadcast topic (e.g., 'bridal_offers', 'artist_alerts', 'booking_updates')
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _fcm.subscribeToTopic(topic);
      debugPrint('[FCM] Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('[FCM] Error subscribing to topic $topic: $e');
    }
  }

  /// Unsubscribe from broadcast topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _fcm.unsubscribeFromTopic(topic);
      debugPrint('[FCM] Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('[FCM] Error unsubscribing from topic $topic: $e');
    }
  }
}
