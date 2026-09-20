import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../../data/datasources/vercel_api_service.dart';
import '../../domain/entities/booking_entity.dart';
import 'firebase_options.dart';

/// Background message handler required for FCM push notifications
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM Background] Handling background message: ${message.messageId}');
  debugPrint('[FCM Background] Data: ${message.data}');
}

/// Timing status helper model
class BookingTimingReminderInfo {
  final String timingType; // 'TODAY' | 'TOMORROW' | 'UPCOMING'
  final String title;
  final String body;
  final int daysLeft;

  const BookingTimingReminderInfo({
    required this.timingType,
    required this.title,
    required this.body,
    required this.daysLeft,
  });
}

/// Firebase Cloud Messaging service for push notifications, topics, & tokens
class FirebaseMessagingService {
  static final FirebaseMessagingService instance = FirebaseMessagingService._internal();

  final FirebaseMessaging _fcm;
  final FirebaseFirestore _firestore;
  final VercelApiService _apiService;

  FirebaseMessagingService({
    FirebaseMessaging? fcm,
    FirebaseFirestore? firestore,
    VercelApiService? apiService,
  })  : _fcm = fcm ?? FirebaseMessaging.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _apiService = apiService ?? VercelApiService();

  FirebaseMessagingService._internal()
      : _fcm = FirebaseMessaging.instance,
        _firestore = FirebaseFirestore.instance,
        _apiService = VercelApiService();

  /// Initialize FCM permissions & setup event listeners
  Future<void> initialize({bool isAdmin = true}) async {
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

      // 5. If admin, automatically register admin token and subscribe to admin topic
      if (isAdmin) {
        await subscribeToTopic('admin_alerts');
        final adminToken = await getOrRegisterAdminToken();
        debugPrint('[FCM] Admin initialized with device token: $adminToken');
      } else {
        final token = await getToken();
        debugPrint('[FCM] Customer device token: $token');
      }

      // 6. Token refresh listener
      _fcm.onTokenRefresh.listen((newToken) {
        debugPrint('[FCM Token Refresh] New token received: $newToken');
        if (isAdmin) {
          _registerTokenInFirestore(newToken, role: 'ADMIN');
        }
      });
    } catch (e) {
      debugPrint('[FCM] Initialization notice/error: $e');
    }
  }

  /// Get active FCM registration token (with web VAPID support)
  Future<String?> getToken() async {
    try {
      if (kIsWeb) {
        return await _fcm.getToken(
          vapidKey: DefaultFirebaseOptions.fcmVapidKey,
        );
      }
      return await _fcm.getToken();
    } catch (e) {
      debugPrint('[FCM] Error fetching token: $e');
      return null;
    }
  }

  /// Register active admin device token in Cloud Firestore
  Future<String?> getOrRegisterAdminToken() async {
    try {
      final token = await getToken();
      if (token != null && token.isNotEmpty) {
        await _registerTokenInFirestore(token, role: 'ADMIN');
        return token;
      }
    } catch (e) {
      debugPrint('[FCM] getOrRegisterAdminToken error: $e');
    }
    return null;
  }

  /// Fetch all registered Admin FCM tokens from Firestore
  Future<List<String>> fetchAdminTokens() async {
    final tokens = <String>[];
    try {
      final snapshot = await _firestore.collection('admin_fcm_tokens').get();
      for (var doc in snapshot.docs) {
        final data = doc.data();
        final t = data['token'] as String?;
        if (t != null && t.isNotEmpty && !tokens.contains(t)) {
          tokens.add(t);
        }
      }
    } catch (e) {
      debugPrint('[FCM] Error fetching admin tokens: $e');
    }
    return tokens;
  }

  /// Register customer device token in Firestore and associate with booking
  Future<void> registerCustomerToken({
    required String phone,
    required String bookingId,
    String? token,
    String? customerName,
  }) async {
    try {
      final activeToken = token ?? await getToken();
      if (activeToken == null || activeToken.isEmpty) return;

      final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');

      // 1. Save in customer_fcm_tokens collection
      await _firestore.collection('customer_fcm_tokens').doc(cleanPhone).set({
        'phone': cleanPhone,
        'bookingId': bookingId,
        'token': activeToken,
        'customerName': customerName ?? 'Customer',
        'lastUpdated': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      // 2. Link directly on the booking document
      final bookingDocs = await _firestore
          .collection('bookings')
          .where('bookingId', isEqualTo: bookingId)
          .limit(1)
          .get();

      if (bookingDocs.docs.isNotEmpty) {
        await bookingDocs.docs.first.reference.update({
          'fcmToken': activeToken,
          'customerDetails.fcmToken': activeToken,
          'updatedAt': FieldValue.serverTimestamp(),
        });
      } else {
        // In case doc ID is bookingId itself
        final docRef = _firestore.collection('bookings').doc(bookingId);
        final snap = await docRef.get();
        if (snap.exists) {
          await docRef.update({
            'fcmToken': activeToken,
            'customerDetails.fcmToken': activeToken,
            'updatedAt': FieldValue.serverTimestamp(),
          });
        }
      }
      debugPrint('[FCM] Customer token registered for $cleanPhone / #$bookingId');
    } catch (e) {
      debugPrint('[FCM] Error registering customer token: $e');
    }
  }

  /// Fetch customer token by booking ID or phone number
  Future<String?> fetchCustomerToken({
    required String bookingId,
    String? phone,
  }) async {
    try {
      // 1. Try querying booking directly
      final bookingDocs = await _firestore
          .collection('bookings')
          .where('bookingId', isEqualTo: bookingId)
          .limit(1)
          .get();

      if (bookingDocs.docs.isNotEmpty) {
        final data = bookingDocs.docs.first.data();
        final token = data['fcmToken'] ?? (data['customerDetails'] as Map?)?['fcmToken'];
        if (token is String && token.isNotEmpty) return token;
      }

      // 2. Try by phone if provided
      if (phone != null && phone.isNotEmpty) {
        final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
        final snap = await _firestore.collection('customer_fcm_tokens').doc(cleanPhone).get();
        if (snap.exists) {
          final t = snap.data()?['token'] as String?;
          if (t != null && t.isNotEmpty) return t;
        }
      }
    } catch (e) {
      debugPrint('[FCM] fetchCustomerToken error: $e');
    }
    return null;
  }

  /// Helper to store token in Firestore with safe doc ID
  Future<void> _registerTokenInFirestore(String token, {required String role}) async {
    try {
      // Create a deterministic safe doc id from first and last characters of token
      final safeId = token.length > 20
          ? '${token.substring(0, 10)}_${token.substring(token.length - 10)}'
          : token;

      await _firestore.collection('admin_fcm_tokens').doc(safeId).set({
        'token': token,
        'role': role,
        'platform': kIsWeb ? 'web' : defaultTargetPlatform.name,
        'lastUpdated': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      // Also maintain single-doc array for instant batch retrieval
      await _firestore.collection('system_config').doc('admin_fcm').set({
        'tokens': FieldValue.arrayUnion([token]),
        'lastActiveToken': token,
        'lastUpdated': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('[FCM] _registerTokenInFirestore error: $e');
    }
  }

  /// Trigger FCM push notification to Admin on new booking creation
  Future<bool> sendAdminBookingNotification({required BookingEntity booking}) async {
    final title = '🎉 New Bridal Booking: ${booking.customer.fullName}';
    final dateStr =
        '${booking.event.eventDate.day}/${booking.event.eventDate.month}/${booking.event.eventDate.year}';
    final body =
        'Booking #${booking.id} for $dateStr at ${booking.event.readyByTime} (${booking.serviceTitle}). Deposit required: ₹${booking.commercials.depositRequired.toStringAsFixed(0)}.';

    debugPrint('[FCM] Dispatching Admin Booking Alert for #${booking.id}');

    try {
      // 1. Write to Firestore 'notifications' collection (Live Notification Inbox)
      await _firestore.collection('notifications').add({
        'title': title,
        'body': body,
        'category': 'BOOKING',
        'targetRole': 'ADMIN',
        'bookingId': booking.id,
        'isUnread': true,
        'customerName': booking.customer.fullName,
        'customerPhone': booking.customer.phone,
        'eventDate': dateStr,
        'readyTime': booking.event.readyByTime,
        'service': booking.serviceTitle,
        'deposit': booking.commercials.depositRequired,
        'timestamp': FieldValue.serverTimestamp(),
        'createdAt': DateTime.now().toIso8601String(),
      });

      // 2. Fetch admin tokens
      final adminTokens = await fetchAdminTokens();

      // 3. Dispatch to Vercel API
      await _apiService.sendPushNotification(
        title: title,
        body: body,
        category: 'BOOKING',
        targetRole: 'ADMIN',
        bookingId: booking.id,
        targetTokens: adminTokens,
        topic: 'admin_alerts',
        data: {
          'bookingId': booking.id,
          'customerName': booking.customer.fullName,
          'service': booking.serviceTitle,
          'date': dateStr,
        },
      );

      return true;
    } catch (e) {
      debugPrint('[FCM] sendAdminBookingNotification error: $e');
      return false;
    }
  }

  /// Trigger FCM push notification to Admin when customer sends payment proof
  Future<bool> sendAdminPaymentNotification({
    required String bookingId,
    required String utrNumber,
    required double amount,
    required String customerName,
    String? proofUrl,
  }) async {
    final title = '💰 Payment Proof Submitted: $customerName';
    final body =
        'UTR $utrNumber received for #$bookingId (₹${amount.toStringAsFixed(0)}). Tap to review screenshot & lock calendar.';

    debugPrint('[FCM] Dispatching Admin Payment Alert for UTR $utrNumber / #$bookingId');

    try {
      // 1. Write to Firestore 'notifications' collection
      await _firestore.collection('notifications').add({
        'title': title,
        'body': body,
        'category': 'PAYMENT',
        'targetRole': 'ADMIN',
        'bookingId': bookingId,
        'isUnread': true,
        'customerName': customerName,
        'utrNumber': utrNumber,
        'amount': amount,
        'proofUrl': proofUrl ?? '',
        'timestamp': FieldValue.serverTimestamp(),
        'createdAt': DateTime.now().toIso8601String(),
      });

      // 2. Fetch admin tokens
      final adminTokens = await fetchAdminTokens();

      // 3. Dispatch to Vercel API
      await _apiService.sendPushNotification(
        title: title,
        body: body,
        category: 'PAYMENT',
        targetRole: 'ADMIN',
        bookingId: bookingId,
        targetTokens: adminTokens,
        topic: 'admin_alerts',
        data: {
          'bookingId': bookingId,
          'customerName': customerName,
          'utrNumber': utrNumber,
          'amount': amount.toString(),
        },
      );

      return true;
    } catch (e) {
      debugPrint('[FCM] sendAdminPaymentNotification error: $e');
      return false;
    }
  }

  /// Compute event timing reminder info (Today vs. Tomorrow vs. Upcoming)
  static BookingTimingReminderInfo computeTimingInfo({
    required DateTime eventDate,
    required String readyByTime,
    required String customerName,
    String? venue,
  }) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final eventDay = DateTime(eventDate.year, eventDate.month, eventDate.day);
    final diffDays = eventDay.difference(today).inDays;

    final venueStr = (venue != null && venue.trim().isNotEmpty) ? venue : 'Jodhpur Studio';

    if (diffDays == 0) {
      // Event is TODAY
      return BookingTimingReminderInfo(
        timingType: 'TODAY',
        daysLeft: 0,
        title: '🌟 Your Bridal Makeover is TODAY!',
        body:
            'Hi $customerName, your makeover is TODAY at $readyByTime at $venueStr! Prachi\'s royal team is prepared for you.',
      );
    } else if (diffDays == 1) {
      // Event is TOMORROW / TOMORROW EVENING
      final isEvening = readyByTime.startsWith('16') ||
          readyByTime.startsWith('17') ||
          readyByTime.startsWith('18') ||
          readyByTime.startsWith('19') ||
          readyByTime.toLowerCase().contains('pm');

      final timingLabel = isEvening ? 'Tomorrow Evening' : 'Tomorrow';

      return BookingTimingReminderInfo(
        timingType: 'TOMORROW',
        daysLeft: 1,
        title: '👑 $timingLabel Makeover Reminder!',
        body:
            'Hi $customerName, your makeover is $timingLabel at $readyByTime! Please remember your 24h skin prep guide and hydrate well.',
      );
    } else if (diffDays > 1) {
      // Event is UPCOMING
      final formattedDate = '${eventDate.day}/${eventDate.month}/${eventDate.year}';
      return BookingTimingReminderInfo(
        timingType: 'UPCOMING',
        daysLeft: diffDays,
        title: '🗓️ Royal Countdown: $diffDays days to your Big Day!',
        body:
            'Hi $customerName, only $diffDays days left until your makeover on $formattedDate at $readyByTime! We are excited to glam you.',
      );
    } else {
      // Past event
      return BookingTimingReminderInfo(
        timingType: 'COMPLETED',
        daysLeft: diffDays,
        title: '✨ Thank You from Makeovers by Prachi',
        body:
            'Hi $customerName, it was an honor glamming you! We would love to see your wedding photos and receive your review.',
      );
    }
  }

  /// Dispatch timing reminder notification to customer (Push Notification + WhatsApp + Firestore log)
  Future<Map<String, dynamic>> sendCustomerTimingReminder({
    required String bookingId,
    required String customerName,
    required String customerPhone,
    required DateTime eventDate,
    required String readyByTime,
    String? venue,
    String? customerToken,
  }) async {
    final info = computeTimingInfo(
      eventDate: eventDate,
      readyByTime: readyByTime,
      customerName: customerName,
      venue: venue,
    );

    debugPrint('[FCM] Sending ${info.timingType} reminder to $customerName (#$bookingId)');

    // 1. Resolve customer FCM token if not provided
    final resolvedToken = customerToken ??
        await fetchCustomerToken(bookingId: bookingId, phone: customerPhone);

    // 2. Log in Firestore 'notifications' collection
    await _firestore.collection('notifications').add({
      'title': info.title,
      'body': info.body,
      'category': 'REMINDER',
      'targetRole': 'CUSTOMER',
      'bookingId': bookingId,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'timingType': info.timingType,
      'daysLeft': info.daysLeft,
      'isUnread': true,
      'timestamp': FieldValue.serverTimestamp(),
      'createdAt': DateTime.now().toIso8601String(),
    });

    // 3. Dispatch FCM Push Notification
    if (resolvedToken != null && resolvedToken.isNotEmpty) {
      await _apiService.sendPushNotification(
        title: info.title,
        body: info.body,
        category: 'REMINDER',
        targetRole: 'CUSTOMER',
        bookingId: bookingId,
        targetTokens: [resolvedToken],
        data: {
          'bookingId': bookingId,
          'timingType': info.timingType,
          'customerName': customerName,
        },
      );
    }

    // 4. Trigger WhatsApp Message Automation
    _apiService.triggerWhatsAppAction(
      customerPhone: customerPhone,
      templateName: 'CUSTOMER_EVENT_TIMING_REMINDER',
      parameters: {
        'bookingId': bookingId,
        'customerName': customerName,
        'timingType': info.timingType,
        'title': info.title,
        'body': info.body,
        'readyTime': readyByTime,
        'venue': venue ?? 'Studio',
      },
    );

    return {
      'success': true,
      'timingType': info.timingType,
      'title': info.title,
      'body': info.body,
      'tokenFound': resolvedToken != null,
    };
  }

  /// Subscribe to broadcast topic (e.g., 'bridal_offers', 'admin_alerts', 'booking_updates')
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
