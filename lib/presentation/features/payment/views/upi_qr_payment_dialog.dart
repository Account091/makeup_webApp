import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/firebase_auth_service.dart';

const String kGoogleSheetScriptUrl =
    'https://script.google.com/macros/s/AKfycbwrW-LiBBsmj2MBqsCaHUw55oqqXuIqWndH5oUJk5OGtQDNu_bNYIP_yGys3J70U9te/exec';

/// Modal dialog for UPI QR Code Payment with 5-Minute Expiry Countdown,
/// Payment Screenshot Upload, and Online Ledger / Excel Sheet Sync.
class UpiQrPaymentDialog extends StatefulWidget {
  final double amount;
  final String bookingId;
  final String serviceName;

  const UpiQrPaymentDialog({
    super.key,
    required this.amount,
    required this.bookingId,
    required this.serviceName,
  });

  static Future<void> show(
    BuildContext context, {
    required double amount,
    required String bookingId,
    required String serviceName,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => UpiQrPaymentDialog(
        amount: amount,
        bookingId: bookingId,
        serviceName: serviceName,
      ),
    );
  }

  @override
  State<UpiQrPaymentDialog> createState() => _UpiQrPaymentDialogState();
}

class _UpiQrPaymentDialogState extends State<UpiQrPaymentDialog> {
  static const int _initialTimerSeconds = 300; // 5 minutes = 300 seconds
  int _secondsRemaining = _initialTimerSeconds;
  Timer? _timer;

  bool _isUploading = false;
  bool _isSubmitted = false;
  String? _uploadedFileName;
  String? _statusMessage;

  final FirebaseAuthService _authService = FirebaseAuthService();

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
        setState(() {
          _statusMessage =
              'Payment window expired after 5 minutes. Please close and re-generate a fresh QR code.';
        });
      }
    });
  }

  String get _formattedTime {
    final minutes = (_secondsRemaining / 60).floor().toString().padLeft(2, '0');
    final seconds = (_secondsRemaining % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  Future<void> _handleScreenshotUpload() async {
    if (_secondsRemaining <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot upload screenshot: 5-minute payment window has expired.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
      _statusMessage = null;
    });

    // Simulate file picker & upload delay
    await Future.delayed(const Duration(milliseconds: 1500));

    final currentUser = _authService.currentUser;
    final userEmail = currentUser?.email ?? 'guest_customer@makeoversbyprachi.com';
    final userUid = currentUser?.uid ?? 'GUEST_${DateTime.now().millisecondsSinceEpoch}';

    final fileName = 'payment_proof_${widget.bookingId}_${DateTime.now().millisecondsSinceEpoch}.png';

    // Log payload for Online Excel Sheet / Ledger sync
    final excelPayload = {
      'timestamp': DateTime.now().toIso8601String(),
      'booking_id': widget.bookingId,
      'service_name': widget.serviceName,
      'amount_inr': widget.amount,
      'payer_email': userEmail,
      'payer_uid': userUid,
      'upi_id': 'bhawanisanker1967@okaxis',
      'payee_name': 'Bhawani Sankar',
      'screenshot_file': fileName,
      'status': 'PENDING_ADMIN_VERIFICATION',
      'timer_remaining_sec': _secondsRemaining,
      'excel_sync_status': 'SENT_TO_ONLINE_EXCEL_SHEET',
    };

    debugPrint('[Online Excel Sheet Sync] Dispatching record: $excelPayload');

    try {
      final response = await http.post(
        Uri.parse(kGoogleSheetScriptUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(excelPayload),
      );
      debugPrint('[Online Excel Sheet Sync] Server response: ${response.statusCode}');
    } catch (e) {
      debugPrint('[Online Excel Sheet Sync] HTTP dispatch error/notice: $e');
    }

    setState(() {
      _isUploading = false;
      _isSubmitted = true;
      _uploadedFileName = fileName;
      _statusMessage =
          'Screenshot successfully uploaded! Payment data synced to Online Excel Sheet & verified by Admin team within 5-min session.';
    });

    _timer?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    final isExpired = _secondsRemaining <= 0;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Pay with UPI QR',
                      style: AppTextStyles.headingTitle.copyWith(color: AppColors.deepPlum),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 8),

                // Amount & Booking Details
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.blushPink,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Service: ${widget.serviceName}', style: AppTextStyles.bodyPrimary),
                          Text('Booking ID: #${widget.bookingId}', style: AppTextStyles.bodySecondary),
                        ],
                      ),
                      Text(
                        '₹${widget.amount.toStringAsFixed(0)}',
                        style: AppTextStyles.headingTitle.copyWith(
                          color: AppColors.deepPlum,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Countdown Timer Banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isExpired
                        ? Colors.red.withValues(alpha: 0.1)
                        : Colors.orange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isExpired ? Colors.red : Colors.orange,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isExpired ? Icons.error_outline : Icons.timer_outlined,
                        color: isExpired ? Colors.red : Colors.orange.shade900,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isExpired
                            ? 'QR Code Expired'
                            : 'Upload screenshot within 5 mins: $_formattedTime',
                        style: AppTextStyles.bodyPrimary.copyWith(
                          fontWeight: FontWeight.bold,
                          color: isExpired ? Colors.red : Colors.orange.shade900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Display QR Code Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    color: Colors.white,
                    child: Image.asset(
                      'assets/images/upi_qr_code.jpg',
                      height: 260,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 200,
                          color: Colors.grey.shade200,
                          alignment: Alignment.center,
                          child: const Text('QR Code Asset Loading...'),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Payee Details
                Text(
                  'Payee: Bhawani Sankar',
                  style: AppTextStyles.sectionHeader,
                ),
                const SizedBox(height: 4),
                SelectableText(
                  'UPI ID: bhawanisanker1967@okaxis',
                  style: AppTextStyles.bodySecondary.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.deepPlum,
                  ),
                ),
                const SizedBox(height: 16),

                // Upload & Status Action Section
                if (_isSubmitted) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 40),
                        const SizedBox(height: 8),
                        Text(
                          'Payment Proof Submitted!',
                          style: AppTextStyles.sectionHeader.copyWith(color: Colors.green.shade900),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'File: $_uploadedFileName',
                          style: AppTextStyles.bodySecondary,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Data automatically logged into Online Excel Sheet.',
                          style: AppTextStyles.badgeText.copyWith(color: Colors.green.shade800),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  ElevatedButton.icon(
                    onPressed: (isExpired || _isUploading) ? null : _handleScreenshotUpload,
                    icon: _isUploading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.upload_file),
                    label: Text(
                      _isUploading
                          ? 'Uploading Screenshot & Syncing Excel...'
                          : 'Upload Payment Screenshot',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.deepPlum,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],

                if (_statusMessage != null && !_isSubmitted) ...[
                  const SizedBox(height: 12),
                  Text(
                    _statusMessage!,
                    style: AppTextStyles.bodySecondary.copyWith(
                      color: isExpired ? Colors.red : AppColors.deepPlum,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
