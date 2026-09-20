import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../../core/constants/api_endpoints.dart';

class VercelApiService {
  final http.Client _client;

  VercelApiService({http.Client? client}) : _client = client ?? http.Client();

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MakeoversByPrachiFlutter/1.0',
      };

  /// 1. Health Check Endpoint
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final response = await _client
          .get(Uri.parse(ApiEndpoints.health), headers: _headers)
          .timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'error': 'Health check failed: ${response.body}',
        };
      }
    } catch (e) {
      debugPrint('[VercelApiService] checkHealth exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 2. Create Real Booking & 7-Minute Reservation Session on Vercel
  Future<Map<String, dynamic>> createBookingSession({
    required String fullName,
    required String phone,
    required String email,
    required String service,
    required String packageType,
    required String date,
    required String readyTime,
    required String venue,
    required String city,
    required int guestCount,
  }) async {
    try {
      final payload = {
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'service': service,
        'packageType': packageType,
        'date': date,
        'readyTime': readyTime,
        'venue': venue,
        'city': city,
        'guestCount': guestCount,
      };

      final response = await _client
          .post(
            Uri.parse(ApiEndpoints.createBookingSession),
            headers: _headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, ...data};
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'error': data['error'] ?? 'Booking session creation failed',
        };
      }
    } catch (e) {
      debugPrint('[VercelApiService] createBookingSession exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 3. Submit Payment Proof (UTR & Screenshot) to Vercel
  Future<Map<String, dynamic>> submitPaymentProof({
    required String bookingId,
    required String utrNumber,
    required String paymentProofName,
    String? paymentProofUrl,
  }) async {
    try {
      final payload = {
        'bookingId': bookingId,
        'utrNumber': utrNumber,
        'paymentProofName': paymentProofName,
        'paymentProofUrl': paymentProofUrl ?? '',
      };

      final response = await _client
          .post(
            Uri.parse(ApiEndpoints.submitPaymentProof),
            headers: _headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, ...data};
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'error': data['error'] ?? 'Payment proof submission failed',
        };
      }
    } catch (e) {
      debugPrint('[VercelApiService] submitPaymentProof exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 4. Get Destination Location & Travel Quote from Vercel
  Future<Map<String, dynamic>> getLocationQuote({
    required String brideName,
    required String destinationCity,
    String? venueAddress,
    String? travelMode,
  }) async {
    try {
      final payload = {
        'brideName': brideName,
        'destinationCity': destinationCity,
        'venueAddress': venueAddress ?? 'Palace Venue',
        'travelMode': travelMode ?? 'Flight',
      };

      final response = await _client
          .post(
            Uri.parse(ApiEndpoints.locationQuote),
            headers: _headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, ...data};
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'error': data['error'] ?? 'Failed to compute location quote',
        };
      }
    } catch (e) {
      debugPrint('[VercelApiService] getLocationQuote exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 5. Fetch Marketplace Artists Catalog
  Future<Map<String, dynamic>> fetchMarketplaceArtists() async {
    try {
      final response = await _client
          .get(Uri.parse(ApiEndpoints.marketplaceArtists), headers: _headers)
          .timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'statusCode': response.statusCode};
      }
    } catch (e) {
      debugPrint('[VercelApiService] fetchMarketplaceArtists exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 6. Trigger WhatsApp Cloud Automation Action
  Future<Map<String, dynamic>> triggerWhatsAppAction({
    required String customerPhone,
    required String templateName,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      final payload = {
        'phone': customerPhone,
        'template': templateName,
        'parameters': parameters ?? {},
      };

      final response = await _client
          .post(
            Uri.parse(ApiEndpoints.whatsappAdminAction),
            headers: _headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return {'success': response.statusCode < 300, ...data};
    } catch (e) {
      debugPrint('[VercelApiService] triggerWhatsAppAction exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  /// 7. Dispatch FCM Cloud Push Notification to Admin or Customer
  Future<Map<String, dynamic>> sendPushNotification({
    required String title,
    required String body,
    String? category,
    String? targetRole, // 'ADMIN' | 'CUSTOMER'
    String? bookingId,
    List<String>? targetTokens,
    String? topic,
    Map<String, dynamic>? data,
  }) async {
    try {
      final payload = {
        'title': title,
        'body': body,
        'category': category ?? 'GENERAL',
        'targetRole': targetRole ?? 'ADMIN',
        if (bookingId != null) 'bookingId': bookingId,
        if (targetTokens != null && targetTokens.isNotEmpty)
          'tokens': targetTokens,
        if (topic != null) 'topic': topic,
        if (data != null) 'data': data,
      };

      final response = await _client
          .post(
            Uri.parse(ApiEndpoints.sendFcmNotification),
            headers: _headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      final resData = jsonDecode(response.body) as Map<String, dynamic>;
      return {'success': response.statusCode < 300, ...resData};
    } catch (e) {
      debugPrint('[VercelApiService] sendPushNotification exception: $e');
      return {'success': false, 'error': e.toString()};
    }
  }
}
