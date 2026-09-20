import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class PaymentSubmissionItem {
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

  PaymentSubmissionItem({
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
  });
}

class AdminPaymentVerificationScreen extends StatefulWidget {
  const AdminPaymentVerificationScreen({super.key});

  @override
  State<AdminPaymentVerificationScreen> createState() =>
      _AdminPaymentVerificationScreenState();
}

class _AdminPaymentVerificationScreenState
    extends State<AdminPaymentVerificationScreen> {
  final List<PaymentSubmissionItem> _submissions = [
    PaymentSubmissionItem(
      bookingId: 'BK-2026-001',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98290 12345',
      requiredAmount: 7500,
      detectedAmount: 7500,
      utrNumber: '349812739481',
      aiStatus: 'SUCCESS',
      proofUrl: 'https://firebasestorage.googleapis.com/v0/b/tiktok1-d7d25.appspot.com/o/payment_proofs%2Fsample1.png?alt=media',
    ),
    PaymentSubmissionItem(
      bookingId: 'BK-2026-002',
      customerName: 'Ananya Rathore',
      customerPhone: '+91 98290 99887',
      requiredAmount: 4500,
      detectedAmount: 4500,
      utrNumber: '349812739499',
      aiStatus: 'SUCCESS',
      proofUrl: 'https://firebasestorage.googleapis.com/v0/b/tiktok1-d7d25.appspot.com/o/payment_proofs%2Fsample2.png?alt=media',
    ),
  ];

  void _approvePayment(PaymentSubmissionItem item) {
    setState(() {
      item.paymentStatus = 'VERIFIED';
      item.isCalendarLocked = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Payment for ${item.bookingId} VERIFIED! Booking CONFIRMED & Calendar LOCKED for ${item.customerName}.',
        ),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _callCustomer(String phone) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Launching call / WhatsApp for $phone...'),
        backgroundColor: AppColors.deepPlum,
      ),
    );
  }

  void _viewProof(String proofUrl) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Payment Proof Screenshot'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 300,
              color: Colors.grey.shade200,
              alignment: Alignment.center,
              child: const Icon(Icons.receipt_long, size: 64, color: AppColors.deepPlum),
            ),
            const SizedBox(height: 12),
            SelectableText(proofUrl, style: const TextStyle(fontSize: 11)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
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
          style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 16),
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
                Text('Human Review & Calendar Lock Surface',
                    style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
                const SizedBox(height: 4),
                Text(
                  'Verify AI-parsed UTR screenshots, call customers, and lock wedding dates.',
                  style: AppTextStyles.bodySecondary,
                ),
                const SizedBox(height: 20),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _submissions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final item = _submissions[index];

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
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.green.shade100,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'AI: ${item.aiStatus}',
                                      style: TextStyle(
                                        color: Colors.green.shade900,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: item.paymentStatus == 'VERIFIED'
                                          ? Colors.green
                                          : Colors.orange,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      item.paymentStatus,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Customer: ${item.customerName}',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.bodyPrimary),
                                    Text('Phone: ${item.customerPhone}',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.bodySecondary),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₹${item.requiredAmount.toStringAsFixed(0)}',
                                    style: AppTextStyles.headingTitle,
                                  ),
                                  Text('UTR: ${item.utrNumber}',
                                      style: const TextStyle(fontFamily: 'monospace', fontSize: 12)),
                                ],
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
                                onPressed: () => _viewProof(item.proofUrl),
                                icon: const Icon(Icons.remove_red_eye_outlined, size: 16),
                                label: const Text('View Proof'),
                              ),
                              OutlinedButton.icon(
                                onPressed: () => _callCustomer(item.customerPhone),
                                icon: const Icon(Icons.phone_in_talk, size: 16),
                                label: const Text('Call Customer'),
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
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
