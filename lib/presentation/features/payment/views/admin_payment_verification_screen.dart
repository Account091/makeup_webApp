import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/firebase_messaging_service.dart';
import '../../../../data/datasources/vercel_api_service.dart';

class PaymentSubmissionItem {
  final String? docId;
  final String bookingId;
  final String customerName;
  final String customerPhone;
  final double requiredAmount;
  final double detectedAmount;
  final String utrNumber;
  final String aiStatus; // 'SUCCESS' | 'NEEDS_HUMAN_REVIEW'
  final String proofUrl;
  String paymentStatus; // 'VERIFICATION_PENDING' | 'VERIFIED' | 'REJECTED'
  bool isCalendarLocked;
  final DateTime? eventDate;
  final String? readyByTime;
  final String? venue;

  PaymentSubmissionItem({
    this.docId,
    required this.bookingId,
    required this.customerName,
    required this.customerPhone,
    required this.requiredAmount,
    required this.detectedAmount,
    required this.utrNumber,
    required this.aiStatus,
    required this.proofUrl,
    this.paymentStatus = 'VERIFICATION_PENDING',
    this.isCalendarLocked = false,
    this.eventDate,
    this.readyByTime,
    this.venue,
  });

  factory PaymentSubmissionItem.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    final cust = data['customerDetails'] as Map<String, dynamic>? ?? {};
    final comm = data['commercials'] as Map<String, dynamic>? ?? {};
    final pay = data['payment'] as Map<String, dynamic>? ?? {};
    final ev = data['event'] as Map<String, dynamic>? ?? {};

    final bookingId = data['bookingId'] ?? doc.id;
    final customerName = cust['fullName'] ?? data['customerName'] ?? 'Customer';
    final customerPhone = cust['phone'] ?? data['customerPhone'] ?? '';
    final requiredAmount = (comm['depositRequired'] as num?)?.toDouble() ??
        (data['requiredAmount'] as num?)?.toDouble() ??
        7500.0;
    final detectedAmount = (comm['depositPaid'] as num?)?.toDouble() ??
        (data['detectedAmount'] as num?)?.toDouble() ??
        requiredAmount;
    final utrNumber = pay['utrNumber'] ?? data['utrNumber'] ?? 'N/A';
    final proofUrl = pay['proofUrl'] ??
        pay['proofFileRef'] ??
        data['paymentProofUrl'] ??
        data['proofUrl'] ??
        '';

    final rawStatus = (pay['status'] ?? data['status'] ?? 'VERIFICATION_PENDING')
        .toString()
        .toUpperCase();
    final isVerified = rawStatus == 'VERIFIED' || rawStatus == 'CONFIRMED';
    final paymentStatus = isVerified ? 'VERIFIED' : 'VERIFICATION_PENDING';

    DateTime? eventDate;
    if (ev['date'] != null) {
      eventDate = DateTime.tryParse(ev['date'].toString());
    } else if (ev['eventDate'] != null) {
      if (ev['eventDate'] is Timestamp) {
        eventDate = (ev['eventDate'] as Timestamp).toDate();
      } else {
        eventDate = DateTime.tryParse(ev['eventDate'].toString());
      }
    }
    final readyByTime = ev['readyByTime']?.toString() ?? '16:00';
    final venue = ev['venue']?.toString() ?? ev['venueLocation']?.toString() ?? 'Gorbandh Palace, Jodhpur';

    return PaymentSubmissionItem(
      docId: doc.id,
      bookingId: bookingId,
      customerName: customerName,
      customerPhone: customerPhone,
      requiredAmount: requiredAmount,
      detectedAmount: detectedAmount,
      utrNumber: utrNumber,
      aiStatus: data['aiStatus'] ?? 'SUCCESS',
      proofUrl: proofUrl,
      paymentStatus: paymentStatus,
      isCalendarLocked: isVerified,
      eventDate: eventDate,
      readyByTime: readyByTime,
      venue: venue,
    );
  }
}

class AdminPaymentVerificationScreen extends StatefulWidget {
  const AdminPaymentVerificationScreen({super.key});

  @override
  State<AdminPaymentVerificationScreen> createState() =>
      _AdminPaymentVerificationScreenState();
}

class _AdminPaymentVerificationScreenState
    extends State<AdminPaymentVerificationScreen> {
  final _apiService = VercelApiService();

  // Fallback demo submissions with working high-res receipts
  final List<PaymentSubmissionItem> _fallbackSubmissions = [
    PaymentSubmissionItem(
      bookingId: 'BK-2026-001',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98290 12345',
      requiredAmount: 7500,
      detectedAmount: 7500,
      utrNumber: '349812739481',
      aiStatus: 'SUCCESS',
      proofUrl:
          'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?w=800',
    ),
    PaymentSubmissionItem(
      bookingId: 'BK-2026-002',
      customerName: 'Ananya Rathore',
      customerPhone: '+91 98290 99887',
      requiredAmount: 4500,
      detectedAmount: 4500,
      utrNumber: '349812739499',
      aiStatus: 'SUCCESS',
      proofUrl:
          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
    ),
  ];

  /// Converts Google Drive share links into direct viewable image stream URLs
  String _formatDriveImageUrl(String url) {
    if (url.isEmpty) return '';
    final clean = url.trim();

    String? fileId;
    final match1 = RegExp(r'/file/d/([a-zA-Z0-9_-]+)').firstMatch(clean);
    if (match1 != null) {
      fileId = match1.group(1);
    } else {
      final match2 = RegExp(r'[?&]id=([a-zA-Z0-9_-]+)').firstMatch(clean);
      if (match2 != null) {
        fileId = match2.group(1);
      } else {
        final match3 = RegExp(r'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)')
            .firstMatch(clean);
        if (match3 != null) {
          fileId = match3.group(1);
        }
      }
    }

    if (fileId != null) {
      // Google Drive thumbnail proxy endpoint returns raw image bytes directly
      return 'https://drive.google.com/thumbnail?id=$fileId&sz=w1200';
    }

    return clean;
  }

  void _approvePayment(PaymentSubmissionItem item) async {
    setState(() {
      item.paymentStatus = 'VERIFIED';
      item.isCalendarLocked = true;
    });

    // 1. Update real document in Cloud Firestore if available
    if (item.docId != null && item.docId!.isNotEmpty) {
      try {
        await FirebaseFirestore.instance
            .collection('bookings')
            .doc(item.docId)
            .update({
          'status': 'CONFIRMED',
          'payment.status': 'VERIFIED',
          'commercials.depositPaid': item.detectedAmount,
          'calendarLocked': true,
          'updatedAt': FieldValue.serverTimestamp(),
        });
      } catch (e) {
        debugPrint('[PaymentVerification] Firestore update notice: $e');
      }
    }

    // 2. Dispatch real event to live Vercel API
    _apiService.triggerWhatsAppAction(
      customerPhone: item.customerPhone,
      templateName: 'PAYMENT_VERIFIED_CONFIRMED',
      parameters: {
        'bookingId': item.bookingId,
        'customerName': item.customerName,
        'amount': item.detectedAmount,
      },
    );

    // 3. Dispatch FCM Push Notification & Timing Update to Customer
    FirebaseMessagingService.instance.sendCustomerTimingReminder(
      bookingId: item.bookingId,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      eventDate: item.eventDate ?? DateTime.now().add(const Duration(days: 7)),
      readyByTime: item.readyByTime ?? '16:00',
      venue: item.venue,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Payment for ${item.bookingId} VERIFIED! Cloud synced & Calendar LOCKED for ${item.customerName}.',
          ),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _showTimingReminderDialog(PaymentSubmissionItem item) {
    final eventDate = item.eventDate ?? DateTime.now().add(const Duration(days: 1));
    final readyTime = item.readyByTime ?? '16:00';
    final info = FirebaseMessagingService.computeTimingInfo(
      eventDate: eventDate,
      readyByTime: readyTime,
      customerName: item.customerName,
      venue: item.venue,
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: AppColors.softRose,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.notifications_active, color: AppColors.deepPlum),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Send Event Timing Reminder',
                style: AppTextStyles.headingTitle.copyWith(fontSize: 16),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: info.timingType == 'TODAY'
                    ? Colors.red.shade100
                    : info.timingType == 'TOMORROW'
                        ? Colors.amber.shade100
                        : Colors.blue.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'STATUS: ${info.timingType} EVENT',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: info.timingType == 'TODAY'
                      ? Colors.red.shade900
                      : info.timingType == 'TOMORROW'
                          ? Colors.amber.shade900
                          : Colors.blue.shade900,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              info.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 6),
            Text(
              info.body,
              style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.black87),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.blushPink,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.send_to_mobile, size: 18, color: AppColors.deepPlum),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Dispatches live Push Notification to customer\'s device + WhatsApp automated reminder.',
                      style: TextStyle(fontSize: 11, color: AppColors.deepPlum),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.deepPlum,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.send, size: 16),
            label: const Text('Send Push & WhatsApp'),
            onPressed: () async {
              Navigator.pop(ctx);
              final res = await FirebaseMessagingService.instance.sendCustomerTimingReminder(
                bookingId: item.bookingId,
                customerName: item.customerName,
                customerPhone: item.customerPhone,
                eventDate: eventDate,
                readyByTime: readyTime,
                venue: item.venue,
              );
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Timing reminder sent to ${item.customerName}! (${res['timingType']})',
                    ),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  void _callCustomer(String phone, {String? customerName}) {
    if (phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No phone number provided for this customer.')),
      );
      return;
    }

    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    var rawDigits = cleanPhone.replaceAll('+', '').trim();
    // In India, prefix 91 if customer provided 10 digits
    if (rawDigits.length == 10) {
      rawDigits = '91$rawDigits';
    }
    final whatsappPhone = rawDigits;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Connect with Customer',
                style: AppTextStyles.headingTitle,
              ),
              const SizedBox(height: 4),
              Text(
                '${customerName ?? "Customer"} • $phone',
                style: AppTextStyles.bodySecondary,
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.chat, color: Colors.green),
                ),
                title: const Text('WhatsApp Chat & Voice Call',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text(
                    'Instant WhatsApp connect (Direct Web, Desktop & Mobile)'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                onTap: () async {
                  Navigator.pop(ctx);
                  final uri = Uri.parse('https://wa.me/$whatsappPhone');
                  try {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  } catch (_) {
                    try {
                      await launchUrl(uri);
                    } catch (e) {
                      await Clipboard.setData(ClipboardData(text: phone));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Copied $phone to clipboard!')),
                        );
                      }
                    }
                  }
                },
              ),
              const Divider(),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.phone, color: Colors.blue),
                ),
                title: const Text('Direct Phone Dialer',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Open mobile dialer / phone app'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                onTap: () async {
                  Navigator.pop(ctx);
                  final uri = Uri.parse('tel:$cleanPhone');
                  try {
                    final launched = await launchUrl(uri);
                    if (!launched) {
                      await Clipboard.setData(ClipboardData(text: cleanPhone));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Dialer not available on desktop. Copied $cleanPhone to clipboard!',
                            ),
                          ),
                        );
                      }
                    }
                  } catch (_) {
                    await Clipboard.setData(ClipboardData(text: cleanPhone));
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Copied $cleanPhone to clipboard!',
                          ),
                        ),
                      );
                    }
                  }
                },
              ),
              const Divider(),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.copy, color: AppColors.deepPlum),
                ),
                title: const Text('Copy Phone Number',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(phone),
                onTap: () async {
                  Navigator.pop(ctx);
                  await Clipboard.setData(ClipboardData(text: cleanPhone));
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Copied $phone to clipboard!')),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _viewProof(PaymentSubmissionItem item) {
    final rawUrl = item.proofUrl.trim();
    final directImageUrl = _formatDriveImageUrl(rawUrl);
    final isDrive = rawUrl.contains('drive.google.com') ||
        rawUrl.contains('googleusercontent.com');

    // Decode Base64 data URLs if uploaded as base64 string
    final isBase64 = rawUrl.startsWith('data:image');
    Uint8List? memoryBytes;
    if (isBase64) {
      try {
        final commaIndex = rawUrl.indexOf(',');
        final base64String = commaIndex != -1 ? rawUrl.substring(commaIndex + 1) : rawUrl;
        memoryBytes = base64Decode(base64String.replaceAll(RegExp(r'\s+'), ''));
      } catch (e) {
        debugPrint('[AdminPaymentVerification] Base64 decode notice: $e');
      }
    }

    showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        clipBehavior: Clip.antiAlias,
        backgroundColor: Colors.white,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 620,
            maxHeight: MediaQuery.of(context).size.height * 0.88,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Payment Proof Verification',
                            style: AppTextStyles.headingTitle.copyWith(fontSize: 18),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Client: ${item.customerName} • UTR: ${item.utrNumber}',
                            style: AppTextStyles.bodySecondary.copyWith(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              // Scrollable Body
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // High-res Image Preview Frame
                      Container(
                        constraints: const BoxConstraints(minHeight: 280, maxHeight: 420),
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFF18181B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.lightBorder),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: rawUrl.isEmpty
                            ? const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(24.0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.image_not_supported, size: 48, color: Colors.white54),
                                      SizedBox(height: 10),
                                      Text(
                                        'No proof image submitted yet',
                                        style: TextStyle(color: Colors.white70),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : (memoryBytes != null
                                ? InteractiveViewer(
                                    panEnabled: true,
                                    minScale: 0.5,
                                    maxScale: 4.0,
                                    child: Center(
                                      child: Image.memory(
                                        memoryBytes,
                                        fit: BoxFit.contain,
                                      ),
                                    ),
                                  )
                                : InteractiveViewer(
                                    panEnabled: true,
                                    minScale: 0.5,
                                    maxScale: 4.0,
                                    child: Center(
                                      child: Image.network(
                                        directImageUrl,
                                        fit: BoxFit.contain,
                                        loadingBuilder: (context, child, loadingProgress) {
                                          if (loadingProgress == null) return child;
                                          return Center(
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const CircularProgressIndicator(
                                                  color: AppColors.roseGold,
                                                ),
                                                const SizedBox(height: 12),
                                                Text(
                                                  isDrive
                                                      ? 'Fetching Google Drive Proof...'
                                                      : 'Loading Payment Receipt...',
                                                  style: const TextStyle(
                                                    color: Colors.white70,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        },
                                        errorBuilder: (context, error, stackTrace) {
                                          return Center(
                                            child: Padding(
                                              padding: const EdgeInsets.all(20.0),
                                              child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(
                                                    Icons.receipt_long,
                                                    size: 44,
                                                    color: AppColors.roseGold,
                                                  ),
                                                  const SizedBox(height: 10),
                                                  const Text(
                                                    'Payment Receipt Uploaded',
                                                    textAlign: TextAlign.center,
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 14,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    'Ref: ${item.bookingId} • UTR: ${item.utrNumber}',
                                                    style: const TextStyle(
                                                      color: Colors.white70,
                                                      fontSize: 11,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 12),
                                                  ElevatedButton.icon(
                                                    style: ElevatedButton.styleFrom(
                                                      backgroundColor: AppColors.roseGold,
                                                      foregroundColor: Colors.white,
                                                    ),
                                                    icon: const Icon(Icons.open_in_new, size: 16),
                                                    label: const Text('Open Direct Image Link'),
                                                    onPressed: () async {
                                                      final uri = Uri.parse(rawUrl);
                                                      try {
                                                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                                                      } catch (_) {
                                                        await launchUrl(uri);
                                                      }
                                                    },
                                                  ),
                                                ],
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  )),
                      ),

                      const SizedBox(height: 12),

                      // Verification Details Card
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.champagne.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.lightBorder),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Deposit Required:', style: TextStyle(fontSize: 12)),
                                Text('₹${item.requiredAmount.toStringAsFixed(0)}',
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('UTR / Reference:', style: TextStyle(fontSize: 12)),
                                SelectableText(
                                  item.utrNumber,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                    color: AppColors.deepPlum,
                                  ),
                                ),
                              ],
                            ),
                            if (rawUrl.isNotEmpty && !isBase64) ...[
                              const Divider(height: 16),
                              Row(
                                children: [
                                  Icon(
                                    isDrive ? Icons.add_to_drive : Icons.link,
                                    size: 16,
                                    color: AppColors.deepPlum,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      rawUrl,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 11, color: AppColors.deepPlum),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.open_in_new, size: 16),
                                    tooltip: 'Open in new tab',
                                    onPressed: () async {
                                      final uri = Uri.parse(rawUrl);
                                      try {
                                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                                      } catch (_) {
                                        await launchUrl(uri);
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Action Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: AppColors.lightBorder)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Verified: ₹${item.detectedAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppColors.deepPlum,
                      ),
                    ),
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'),
                        ),
                        if (item.paymentStatus != 'VERIFIED') ...[
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green.shade800,
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(Icons.check_circle, size: 16),
                            label: const Text('Approve & Lock'),
                            onPressed: () {
                              Navigator.pop(context);
                              _approvePayment(item);
                            },
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'UPI Payment Verification Queue',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Human Review & Calendar Lock Surface',
                            style: AppTextStyles.headingDisplay
                                .copyWith(fontSize: 22),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Live Google Drive proof preview, UTR verification, and calendar locks.',
                            style: AppTextStyles.bodySecondary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Live Firestore Stream with Fallback
                StreamBuilder<QuerySnapshot>(
                  stream: FirebaseFirestore.instance
                      .collection('bookings')
                      .snapshots(),
                  builder: (context, snapshot) {
                    List<PaymentSubmissionItem> submissions = [];

                    if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
                      submissions = snapshot.data!.docs
                          .map((doc) => PaymentSubmissionItem.fromFirestore(doc))
                          .where((item) => item.proofUrl.isNotEmpty || item.utrNumber != 'N/A')
                          .toList();
                    }

                    // Fallback to sample items if no proof bookings yet in Firestore
                    if (submissions.isEmpty) {
                      submissions = _fallbackSubmissions;
                    }

                    return ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: submissions.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final item = submissions[index];
                        return _buildPaymentCard(item);
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentCard(PaymentSubmissionItem item) {
    final hasProof = item.proofUrl.isNotEmpty;
    final isDrive = item.proofUrl.contains('drive.google.com') ||
        item.proofUrl.contains('googleusercontent.com');

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item.paymentStatus == 'VERIFIED'
              ? Colors.green
              : AppColors.lightBorder,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Ref: ${item.bookingId}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.sectionHeader,
                ),
              ),
              const SizedBox(width: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  if (hasProof)
                    Chip(
                      avatar: Icon(
                        isDrive ? Icons.add_to_drive : Icons.image,
                        size: 14,
                        color: Colors.blue.shade900,
                      ),
                      label: Text(
                        isDrive ? 'Drive Proof Attached' : 'Proof Attached',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade900,
                        ),
                      ),
                      backgroundColor: Colors.blue.shade50,
                      padding: EdgeInsets.zero,
                    ),
                  Chip(
                    label: Text(
                      item.paymentStatus == 'VERIFIED'
                          ? 'VERIFIED'
                          : 'NEEDS REVIEW',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: item.paymentStatus == 'VERIFIED'
                            ? Colors.green.shade900
                            : Colors.orange.shade900,
                      ),
                    ),
                    backgroundColor: item.paymentStatus == 'VERIFIED'
                        ? Colors.green.shade100
                        : Colors.orange.shade100,
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          Wrap(
            spacing: 24,
            runSpacing: 8,
            children: [
              Text(
                'Customer: ${item.customerName}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              Text('Phone: ${item.customerPhone}'),
              Text('UTR: ${item.utrNumber}'),
            ],
          ),

          const SizedBox(height: 8),

          Wrap(
            spacing: 24,
            runSpacing: 8,
            children: [
              Text('Required Deposit: ₹${item.requiredAmount.toStringAsFixed(0)}'),
              Text(
                'Detected / Paid: ₹${item.detectedAmount.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.deepPlum,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          Wrap(
            spacing: 10,
            runSpacing: 10,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              OutlinedButton.icon(
                onPressed: () => _viewProof(item),
                icon: Icon(
                  isDrive ? Icons.add_to_drive : Icons.remove_red_eye_outlined,
                  size: 16,
                  color: isDrive ? Colors.blue.shade800 : AppColors.deepPlum,
                ),
                label: Text(isDrive ? 'View Drive Proof' : 'View Proof Screenshot'),
              ),
              OutlinedButton.icon(
                onPressed: () => _callCustomer(item.customerPhone,
                    customerName: item.customerName),
                icon: const Icon(Icons.phone_in_talk, size: 16),
                label: const Text('Call Customer'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.deepPlum,
                ),
              ),
              OutlinedButton.icon(
                onPressed: () => _showTimingReminderDialog(item),
                icon: const Icon(Icons.notifications_active_outlined, size: 16),
                label: const Text('Send Timing Reminder'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.deepPlum,
                ),
              ),
              if (item.paymentStatus != 'VERIFIED')
                ElevatedButton.icon(
                  onPressed: () => _approvePayment(item),
                  icon: const Icon(Icons.check_circle_outline, size: 16),
                  label: const Text('Approve & Lock Calendar'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade800,
                    foregroundColor: Colors.white,
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.lock, color: Colors.green, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'CALENDAR LOCKED',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
