import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../../domain/services/dashboard_stats.dart';
import '../../../common/widgets/admin_widgets.dart';
import '../../bookings/booking_detail_sheet.dart';
import '../../calendar/views/calendar_screen.dart';
import '../../services/views/admin_services_screen.dart';

/// Public booking page shared with clients ("Share booking link").
const kWebsiteBaseUrl = String.fromEnvironment(
  'WEBSITE_URL',
  defaultValue: 'https://makeoversbyprachi.com',
);
const kBookingLink = '$kWebsiteBaseUrl/book';

class AdminDashboardScreen extends StatefulWidget {
  final VoidCallback? onOpenPayments;
  final VoidCallback? onOpenBookings;
  final VoidCallback? onOpenCalendar;

  const AdminDashboardScreen({
    super.key,
    this.onOpenPayments,
    this.onOpenBookings,
    this.onOpenCalendar,
  });

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  Timer? _tick;

  @override
  void initState() {
    super.initState();
    // Keeps "expires in N min" countdowns fresh.
    _tick = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tick?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    return LiveStreamBuilder<List<BookingEntity>>(
      create: repos.bookings.watchAll,
      loading: (_) => const _DashboardSkeleton(),
      builder: (context, bookings) => _content(context, bookings),
    );
  }

  Widget _content(BuildContext context, List<BookingEntity> bookings) {
    final now = DateTime.now();
    final stats = computeDashboardStats(bookings, now: now);
    final awaiting =
        bookings
            .where((b) => b.status == BookingStatus.paymentProofSubmitted)
            .toList()
          ..sort(
            (a, b) => (a.payment.submittedAt ?? DateTime(0)).compareTo(
              b.payment.submittedAt ?? DateTime(0),
            ),
          );
    final holds =
        bookings
            .where(
              (b) =>
                  b.status == BookingStatus.depositPending &&
                  !b.isUnpaidExpired(now) &&
                  b.expiresAt != null,
            )
            .toList()
          ..sort((a, b) => a.expiresAt!.compareTo(b.expiresAt!));
    final session = context.read<AdminSession>();

    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth >= 980;
        final pad = c.maxWidth >= 600 ? 28.0 : 16.0;

        final hero = FadeSlideIn(
          child: _Hero(
            name: session.firstName,
            awaiting: awaiting.length,
            holds: holds.length,
            upcoming: stats.upcoming.length,
            onReview: widget.onOpenPayments,
          ),
        );
        final kpis = FadeSlideIn(
          index: 1,
          child: _KpiGrid(
            stats: stats,
            columns: c.maxWidth >= 720 ? 4 : 2,
            onOpenPayments: widget.onOpenPayments,
            onOpenBookings: widget.onOpenBookings,
          ),
        );
        final attention = FadeSlideIn(
          index: 2,
          child: _Attention(
            awaiting: awaiting,
            holds: holds,
            now: now,
            onReview: widget.onOpenPayments,
          ),
        );
        final actions = FadeSlideIn(
          index: 3,
          child: _QuickActions(onOpenCalendar: widget.onOpenCalendar),
        );
        final nextUp = FadeSlideIn(
          index: 4,
          child: _NextUp(
            upcoming: stats.upcoming.take(6).toList(),
            onSeeAll: widget.onOpenCalendar,
          ),
        );

        return RefreshIndicator(
          color: BrandColors.plum,
          onRefresh: () => Future.delayed(const Duration(milliseconds: 600)),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(pad, 8, pad, 32),
            children: [
              Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1240),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      hero,
                      const SizedBox(height: 16),
                      kpis,
                      if (wide)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 7,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [attention, nextUp],
                              ),
                            ),
                            const SizedBox(width: 24),
                            Expanded(flex: 4, child: actions),
                          ],
                        )
                      else ...[
                        attention,
                        actions,
                        nextUp,
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

String _greeting(DateTime now) {
  final h = now.hour;
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

class _Hero extends StatelessWidget {
  final String name;
  final int awaiting;
  final int holds;
  final int upcoming;
  final VoidCallback? onReview;
  const _Hero({
    required this.name,
    required this.awaiting,
    required this.holds,
    required this.upcoming,
    this.onReview,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final parts = <String>[
      if (awaiting > 0)
        '$awaiting payment${awaiting == 1 ? '' : 's'} to verify',
      if (holds > 0) '$holds active hold${holds == 1 ? '' : 's'}',
    ];
    final summary = parts.isEmpty
        ? (upcoming > 0
              ? 'All caught up. $upcoming confirmed event${upcoming == 1 ? '' : 's'} ahead.'
              : 'All caught up — nothing needs you right now.')
        : 'You have ${parts.join(' and ')}.';
    final narrow = MediaQuery.sizeOf(context).width < 600;

    return Container(
      decoration: BoxDecoration(
        gradient: BrandColors.plumGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppShadows.lifted,
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Positioned(
            right: -40,
            top: -60,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: BrandColors.goldBright.withValues(alpha: 0.18),
                  width: 1.5,
                ),
              ),
            ),
          ),
          Positioned(
            right: 30,
            bottom: -90,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: BrandColors.goldBright.withValues(alpha: 0.07),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(narrow ? 20 : 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  DateFormat('EEEE, d MMMM').format(now).toUpperCase(),
                  style: const TextStyle(
                    color: BrandColors.goldBright,
                    fontSize: 11,
                    letterSpacing: 1.8,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${_greeting(now)}, $name',
                  style: AppTheme.serif(
                    size: narrow ? 26 : 32,
                    color: Colors.white,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  summary,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.78),
                    fontSize: 14.5,
                    height: 1.4,
                  ),
                ),
                if (awaiting > 0) ...[
                  const SizedBox(height: 18),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: BrandColors.goldBright,
                      foregroundColor: BrandColors.plumDeep,
                    ),
                    onPressed: onReview == null
                        ? null
                        : () {
                            tapHaptic();
                            onReview!();
                          },
                    icon: const Icon(Icons.verified_outlined, size: 18),
                    label: const Text('Review payments'),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiGrid extends StatelessWidget {
  final DashboardStats stats;
  final int columns;
  final VoidCallback? onOpenPayments;
  final VoidCallback? onOpenBookings;
  const _KpiGrid({
    required this.stats,
    required this.columns,
    this.onOpenPayments,
    this.onOpenBookings,
  });

  @override
  Widget build(BuildContext context) {
    final month = DateFormat('MMMM').format(DateTime.now());
    final tiles = [
      _Kpi(
        label: 'Awaiting verification',
        value: '${stats.awaitingVerification}',
        icon: Icons.receipt_long_rounded,
        color: StatusColors.awaitingVerification,
        hint: stats.awaitingVerification > 0 ? 'Tap to review' : 'All clear',
        onTap: onOpenPayments,
      ),
      _Kpi(
        label: 'Pending deposits',
        value: '${stats.pendingDeposits}',
        icon: Icons.hourglass_top_rounded,
        color: StatusColors.depositPending,
        hint: 'Active holds',
        onTap: onOpenBookings,
      ),
      _Kpi(
        label: 'Confirmed in $month',
        value: '${stats.confirmedThisMonth}',
        icon: Icons.event_available_rounded,
        color: StatusColors.confirmed,
        hint: 'Bookings',
      ),
      _Kpi(
        label: 'Deposits in $month',
        value: formatInr(stats.revenueThisMonth),
        icon: Icons.currency_rupee_rounded,
        color: BrandColors.gold,
        hint: 'Verified',
      ),
    ];
    return LayoutBuilder(
      builder: (context, c) {
        const gap = 12.0;
        final w = (c.maxWidth - gap * (columns - 1)) / columns;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [for (final t in tiles) SizedBox(width: w, child: t)],
        );
      },
    );
  }
}

class _Kpi extends StatelessWidget {
  final String label;
  final String value;
  final String hint;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  const _Kpi({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.hint,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      semanticLabel: '$label: $value',
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Colors.white, Color.lerp(Colors.white, color, 0.07)!],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconTile(icon: icon, color: color, size: 36, iconSize: 19),
              const Spacer(),
              if (onTap != null)
                const Icon(
                  Icons.arrow_outward_rounded,
                  size: 16,
                  color: BrandColors.muted,
                ),
            ],
          ),
          const SizedBox(height: 10),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.6, end: 1),
              duration: motion(context, const Duration(milliseconds: 500)),
              curve: Curves.easeOutBack,
              builder: (context, v, child) => Opacity(
                opacity: ((v - 0.6) / 0.4).clamp(0.0, 1.0),
                child: child,
              ),
              child: Text(
                value,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontFamily: theme.textTheme.titleLarge?.fontFamily,
                  fontWeight: FontWeight.w800,
                  fontSize: 26,
                  letterSpacing: -0.5,
                  color: BrandColors.plumInk,
                ),
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelMedium,
          ),
          Text(hint, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _Attention extends StatelessWidget {
  final List<BookingEntity> awaiting;
  final List<BookingEntity> holds;
  final DateTime now;
  final VoidCallback? onReview;
  const _Attention({
    required this.awaiting,
    required this.holds,
    required this.now,
    this.onReview,
  });

  @override
  Widget build(BuildContext context) {
    final empty = awaiting.isEmpty && holds.isEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(
          'Needs your attention',
          subtitle: empty ? null : 'Oldest first',
          actionLabel: awaiting.isNotEmpty ? 'Review all' : null,
          onAction: onReview,
        ),
        if (empty)
          const AppCard(
            shadow: false,
            child: EmptyState(
              compact: true,
              icon: Icons.spa_outlined,
              title: 'Nothing waiting on you',
              message: 'New payment proofs and expiring holds show up here.',
            ),
          )
        else
          AppCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                for (var i = 0; i < awaiting.length && i < 4; i++) ...[
                  if (i > 0) const Divider(indent: 72),
                  _AttentionRow(
                    booking: awaiting[i],
                    icon: Icons.receipt_long_rounded,
                    color: StatusColors.awaitingVerification,
                    title: displayName(awaiting[i]),
                    subtitle:
                        '${formatInr(awaiting[i].commercials.depositRequired)} deposit · ${timeAgo(awaiting[i].payment.submittedAt, now)}',
                    action: FilledButton(
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(0, 36),
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                      ),
                      onPressed: onReview,
                      child: const Text('Review'),
                    ),
                  ),
                ],
                if (awaiting.length > 4)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: TextButton(
                      onPressed: onReview,
                      child: Text('+${awaiting.length - 4} more to review'),
                    ),
                  ),
                for (var i = 0; i < holds.length && i < 3; i++) ...[
                  if (i > 0 || awaiting.isNotEmpty) const Divider(indent: 72),
                  _AttentionRow(
                    booking: holds[i],
                    icon: Icons.hourglass_bottom_rounded,
                    color: StatusColors.depositPending,
                    title: displayName(holds[i]),
                    subtitle:
                        'Holding ${formatDateKeyShort(holds[i].event.dateKey)} · awaiting deposit',
                    action: MetaChip(
                      icon: Icons.timer_outlined,
                      label: timeUntil(holds[i].expiresAt!, now),
                      color: StatusColors.depositPending,
                      background: StatusColors.depositPending.withValues(
                        alpha: 0.08,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
      ],
    );
  }
}

class _AttentionRow extends StatelessWidget {
  final BookingEntity booking;
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final Widget action;
  const _AttentionRow({
    required this.booking,
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.action,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () => showBookingDetailSheet(context, booking.id),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 14, 12),
        child: Row(
          children: [
            IconTile(icon: icon, color: color, size: 42),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            action,
          ],
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  final VoidCallback? onOpenCalendar;
  const _QuickActions({this.onOpenCalendar});

  @override
  Widget build(BuildContext context) {
    final items = [
      (
        Icons.event_busy_rounded,
        'Block a date',
        'Leave, travel or a private event',
        () => pickAndBlockDate(context),
      ),
      (
        Icons.add_circle_outline_rounded,
        'Add service',
        'Shown on the website instantly',
        () => showServiceEditor(context),
      ),
      (
        Icons.ios_share_rounded,
        'Share booking link',
        kBookingLink.replaceFirst(RegExp(r'^https?://'), ''),
        () => copyToClipboard(context, kBookingLink, label: 'Booking link'),
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionHeader('Quick actions'),
        LayoutBuilder(
          builder: (context, c) {
            final cols = c.maxWidth >= 560 ? 3 : 1;
            const gap = 10.0;
            final w = (c.maxWidth - gap * (cols - 1)) / cols;
            return Wrap(
              spacing: gap,
              runSpacing: gap,
              children: [
                for (final (icon, title, sub, onTap) in items)
                  SizedBox(
                    width: w,
                    child: AppCard(
                      semanticLabel: title,
                      onTap: () {
                        tapHaptic();
                        onTap();
                      },
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          IconTile(icon: icon, color: BrandColors.gold),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                                Text(
                                  sub,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: BrandColors.muted,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _NextUp extends StatelessWidget {
  final List<BookingEntity> upcoming;
  final VoidCallback? onSeeAll;
  const _NextUp({required this.upcoming, this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(
          'Next up',
          subtitle: upcoming.isEmpty ? null : 'Confirmed events',
          actionLabel: 'Calendar',
          onAction: onSeeAll,
        ),
        if (upcoming.isEmpty)
          const AppCard(
            shadow: false,
            child: EmptyState(
              compact: true,
              icon: Icons.event_available_outlined,
              title: 'No confirmed events yet',
              message:
                  'Once you approve a payment, the event appears on this timeline.',
            ),
          )
        else
          for (var i = 0; i < upcoming.length; i++)
            _TimelineItem(
              booking: upcoming[i],
              first: i == 0,
              last: i == upcoming.length - 1,
            ),
      ],
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final BookingEntity booking;
  final bool first;
  final bool last;
  const _TimelineItem({
    required this.booking,
    required this.first,
    required this.last,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final b = booking;
    final d = EventDetails.parseDateKey(b.event.dateKey);
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 56,
            child: Column(
              children: [
                Container(
                  width: 52,
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  decoration: BoxDecoration(
                    color: first ? BrandColors.plum : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: first ? BrandColors.plum : BrandColors.outline,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        d == null
                            ? '—'
                            : DateFormat('MMM').format(d).toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w800,
                          color: first
                              ? BrandColors.goldBright
                              : BrandColors.gold,
                        ),
                      ),
                      Text(
                        d == null ? '' : '${d.day}',
                        style: AppTheme.serif(
                          size: 20,
                          weight: FontWeight.w700,
                          color: first ? Colors.white : BrandColors.plumInk,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!last)
                  Expanded(
                    child: Container(
                      width: 1.5,
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      color: BrandColors.outline,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 0 : 12),
              child: AppCard(
                semanticLabel: 'Open booking ${b.id}',
                onTap: () => showBookingDetailSheet(context, b.id),
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            displayName(b),
                            style: theme.textTheme.titleSmall,
                          ),
                        ),
                        Text(
                          relativeDayLabel(b.event.dateKey),
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: BrandColors.gold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      b.serviceTitle,
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        MetaChip(
                          icon: Icons.schedule_rounded,
                          label:
                              'Ready by ${formatReadyTime(b.event.readyByTime)}',
                        ),
                        if (b.event.venueLocation.isNotEmpty ||
                            b.event.city.isNotEmpty)
                          MetaChip(
                            icon: Icons.place_outlined,
                            label: [
                              b.event.venueLocation,
                              b.event.city,
                            ].where((s) => s.isNotEmpty).join(', '),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DashboardSkeleton extends StatelessWidget {
  const _DashboardSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    final cols = w >= 1000 ? 4 : 2;
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          w >= 600 ? 28 : 16,
          8,
          w >= 600 ? 28 : 16,
          16,
        ),
        children: [
          const SkeletonBox(height: 150, radius: 24),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, c) {
              final tw = (c.maxWidth - 12 * (cols - 1)) / cols;
              return Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  for (var i = 0; i < 4; i++)
                    SkeletonBox(width: tw, height: 128, radius: 18),
                ],
              );
            },
          ),
          const SizedBox(height: 28),
          const SkeletonBox(width: 200, height: 18),
          const SizedBox(height: 14),
          const SkeletonBox(height: 180, radius: 18),
        ],
      ),
    );
  }
}
