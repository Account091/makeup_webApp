import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../data/models/booking_model.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../../common/widgets/status_badge.dart';
import '../../payment/views/upi_qr_payment_dialog.dart';
import '../../../../core/services/firebase_messaging_service.dart';

class BookingStatusScreen extends StatefulWidget {
  const BookingStatusScreen({super.key});

  @override
  State<BookingStatusScreen> createState() => _BookingStatusScreenState();
}

class _BookingStatusScreenState extends State<BookingStatusScreen> {
  final _searchController = TextEditingController(text: 'BK-2026-001');
  bool _isSearching = false;
  bool _notFound = false;
  BookingEntity? _currentBooking;

  // Sample fallback booking
  final BookingEntity _fallbackBooking = BookingEntity(
    id: 'BK-2026-001',
    customer: const CustomerDetails(
      fullName: 'Priya Sharma',
      phone: '+91 98290 12345',
      email: 'priya.sharma@example.com',
      instagramHandle: '@priya_bride',
    ),
    event: EventDetails(
      eventType: 'Royal Bridal',
      eventDate: DateTime.now().add(const Duration(days: 14)),
      readyByTime: '16:00',
      venueLocation: 'Gorbandh Palace, Jodhpur',
      city: 'Jodhpur',
      isOutstation: false,
    ),
    serviceTitle: 'Signature Bridal Makeover',
    packageName: 'Royal Rajasthani Poshak & Jewelry Package',
    commercials: const CommercialDetails(
      basePrice: 25000,
      travelFee: 1500,
      depositRequired: 7500,
      depositPaid: 7500,
    ),
    status: BookingStatus.confirmed,
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
  );

  @override
  void initState() {
    super.initState();
    _currentBooking = _fallbackBooking;
  }

  Future<void> _searchBooking() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isSearching = true;
      _notFound = false;
    });

    try {
      final cleanDigits = query.replaceAll(RegExp(r'[^0-9]'), '');
      final snapshot =
          await FirebaseFirestore.instance.collection('bookings').get();

      BookingEntity? found;
      for (var doc in snapshot.docs) {
        final data = doc.data();
        final model = BookingModel.fromFirestore(doc);
        final bookingId = (data['bookingId'] ?? doc.id).toString();
        final phoneDigits =
            model.customer.phone.replaceAll(RegExp(r'[^0-9]'), '');

        if (model.id.toLowerCase() == query.toLowerCase() ||
            bookingId.toLowerCase() == query.toLowerCase() ||
            doc.id.toLowerCase() == query.toLowerCase() ||
            (cleanDigits.isNotEmpty && phoneDigits.contains(cleanDigits))) {
          found = model;
          break;
        }
      }

      if (!mounted) return;

      if (found != null) {
        setState(() {
          _currentBooking = found;
          _isSearching = false;
          _notFound = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Found booking for ${found.customer.fullName}!'),
            backgroundColor: AppColors.emeraldGreen,
          ),
        );
      } else {
        setState(() {
          _isSearching = false;
          _notFound = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSearching = false;
          _notFound = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Track Booking Status & PDF Receipt',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Check Booking Progress',
                    style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
                const SizedBox(height: 4),
                Text(
                    'Enter your Booking Reference ID or WhatsApp Phone Number to check status and download PDF invoices.',
                    style: AppTextStyles.bodySecondary),
                const SizedBox(height: 16),

                // Search Bar
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onSubmitted: (_) => _searchBooking(),
                        decoration: InputDecoration(
                          hintText: 'Enter Booking ID (e.g. BK-2026-001) or Phone',
                          filled: true,
                          fillColor: Colors.white,
                          border: const OutlineInputBorder(),
                          suffixIcon: _isSearching
                              ? const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: AppColors.roseGold),
                                )
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    CustomButton(
                      label: 'Search',
                      icon: Icons.search,
                      onPressed: _searchBooking,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                if (_isSearching)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40.0),
                      child: CircularProgressIndicator(color: AppColors.roseGold),
                    ),
                  )
                else if (_notFound)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.search_off, size: 48, color: Colors.red.shade400),
                        const SizedBox(height: 12),
                        Text(
                          'No Booking Found for "${_searchController.text}"',
                          style: AppTextStyles.headingTitle.copyWith(fontSize: 16),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Please verify your booking reference ID (e.g. BK-...) or the 10-digit WhatsApp number used while booking.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.black54),
                        ),
                      ],
                    ),
                  )
                else
                  _buildBookingStatusCard(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingStatusCard(BuildContext context) {
    final b = _currentBooking ?? _fallbackBooking;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Ref: ${b.id}', style: AppTextStyles.sectionHeader),
              StatusBadge(status: b.status),
            ],
          ),
          const Divider(height: 24, color: AppColors.lightBorder),
          Text('Client: ${b.customer.fullName}',
              style: AppTextStyles.bodyPrimary.copyWith(fontWeight: FontWeight.bold)),
          Text('Service: ${b.serviceTitle}', style: AppTextStyles.bodySecondary),
          Text(
              'Date: ${AppFormatters.formatDate(b.event.eventDate)} @ ${b.event.readyByTime}',
              style: AppTextStyles.bodySecondary),
          Text('Venue: ${b.event.venueLocation} (${b.event.city})',
              style: AppTextStyles.bodySecondary),
          const SizedBox(height: 16),

          // Commercial Summary
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.champagne,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Grand Total Quote:'),
                    Text(AppFormatters.formatCurrency(b.commercials.totalPrice),
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Advance Deposit Paid:'),
                    Text(
                        AppFormatters.formatCurrency(
                            b.commercials.depositPaid),
                        style: const TextStyle(
                            color: AppColors.emeraldGreen,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Actions with responsive layout
          LayoutBuilder(
            builder: (context, cardConstraints) {
              final isSmall = cardConstraints.maxWidth < 480;
              if (isSmall) {
                return Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: CustomButton(
                        label: 'Download PDF Invoice',
                        icon: Icons.picture_as_pdf,
                        onPressed: () => _generateAndPrintPdf(b),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          UpiQrPaymentDialog.show(
                            context,
                            amount: b.commercials.depositRequired > 0
                                ? b.commercials.depositRequired
                                : b.commercials.totalPrice,
                            bookingId: b.id,
                            serviceName: b.serviceTitle,
                          );
                        },
                        icon: const Icon(Icons.qr_code, color: Colors.white, size: 18),
                        label: const Text(
                          'Simulate UPI Payment',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.deepPlum,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }
              return Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      label: 'Download PDF Invoice',
                      icon: Icons.picture_as_pdf,
                      onPressed: () => _generateAndPrintPdf(b),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        UpiQrPaymentDialog.show(
                          context,
                          amount: b.commercials.depositRequired > 0
                              ? b.commercials.depositRequired
                              : b.commercials.totalPrice,
                          bookingId: b.id,
                          serviceName: b.serviceTitle,
                        );
                      },
                      icon: const Icon(Icons.qr_code, color: Colors.white, size: 18),
                      label: const Text(
                        'Simulate UPI Payment',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.deepPlum,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.notifications_active_outlined, color: AppColors.deepPlum),
              label: const Text(
                'Send Event Timing Push & WhatsApp Reminder',
                style: TextStyle(color: AppColors.deepPlum, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.roseGold),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
              onPressed: () => _showTimingReminderDialog(b),
            ),
          ),
        ],
      ),
    );
  }

  void _showTimingReminderDialog(BookingEntity booking) {
    final info = FirebaseMessagingService.computeTimingInfo(
      eventDate: booking.event.eventDate,
      readyByTime: booking.event.readyByTime,
      customerName: booking.customer.fullName,
      venue: booking.event.venueLocation,
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
                'Event Timing Reminder',
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
                      'Sends instant FCM Push Notification to customer device + WhatsApp automated notification.',
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
                bookingId: booking.id,
                customerName: booking.customer.fullName,
                customerPhone: booking.customer.phone,
                eventDate: booking.event.eventDate,
                readyByTime: booking.event.readyByTime,
                venue: booking.event.venueLocation,
              );
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Timing reminder sent to ${booking.customer.fullName}! (${res['timingType']})',
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

  Future<void> _generateAndPrintPdf(BookingEntity booking) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Padding(
            padding: const pw.EdgeInsets.all(24),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('MAKEOVERS BY PRACHI',
                    style: pw.TextStyle(
                        fontSize: 24, fontWeight: pw.FontWeight.bold)),
                pw.Text(
                    'Luxury Bridal & Occasion Artistry • Jodhpur, Rajasthan',
                    style: const pw.TextStyle(fontSize: 12)),
                pw.Divider(),
                pw.SizedBox(height: 16),
                pw.Text('OFFICIAL BOOKING INVOICE & RECEIPT',
                    style: pw.TextStyle(
                        fontSize: 16, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 8),
                pw.Text('Booking Reference: ${booking.id}'),
                pw.Text('Customer Name: ${booking.customer.fullName}'),
                pw.Text('WhatsApp Phone: ${booking.customer.phone}'),
                pw.Text(
                    'Event Date: ${AppFormatters.formatDate(booking.event.eventDate)}'),
                pw.Text('Venue: ${booking.event.venueLocation}'),
                pw.SizedBox(height: 16),
                pw.TableHelper.fromTextArray(
                  headers: ['Description', 'Amount (INR)'],
                  data: [
                    [
                      booking.serviceTitle,
                      AppFormatters.formatCurrency(
                          booking.commercials.basePrice)
                    ],
                    [
                      'Travel & Outstation Fee',
                      AppFormatters.formatCurrency(
                          booking.commercials.travelFee)
                    ],
                    [
                      'Advance Deposit Paid',
                      AppFormatters.formatCurrency(
                          booking.commercials.depositPaid)
                    ],
                    [
                      'Remaining Balance Due on Event Day',
                      AppFormatters.formatCurrency(
                          booking.commercials.remainingBalance)
                    ],
                  ],
                ),
                pw.SizedBox(height: 24),
                pw.Text(
                    'Thank you for choosing Makeovers by Prachi for your wedding day! 💕',
                    style: pw.TextStyle(
                        fontSize: 12, fontStyle: pw.FontStyle.italic)),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }
}
