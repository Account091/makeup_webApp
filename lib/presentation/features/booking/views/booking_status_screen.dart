import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../../common/widgets/status_badge.dart';
import '../../payment/views/upi_qr_payment_dialog.dart';

class BookingStatusScreen extends StatefulWidget {
  const BookingStatusScreen({super.key});

  @override
  State<BookingStatusScreen> createState() => _BookingStatusScreenState();
}

class _BookingStatusScreenState extends State<BookingStatusScreen> {
  final _searchController = TextEditingController(text: 'BK-2026-001');

  // Sample retrieved booking
  final BookingEntity _retrievedBooking = BookingEntity(
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
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
                    decoration: const InputDecoration(
                      hintText: 'Enter Booking ID (e.g. BK-2026-001)',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                CustomButton(
                  label: 'Search',
                  icon: Icons.search,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Booking Record Synced!')),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

            _buildBookingStatusCard(context),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingStatusCard(BuildContext context) {
    final b = _retrievedBooking;
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

          // Actions
          Row(
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
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Pay via UPI QR'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.deepPlum,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
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
