import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/booking_model.dart';

/// `services/{serviceId}`.
class StudioService {
  final String id;
  final String title;
  final String description;
  final double price;
  final String category;
  final int? durationMinutes;
  final String? imageUrl;
  final bool active;
  final int sortOrder;

  const StudioService({
    this.id = '',
    required this.title,
    this.description = '',
    required this.price,
    this.category = '',
    this.durationMinutes,
    this.imageUrl,
    this.active = true,
    this.sortOrder = 0,
  });

  factory StudioService.fromMap(String id, Map<String, dynamic> d) {
    final img = d['imageUrl'];
    return StudioService(
      id: id,
      title: (d['title'] ?? '').toString(),
      description: (d['description'] ?? '').toString(),
      price: (d['price'] is num) ? (d['price'] as num).toDouble() : 0,
      category: (d['category'] ?? '').toString(),
      durationMinutes: (d['durationMinutes'] as num?)?.toInt(),
      imageUrl: (img is String && img.isNotEmpty) ? img : null,
      active: d['active'] == true,
      sortOrder: (d['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toMap() => {
    'title': title,
    'description': description,
    'price': price,
    'category': category,
    'durationMinutes': durationMinutes,
    'imageUrl': imageUrl,
    'active': active,
    'sortOrder': sortOrder,
  };
}

/// `settings/business`.
class BusinessSettings {
  final String businessName;
  final String upiId;
  final String payeeName;
  final String whatsappNumber;
  final String phoneDisplay;
  final String email;
  final String studioAddress;
  final int depositPercent;
  final int holdMinutes;
  final Map<String, double> travelFees;

  static const travelFeeKeys = ['jodhpur', 'jaipur', 'udaipur', 'other'];

  const BusinessSettings({
    this.businessName = '',
    this.upiId = '',
    this.payeeName = '',
    this.whatsappNumber = '',
    this.phoneDisplay = '',
    this.email = '',
    this.studioAddress = '',
    this.depositPercent = 30,
    this.holdMinutes = 15,
    this.travelFees = const {},
  });

  factory BusinessSettings.fromMap(Map<String, dynamic>? d) {
    if (d == null) return const BusinessSettings();
    final tf = d['travelFees'] is Map
        ? Map<String, dynamic>.from(d['travelFees'] as Map)
        : const <String, dynamic>{};
    return BusinessSettings(
      businessName: (d['businessName'] ?? '').toString(),
      upiId: (d['upiId'] ?? '').toString(),
      payeeName: (d['payeeName'] ?? '').toString(),
      whatsappNumber: (d['whatsappNumber'] ?? '').toString(),
      phoneDisplay: (d['phoneDisplay'] ?? '').toString(),
      email: (d['email'] ?? '').toString(),
      studioAddress: (d['studioAddress'] ?? '').toString(),
      depositPercent: (d['depositPercent'] as num?)?.toInt() ?? 30,
      holdMinutes: (d['holdMinutes'] as num?)?.toInt() ?? 15,
      travelFees: {
        for (final e in tf.entries)
          if (e.value is num) e.key: (e.value as num).toDouble(),
      },
    );
  }

  Map<String, dynamic> toMap() => {
    'businessName': businessName,
    'upiId': upiId,
    'payeeName': payeeName,
    'whatsappNumber': whatsappNumber,
    'phoneDisplay': phoneDisplay,
    'email': email,
    'studioAddress': studioAddress,
    'depositPercent': depositPercent,
    'holdMinutes': holdMinutes,
    'travelFees': {for (final k in travelFeeKeys) k: travelFees[k] ?? 0},
  };
}

/// Validators shared by the Settings form (return null when valid).
class SettingsValidators {
  SettingsValidators._();

  static String? required(String? v, String label) =>
      (v == null || v.trim().isEmpty) ? '$label is required' : null;

  static String? upiId(String? v) {
    if (v == null || v.trim().isEmpty) return 'UPI ID is required';
    return RegExp(
          r'^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$',
        ).hasMatch(v.trim())
        ? null
        : 'Enter a valid UPI ID (e.g. studio@okicici)';
  }

  static String? whatsapp(String? v) {
    if (v == null || v.trim().isEmpty) return 'WhatsApp number is required';
    return RegExp(r'^\d{11,15}$').hasMatch(v.trim())
        ? null
        : 'Digits only, with country code (e.g. 919800000000)';
  }

  static String? email(String? v) {
    if (v == null || v.trim().isEmpty) return null;
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(v.trim())
        ? null
        : 'Enter a valid email';
  }

  static String? intInRange(String? v, String label, int min, int max) {
    final n = int.tryParse((v ?? '').trim());
    if (n == null) return '$label must be a whole number';
    if (n < min || n > max) return '$label must be between $min and $max';
    return null;
  }

  static String? nonNegativeAmount(String? v) {
    final n = double.tryParse((v ?? '').trim());
    if (n == null) return 'Enter an amount';
    if (n < 0) return 'Cannot be negative';
    return null;
  }
}

enum CalendarEntryStatus { hold, booked, blocked, unknown }

/// `calendar/{YYYY-MM-DD}`.
class CalendarEntry {
  final String date;
  final CalendarEntryStatus status;
  final String rawStatus;
  final String? bookingId;
  final DateTime? expiresAt;
  final String? note;

  const CalendarEntry({
    required this.date,
    required this.status,
    required this.rawStatus,
    this.bookingId,
    this.expiresAt,
    this.note,
  });

  factory CalendarEntry.fromMap(String date, Map<String, dynamic> d) {
    final raw = (d['status'] ?? '').toString();
    final CalendarEntryStatus status;
    switch (raw) {
      case 'HOLD':
        status = CalendarEntryStatus.hold;
        break;
      case 'BOOKED':
        status = CalendarEntryStatus.booked;
        break;
      case 'BLOCKED':
        status = CalendarEntryStatus.blocked;
        break;
      default:
        status = CalendarEntryStatus.unknown;
    }
    return CalendarEntry(
      date: date,
      rawStatus: raw,
      status: status,
      bookingId: d['bookingId'] is String ? d['bookingId'] as String : null,
      expiresAt: BookingModel.parseDate(d['expiresAt']),
      note: d['note'] is String ? d['note'] as String : null,
    );
  }

  /// An expired HOLD counts as free (contract).
  bool isLapsedHold([DateTime? now]) =>
      status == CalendarEntryStatus.hold &&
      expiresAt != null &&
      expiresAt!.isBefore(now ?? DateTime.now());
}

/// `notifications/{autoId}`.
class AdminNotification {
  final String id;
  final String title;
  final String body;
  final String category;
  final String? bookingId;
  final bool isUnread;
  final DateTime? createdAt;

  const AdminNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.category,
    this.bookingId,
    required this.isUnread,
    this.createdAt,
  });

  factory AdminNotification.fromDoc(
    DocumentSnapshot<Map<String, dynamic>> doc,
  ) {
    final d = doc.data() ?? const <String, dynamic>{};
    final bid = d['bookingId'];
    return AdminNotification(
      id: doc.id,
      title: (d['title'] ?? '').toString(),
      body: (d['body'] ?? '').toString(),
      category: (d['category'] ?? '').toString(),
      bookingId: (bid is String && bid.isNotEmpty) ? bid : null,
      isUnread: d['isUnread'] == true,
      createdAt: BookingModel.parseDate(d['createdAt']),
    );
  }
}
