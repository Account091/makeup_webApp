import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/admin/admin_repositories.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../common/widgets/admin_widgets.dart';
import 'booking_actions.dart';

/// Opens a live detail view for [bookingId]: a side panel on wide screens,
/// a full-height bottom sheet on phones. Reads repositories from the
/// caller's context (modal routes sit above the shell's providers).
Future<void> showBookingDetailSheet(BuildContext context, String bookingId) {
  final repos = context.read<AdminRepositories>();
  final session = context.read<AdminSession>();
  return showAdaptivePanel<void>(
    context,
    width: 560,
    builder: (ctx) => BookingDetailView(
      bookingId: bookingId,
      repos: repos,
      session: session,
      showClose: true,
    ),
  );
}

class BookingDetailView extends StatelessWidget {
  final String bookingId;
  final AdminRepositories repos;
  final AdminSession session;
  final ScrollController? scrollController;
  final bool showClose;

  const BookingDetailView({
    super.key,
    required this.bookingId,
    required this.repos,
    required this.session,
    this.scrollController,
    this.showClose = false,
  });

  @override
  Widget build(BuildContext context) {
    return LiveStreamBuilder<BookingEntity?>(
      streamKey: bookingId,
      create: () => repos.bookings.watchOne(bookingId),
      loading: (_) => const SkeletonList(count: 4, itemHeight: 110),
      builder: (context, b) {
        if (b == null) {
          return EmptyView(
            icon: Icons.search_off,
            message: 'Booking $bookingId not found.',
          );
        }
        return _content(context, b);
      },
    );
  }

  Widget _content(BuildContext context, BookingEntity b) {
    final theme = Theme.of(context);
    final c = b.commercials;
    final p = b.payment;
    final balance = c.totalAmount - c.depositPaid;
    final paidFraction = c.totalAmount <= 0
        ? 0.0
        : (c.depositPaid / c.totalAmount).clamp(0.0, 1.0);

    final primary = <Widget>[
      if (b.status == BookingStatus.paymentProofSubmitted) ...[
        Expanded(
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.error,
            ),
            onPressed: () => rejectPaymentFlow(context, repos, b),
            icon: const Icon(Icons.block_rounded, size: 18),
            label: const Text('Reject'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: FilledButton.icon(
            onPressed: () => approvePaymentFlow(context, repos, session, b),
            icon: const Icon(Icons.verified_rounded, size: 18),
            label: const Text('Approve payment'),
          ),
        ),
      ],
      if (b.status == BookingStatus.confirmed) ...[
        Expanded(
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.error,
            ),
            onPressed: () => cancelBookingFlow(context, repos, b),
            icon: const Icon(Icons.event_busy_rounded, size: 18),
            label: const Text('Cancel'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: FilledButton.icon(
            onPressed: () => completeBookingFlow(context, repos, b),
            icon: const Icon(Icons.task_alt_rounded, size: 18),
            label: const Text('Mark completed'),
          ),
        ),
      ],
    ];

    final timeline = <(String, DateTime?, IconData, Color)>[
      (
        'Booking created',
        b.createdAt,
        Icons.add_circle_outline,
        StatusColors.depositPending,
      ),
      if (p.submittedAt != null)
        (
          'Payment proof submitted',
          p.submittedAt,
          Icons.receipt_long_rounded,
          StatusColors.awaitingVerification,
        ),
      if (p.verifiedAt != null)
        (
          'Payment verified${p.verifiedBy != null ? ' by ${p.verifiedBy}' : ''}',
          p.verifiedAt,
          Icons.verified_rounded,
          StatusColors.confirmed,
        ),
      if (b.confirmedAt != null && p.verifiedAt == null)
        (
          'Confirmed',
          b.confirmedAt,
          Icons.verified_rounded,
          StatusColors.confirmed,
        ),
      if (b.cancelledAt != null)
        (
          'Cancelled',
          b.cancelledAt,
          Icons.cancel_outlined,
          StatusColors.cancelled,
        ),
      if (b.status == BookingStatus.paymentRejected)
        (
          'Payment rejected',
          b.updatedAt,
          Icons.block_rounded,
          StatusColors.rejected,
        ),
      if (b.status == BookingStatus.completed)
        (
          'Completed',
          b.updatedAt,
          Icons.task_alt_rounded,
          StatusColors.completed,
        ),
      if (b.status == BookingStatus.depositPending && b.expiresAt != null)
        (
          b.isUnpaidExpired() ? 'Hold lapsed' : 'Hold expires',
          b.expiresAt,
          Icons.hourglass_bottom_rounded,
          StatusColors.expired,
        ),
    ];

    return ListView(
      controller: scrollController,
      padding: EdgeInsets.fromLTRB(20, showClose ? 12 : 0, 20, 32),
      children: [
        if (showClose)
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              tooltip: 'Close',
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.close_rounded),
            ),
          ),
        // ---- header
        Row(
          children: [
            InitialsAvatar(name: b.customer.fullName, size: 56),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(displayName(b), style: AppTheme.serif(size: 24)),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      StatusChip.forBooking(b),
                      InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: () =>
                            copyToClipboard(context, b.id, label: 'Booking ID'),
                        child: MetaChip(icon: Icons.tag_rounded, label: b.id),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (b.customer.phone.isNotEmpty)
          Row(
            children: [
              _ContactButton(
                icon: Icons.call_rounded,
                label: 'Call',
                onTap: () => callCustomer(context, b.customer.phone),
              ),
              const SizedBox(width: 8),
              _ContactButton(
                icon: Icons.chat_rounded,
                label: 'WhatsApp',
                color: const Color(0xFF1F8F5F),
                onTap: () => whatsappCustomer(context, b),
              ),
              const SizedBox(width: 8),
              _ContactButton(
                icon: Icons.copy_rounded,
                label: 'Copy phone',
                onTap: () =>
                    copyToClipboard(context, b.customer.phone, label: 'Phone'),
              ),
            ],
          ),
        if (primary.isNotEmpty) ...[
          const SizedBox(height: 12),
          Row(children: primary),
        ],
        if (b.status == BookingStatus.paymentRejected &&
            p.rejectionReason != null) ...[
          const SizedBox(height: 12),
          _Banner(
            color: StatusColors.rejected,
            icon: Icons.info_outline_rounded,
            text: 'Rejected: ${p.rejectionReason}',
          ),
        ],
        const SizedBox(height: 16),
        DetailSection(
          title: 'Event',
          icon: Icons.celebration_outlined,
          children: [
            InfoRow('Service', b.serviceTitle),
            if (b.packageName != null) InfoRow('Package', b.packageName!),
            if (b.event.eventType.isNotEmpty &&
                b.event.eventType != b.serviceTitle)
              InfoRow('Event type', b.event.eventType),
            InfoRow(
              'Date',
              b.event.hasValidDate
                  ? '${formatDateKey(b.event.dateKey)} · ${relativeDayLabel(b.event.dateKey)}'
                  : b.event.dateKey,
            ),
            InfoRow('Ready by', formatReadyTime(b.event.readyByTime)),
            InfoRow('Venue', b.event.venueLocation),
            InfoRow('City', b.event.city),
            InfoRow('Guests', '${b.event.guestCount}'),
            if (b.notes != null && b.notes!.isNotEmpty)
              InfoRow('Client notes', b.notes!),
          ],
        ),
        const SizedBox(height: 12),
        DetailSection(
          title: 'Payment',
          icon: Icons.account_balance_wallet_outlined,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(0, 6, 8, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatInr(c.depositPaid),
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 6, bottom: 2),
                        child: Text(
                          'paid of ${formatInr(c.totalAmount)}',
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: paidFraction),
                      duration: motion(
                        context,
                        const Duration(milliseconds: 700),
                      ),
                      curve: Curves.easeOutCubic,
                      builder: (_, v, _) => LinearProgressIndicator(
                        value: v,
                        minHeight: 8,
                        color: BrandColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            InfoRow('Base price', formatInr(c.basePrice)),
            InfoRow('Travel fee', formatInr(c.travelFee)),
            InfoRow('Total', formatInr(c.totalAmount), emphasize: true),
            InfoRow('Deposit required', formatInr(c.depositRequired)),
            InfoRow('Balance due', formatInr(balance), emphasize: true),
            const Divider(height: 20),
            InfoRow('Payment status', paymentStatusLabel(p.status)),
            InfoRow('UTR', p.utrNumber ?? '', copyable: true),
            InfoRow('Paid to', '${p.upiId}  ${p.payeeName}'.trim()),
            if (p.verifiedBy != null) InfoRow('Verified by', p.verifiedBy!),
            if (p.proofPath != null) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.only(right: 8, bottom: 6),
                child: PaymentProofImage(
                  proofPath: p.proofPath,
                  resolveUrl: repos.proofDownloadUrl,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 12),
        DetailSection(
          title: 'Client',
          icon: Icons.person_outline_rounded,
          children: [
            InfoRow('Name', b.customer.fullName),
            InfoRow('Phone', b.customer.phone, copyable: true),
            InfoRow('Email', b.customer.email, copyable: true),
            if (b.customer.instagramHandle != null)
              InfoRow('Instagram', b.customer.instagramHandle!),
          ],
        ),
        const SizedBox(height: 12),
        DetailSection(
          title: 'Timeline',
          icon: Icons.timeline_rounded,
          children: [
            const SizedBox(height: 6),
            for (var i = 0; i < timeline.length; i++)
              _TimelineRow(
                title: timeline[i].$1,
                at: timeline[i].$2,
                icon: timeline[i].$3,
                color: timeline[i].$4,
                last: i == timeline.length - 1,
              ),
            if (b.status == null) InfoRow('Status (raw)', b.rawStatus),
          ],
        ),
      ],
    );
  }
}

class _ContactButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color color;
  const _ContactButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color = BrandColors.plum,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Semantics(
        button: true,
        label: label,
        excludeSemantics: true,
        onTap: onTap,
        child: Material(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () {
              tapHaptic();
              onTap();
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Column(
                children: [
                  Icon(icon, color: color, size: 20),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String text;
  const _Banner({required this.color, required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: color.withValues(alpha: 0.25)),
    ),
    child: Row(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: color),
          ),
        ),
      ],
    ),
  );
}

class _TimelineRow extends StatelessWidget {
  final String title;
  final DateTime? at;
  final IconData icon;
  final Color color;
  final bool last;
  const _TimelineRow({
    required this.title,
    required this.at,
    required this.icon,
    required this.color,
    required this.last,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 15, color: color),
              ),
              if (!last)
                Expanded(
                  child: Container(width: 1.5, color: BrandColors.outline),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 4 : 14, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: theme.textTheme.titleSmall),
                  Text(formatDateTime(at), style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
