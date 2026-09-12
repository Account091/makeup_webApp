import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../../common/widgets/status_badge.dart';
import '../../booking/bloc/booking_bloc.dart';
import '../../booking/bloc/booking_event.dart';
import '../../booking/bloc/booking_state.dart';

import '../../analytics/views/business_intelligence_dashboard_screen.dart';
import '../../analytics/views/customer_experience_intelligence_screen.dart';
import '../../booking/views/booking_reschedule_waitlist_screen.dart';
import '../../booking/views/event_day_mode_screen.dart';
import '../../bridal_planner/views/bridal_trial_screen.dart';
import '../../calendar/views/consultation_scheduler_screen.dart';
import '../../content/views/event_media_capture_screen.dart';
import '../../crm/views/support_help_desk_screen.dart';
import '../../crm/views/unified_customer_inbox_screen.dart';
import '../../dashboard/views/daily_operations_command_screen.dart';
import '../../locations/views/location_management_screen.dart';
import '../../marketplace/views/marketplace_management_screen.dart';
import '../../system/views/notification_center_screen.dart';
import '../../system/views/production_certification_screen.dart';
import '../../system/views/system_health_screen.dart';
import '../../system/views/universal_audit_center_screen.dart';
import '../../team/views/artist_performance_scorecard_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  void _showGlobalSearchModal(BuildContext context) {
    final searchController = TextEditingController();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalContext) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Global Platform Search', style: AppTextStyles.headingTitle),
              const SizedBox(height: 12),
              TextField(
                controller: searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search Priya, Booking #, Product, Lead...',
                  prefixIcon: Icon(Icons.search, color: AppColors.roseGold),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.deepPlum),
                  icon: const Icon(Icons.search, color: Colors.white),
                  label: const Text('SEARCH PLATFORM', style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    Navigator.pop(modalContext);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('🔍 Searching records for "${searchController.text}"...'),
                        backgroundColor: AppColors.deepPlum,
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Makeovers by Prachi',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'Admin Control Center (V10.2 Customer Intelligence Ready)',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.reviews, color: AppColors.roseGold),
            tooltip: 'V10.2 Customer Experience CSAT & NPS Intelligence',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const CustomerExperienceIntelligenceScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.leaderboard, color: AppColors.roseGold),
            tooltip: 'V10.2 Artist Performance & Quality Scorecard',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ArtistPerformanceScorecardScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.wb_sunny, color: AppColors.roseGold),
            tooltip: 'V10.1 Morning Operations Command Dashboard',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const DailyOperationsCommandScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.mark_unread_chat_alt, color: AppColors.roseGold),
            tooltip: 'V10.1 Unified Customer 360 Conversation Stream',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const UnifiedCustomerInboxScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.calendar_month, color: AppColors.roseGold),
            tooltip: 'V10.1 Universal Consultation Scheduler',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ConsultationSchedulerScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.camera_alt, color: AppColors.roseGold),
            tooltip: 'V10.1 Event Media Capture & Consent Engine',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EventMediaCaptureScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.edit_calendar, color: AppColors.roseGold),
            tooltip: 'V10.1 Reschedule & Date Waitlist Engine',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const BookingRescheduleWaitlistScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.search, color: AppColors.roseGold),
            tooltip: 'V10.0 Global Multi-Entity Search',
            onPressed: () => _showGlobalSearchModal(context),
          ),
          IconButton(
            icon: const Icon(Icons.event_seat, color: AppColors.roseGold),
            tooltip: 'V10.0 Event-Day Execution Console',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EventDayModeScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.brush, color: AppColors.roseGold),
            tooltip: 'V10.0 Bridal Trial & Consultation Engine',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const BridalTrialScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.headset_mic, color: AppColors.roseGold),
            tooltip: 'V10.0 Support & Help Desk Tickets',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SupportHelpDeskScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.history_edu, color: AppColors.roseGold),
            tooltip: 'V10.0 Universal Platform Audit Center',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const UniversalAuditCenterScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.verified, color: AppColors.roseGold),
            tooltip: 'V9.7 Production Certification Gate',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const ProductionCertificationScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.health_and_safety, color: AppColors.roseGold),
            tooltip: 'V9.0 Platform Reliability & Observability',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const SystemHealthScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.storefront, color: AppColors.roseGold),
            tooltip: 'V8.0 Beauty Marketplace Scale',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const MarketplaceManagementScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.location_city, color: AppColors.roseGold),
            tooltip: 'V7.0 Multi-City & Destination Weddings',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const LocationManagementScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.analytics_outlined, color: AppColors.roseGold),
            tooltip: 'V6.0 Business Intelligence & Forecasts',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const BusinessIntelligenceDashboardScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.roseGold),
            onPressed: () {
              context.read<BookingBloc>().add(FetchBookingsEvent());
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined,
                color: AppColors.roseGold),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationCenterScreen(),
                ),
              );
            },
          ),
        ],
      ),





      body: BlocConsumer<BookingBloc, BookingState>(
        listener: (context, state) {
          if (state is BookingOperationSuccessState) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.emeraldGreen,
              ),
            );
          } else if (state is BookingErrorState) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage),
                backgroundColor: AppColors.statusDeclined,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is BookingLoadingState && state is! BookingsLoadedState) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.roseGold),
            );
          }

          List<BookingEntity> bookings = [];
          if (state is BookingsLoadedState) {
            bookings = state.bookings;
          }

          final awaitingApprovalCount = bookings
              .where((b) => b.status == BookingStatus.awaitingApproval)
              .length;
          final depositPendingCount = bookings
              .where((b) => b.status == BookingStatus.depositPending)
              .length;
          final confirmedCount = bookings
              .where((b) => b.status == BookingStatus.confirmed)
              .length;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. KPI Cards Row
                Row(
                  children: [
                    Expanded(
                      child: _buildKpiCard(
                        'Awaiting Approval',
                        awaitingApprovalCount.toString(),
                        Icons.hourglass_top,
                        AppColors.statusAwaitingApproval,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildKpiCard(
                        'Deposit Pending',
                        depositPendingCount.toString(),
                        Icons.payments_outlined,
                        AppColors.statusDepositPending,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildKpiCard(
                        'Confirmed',
                        confirmedCount.toString(),
                        Icons.event_available,
                        AppColors.statusConfirmed,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 2. Section Header & New Inquiries
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Booking Inquiries Pipeline',
                      style: AppTextStyles.headingTitle.copyWith(fontSize: 18),
                    ),
                    Chip(
                      backgroundColor: AppColors.softRose.withValues(alpha: 0.5),
                      label: Text(
                        '${bookings.length} Total',
                        style: AppTextStyles.bodySecondary.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.deepPlum,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (bookings.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(
                        'No booking inquiries found.',
                        style: AppTextStyles.bodySecondary,
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: bookings.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final booking = bookings[index];
                      return _buildBookingCard(context, booking);
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildKpiCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.headingTitle.copyWith(
              fontSize: 22,
              color: AppColors.deepPlum,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySecondary.copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, BookingEntity booking) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row: Customer Name & Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppColors.softRose,
                      child: Text(
                        booking.customer.fullName[0].toUpperCase(),
                        style: AppTextStyles.sectionHeader
                            .copyWith(color: AppColors.deepPlum),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.customer.fullName,
                          style: AppTextStyles.sectionHeader,
                        ),
                        Text(
                          booking.customer.phone,
                          style: AppTextStyles.bodySecondary,
                        ),
                      ],
                    ),
                  ],
                ),
                StatusBadge(status: booking.status),
              ],
            ),
            const Divider(height: 24, color: AppColors.lightBorder),

            // Service & Event Details
            Row(
              children: [
                const Icon(Icons.star, color: AppColors.roseGold, size: 18),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    booking.serviceTitle,
                    style: AppTextStyles.bodyPrimary
                        .copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.calendar_today,
                    color: AppColors.mutedGray, size: 16),
                const SizedBox(width: 6),
                Text(
                  AppFormatters.formatDate(booking.event.eventDate),
                  style: AppTextStyles.bodySecondary,
                ),
                const SizedBox(width: 16),
                const Icon(Icons.access_time,
                    color: AppColors.mutedGray, size: 16),
                const SizedBox(width: 6),
                Text(
                  'Ready by ${booking.event.readyByTime}',
                  style: AppTextStyles.bodySecondary,
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    color: AppColors.mutedGray, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${booking.event.venueLocation} (${booking.event.city})',
                    style: AppTextStyles.bodySecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Pricing Row
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.champagne,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Quote', style: AppTextStyles.bodySecondary),
                      Text(
                        AppFormatters.formatCurrency(
                            booking.commercials.totalPrice),
                        style: AppTextStyles.sectionHeader
                            .copyWith(color: AppColors.deepPlum),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Advance Deposit', style: AppTextStyles.bodySecondary),
                      Text(
                        AppFormatters.formatCurrency(
                            booking.commercials.depositRequired),
                        style: AppTextStyles.sectionHeader
                            .copyWith(color: AppColors.roseGold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Action Buttons
            if (booking.status == BookingStatus.awaitingApproval)
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      label: 'Approve & Quote',
                      icon: Icons.check_circle_outline,
                      onPressed: () => _showApproveModal(context, booking),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: CustomButton(
                      label: 'Decline',
                      isSecondary: true,
                      icon: Icons.cancel_outlined,
                      onPressed: () => _showDeclineModal(context, booking),
                    ),
                  ),
                ],
              )
            else
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.chat_bubble_outline,
                        size: 18, color: AppColors.roseGold),
                    label: const Text('WhatsApp Client',
                        style: TextStyle(color: AppColors.roseGold)),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  void _showApproveModal(BuildContext context, BookingEntity booking) {
    final quoteController = TextEditingController(
        text: booking.commercials.basePrice.toStringAsFixed(0));
    final travelFeeController = TextEditingController(
        text: booking.commercials.travelFee.toStringAsFixed(0));
    final depositController = TextEditingController(
        text: booking.commercials.depositRequired.toStringAsFixed(0));
    final notesController = TextEditingController(text: booking.notes ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Approve Inquiry & Send Quote',
                style: AppTextStyles.headingTitle,
              ),
              const SizedBox(height: 6),
              Text(
                'Client: ${booking.customer.fullName} (${booking.event.eventType})',
                style: AppTextStyles.bodySecondary,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: quoteController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Base Service Quote (₹)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: travelFeeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Travel & Outstation Fee (₹)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: depositController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Advance Deposit Required (₹)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Client Note / Preparation Instructions',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: CustomButton(
                  label: 'Confirm Approval & Generate Link',
                  icon: Icons.send,
                  onPressed: () {
                    final quote =
                        double.tryParse(quoteController.text) ?? 15000;
                    final travel =
                        double.tryParse(travelFeeController.text) ?? 0;
                    final deposit =
                        double.tryParse(depositController.text) ?? 5000;

                    context.read<BookingBloc>().add(
                          ApproveBookingEvent(
                            bookingId: booking.id,
                            quoteAmount: quote,
                            travelFee: travel,
                            depositRequired: deposit,
                            notes: notesController.text,
                          ),
                        );
                    Navigator.pop(modalContext);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showDeclineModal(BuildContext context, BookingEntity booking) {
    final reasonController = TextEditingController(text: 'Date unavailable');

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Decline Booking Inquiry',
                style: AppTextStyles.headingTitle
                    .copyWith(color: AppColors.statusDeclined),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(
                  labelText: 'Reason for declining',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: CustomButton(
                  label: 'Decline Inquiry',
                  isSecondary: true,
                  onPressed: () {
                    context.read<BookingBloc>().add(
                          DeclineBookingEvent(
                            bookingId: booking.id,
                            reason: reasonController.text,
                          ),
                        );
                    Navigator.pop(modalContext);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
