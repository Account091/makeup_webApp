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
            icon: const Icon(Icons.search, color: AppColors.roseGold),
            tooltip: 'Search Platform',
            onPressed: () => _showGlobalSearchModal(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.roseGold),
            tooltip: 'Refresh Data',
            onPressed: () {
              context.read<BookingBloc>().add(FetchBookingsEvent());
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined, color: AppColors.roseGold),
            tooltip: 'Notification Center',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationCenterScreen(),
                ),
              );
            },
          ),
          PopupMenuButton<WidgetBuilder>(
            icon: const Icon(Icons.more_vert, color: AppColors.roseGold),
            tooltip: 'Admin Operations Modules',
            color: AppColors.deepPlum,
            onSelected: (builder) {
              Navigator.push(context, MaterialPageRoute(builder: builder));
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: (c) => const CustomerExperienceIntelligenceScreen(),
                child: const ListTile(
                  leading: Icon(Icons.reviews, color: AppColors.roseGold),
                  title: Text('CSAT & NPS Intelligence', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const ArtistPerformanceScorecardScreen(),
                child: const ListTile(
                  leading: Icon(Icons.leaderboard, color: AppColors.roseGold),
                  title: Text('Artist Performance Scorecard', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const DailyOperationsCommandScreen(),
                child: const ListTile(
                  leading: Icon(Icons.wb_sunny, color: AppColors.roseGold),
                  title: Text('Morning Operations Command', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const UnifiedCustomerInboxScreen(),
                child: const ListTile(
                  leading: Icon(Icons.mark_unread_chat_alt, color: AppColors.roseGold),
                  title: Text('Unified 360 Customer Inbox', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const ConsultationSchedulerScreen(),
                child: const ListTile(
                  leading: Icon(Icons.calendar_month, color: AppColors.roseGold),
                  title: Text('Consultation Scheduler', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const EventMediaCaptureScreen(),
                child: const ListTile(
                  leading: Icon(Icons.camera_alt, color: AppColors.roseGold),
                  title: Text('Event Media Capture & Consent', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const BookingRescheduleWaitlistScreen(),
                child: const ListTile(
                  leading: Icon(Icons.edit_calendar, color: AppColors.roseGold),
                  title: Text('Reschedule & Waitlist Engine', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const EventDayModeScreen(),
                child: const ListTile(
                  leading: Icon(Icons.event_seat, color: AppColors.roseGold),
                  title: Text('Event-Day Execution Console', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const BridalTrialScreen(),
                child: const ListTile(
                  leading: Icon(Icons.brush, color: AppColors.roseGold),
                  title: Text('Bridal Trial & Consultation', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const SupportHelpDeskScreen(),
                child: const ListTile(
                  leading: Icon(Icons.headset_mic, color: AppColors.roseGold),
                  title: Text('Support & Help Desk', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const UniversalAuditCenterScreen(),
                child: const ListTile(
                  leading: Icon(Icons.history_edu, color: AppColors.roseGold),
                  title: Text('Universal Audit Center', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const ProductionCertificationScreen(),
                child: const ListTile(
                  leading: Icon(Icons.verified, color: AppColors.roseGold),
                  title: Text('Production Certification Gate', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const SystemHealthScreen(),
                child: const ListTile(
                  leading: Icon(Icons.health_and_safety, color: AppColors.roseGold),
                  title: Text('Platform System Health', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const MarketplaceManagementScreen(),
                child: const ListTile(
                  leading: Icon(Icons.storefront, color: AppColors.roseGold),
                  title: Text('Beauty Marketplace Scale', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const LocationManagementScreen(),
                child: const ListTile(
                  leading: Icon(Icons.location_city, color: AppColors.roseGold),
                  title: Text('Multi-City Location Management', style: TextStyle(color: Colors.white)),
                ),
              ),
              PopupMenuItem(
                value: (c) => const BusinessIntelligenceDashboardScreen(),
                child: const ListTile(
                  leading: Icon(Icons.analytics_outlined, color: AppColors.roseGold),
                  title: Text('BI & Revenue Forecasts', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
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

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1280),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Adaptive KPI Cards
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final isCompact = constraints.maxWidth < 620;
                        if (isCompact) {
                          return Column(
                            children: [
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
                                ],
                              ),
                              const SizedBox(height: 10),
                              _buildKpiCard(
                                'Confirmed Bookings',
                                confirmedCount.toString(),
                                Icons.event_available,
                                AppColors.statusConfirmed,
                              ),
                            ],
                          );
                        }
                        return Row(
                          children: [
                            Expanded(
                              child: _buildKpiCard(
                                'Awaiting Approval',
                                awaitingApprovalCount.toString(),
                                Icons.hourglass_top,
                                AppColors.statusAwaitingApproval,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildKpiCard(
                                'Deposit Pending',
                                depositPendingCount.toString(),
                                Icons.payments_outlined,
                                AppColors.statusDepositPending,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildKpiCard(
                                'Confirmed Bookings',
                                confirmedCount.toString(),
                                Icons.event_available,
                                AppColors.statusConfirmed,
                              ),
                            ),
                          ],
                        );
                      },
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
              ),
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
            style: AppTextStyles.bodySecondary.copyWith(fontSize: 11),
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
            // Header Row: Customer Name & Status with overflow guard
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: AppColors.softRose,
                        child: Text(
                          booking.customer.fullName.isNotEmpty
                              ? booking.customer.fullName[0].toUpperCase()
                              : 'C',
                          style: AppTextStyles.sectionHeader
                              .copyWith(color: AppColors.deepPlum),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              booking.customer.fullName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.sectionHeader,
                            ),
                            Text(
                              booking.customer.phone,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodySecondary,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
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
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodyPrimary
                        .copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 16,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.calendar_today,
                        color: AppColors.mutedGray, size: 15),
                    const SizedBox(width: 5),
                    Text(
                      AppFormatters.formatDate(booking.event.eventDate),
                      style: AppTextStyles.bodySecondary,
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.access_time,
                        color: AppColors.mutedGray, size: 15),
                    const SizedBox(width: 5),
                    Text(
                      'Ready by ${booking.event.readyByTime}',
                      style: AppTextStyles.bodySecondary,
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on_outlined,
                        color: AppColors.mutedGray, size: 15),
                    const SizedBox(width: 5),
                    Text(
                      '${booking.event.venueLocation} (${booking.event.city})',
                      style: AppTextStyles.bodySecondary,
                    ),
                  ],
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
                  Expanded(
                    child: Column(
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
                  ),
                  Expanded(
                    child: Column(
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
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Action Buttons
            if (booking.status == BookingStatus.awaitingApproval)
              LayoutBuilder(
                builder: (context, cardConstraints) {
                  if (cardConstraints.maxWidth < 360) {
                    return Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: CustomButton(
                            label: 'Approve & Quote',
                            icon: Icons.check_circle_outline,
                            onPressed: () => _showApproveModal(context, booking),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: CustomButton(
                            label: 'Decline',
                            isSecondary: true,
                            icon: Icons.cancel_outlined,
                            onPressed: () => _showDeclineModal(context, booking),
                          ),
                        ),
                      ],
                    );
                  }
                  return Row(
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
                  );
                },
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
