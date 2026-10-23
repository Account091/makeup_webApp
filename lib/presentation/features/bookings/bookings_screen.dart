import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/admin/admin_repositories.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../common/widgets/admin_widgets.dart';
import 'booking_detail_sheet.dart';

enum BookingFilter {
  all('All'),
  awaitingVerification('Awaiting verification'),
  depositPending('Deposit pending'),
  confirmed('Confirmed'),
  completed('Completed'),
  rejected('Payment rejected'),
  expired('Expired'),
  cancelled('Cancelled'),
  unknown('Unknown status');

  final String label;
  const BookingFilter(this.label);

  Color? get color {
    switch (this) {
      case BookingFilter.all:
        return null;
      case BookingFilter.awaitingVerification:
        return StatusColors.awaitingVerification;
      case BookingFilter.depositPending:
        return StatusColors.depositPending;
      case BookingFilter.confirmed:
        return StatusColors.confirmed;
      case BookingFilter.completed:
        return StatusColors.completed;
      case BookingFilter.rejected:
        return StatusColors.rejected;
      case BookingFilter.expired:
        return StatusColors.expired;
      case BookingFilter.cancelled:
        return StatusColors.cancelled;
      case BookingFilter.unknown:
        return StatusColors.unknown;
    }
  }

  bool matches(BookingEntity b, DateTime now) {
    switch (this) {
      case BookingFilter.all:
        return true;
      case BookingFilter.awaitingVerification:
        return b.status == BookingStatus.paymentProofSubmitted;
      case BookingFilter.depositPending:
        return b.status == BookingStatus.depositPending &&
            !b.isUnpaidExpired(now);
      case BookingFilter.confirmed:
        return b.status == BookingStatus.confirmed;
      case BookingFilter.completed:
        return b.status == BookingStatus.completed;
      case BookingFilter.rejected:
        return b.status == BookingStatus.paymentRejected;
      case BookingFilter.expired:
        return b.status == BookingStatus.expired || b.isUnpaidExpired(now);
      case BookingFilter.cancelled:
        return b.status == BookingStatus.cancelled;
      case BookingFilter.unknown:
        return b.status == null;
    }
  }
}

/// Matches booking ID, customer name or phone (case-insensitive).
bool bookingMatchesQuery(BookingEntity b, String query) {
  final q = query.trim().toLowerCase();
  if (q.isEmpty) return true;
  final digits = q.replaceAll(RegExp(r'\D'), '');
  return b.id.toLowerCase().contains(q) ||
      b.customer.fullName.toLowerCase().contains(q) ||
      (digits.length >= 3 &&
          b.customer.phone.replaceAll(RegExp(r'\D'), '').contains(digits));
}

class BookingsScreen extends StatefulWidget {
  /// Optional pre-filtered list (e.g. one customer's bookings).
  final List<BookingEntity>? fixedBookings;
  const BookingsScreen({super.key, this.fixedBookings});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  BookingFilter _filter = BookingFilter.all;
  String _query = '';
  String? _selectedId;

  @override
  Widget build(BuildContext context) {
    final fixed = widget.fixedBookings;
    if (fixed != null) return _list(context, fixed, showControls: false);
    final repos = context.read<AdminRepositories>();
    return LiveStreamBuilder<List<BookingEntity>>(
      create: repos.bookings.watchAll,
      loading: (_) => const SkeletonList(withHeader: true),
      builder: (context, all) => _list(context, all, showControls: true),
    );
  }

  Widget _list(
    BuildContext context,
    List<BookingEntity> all, {
    required bool showControls,
  }) {
    final now = DateTime.now();
    final filtered = all
        .where((b) => _filter.matches(b, now) && bookingMatchesQuery(b, _query))
        .toList();
    final counts = {
      for (final f in BookingFilter.values)
        f: all.where((b) => f.matches(b, now)).length,
    };

    return LayoutBuilder(
      builder: (context, c) {
        final masterDetail = showControls && c.maxWidth >= 1100;
        final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
        String? selected = _selectedId;
        if (masterDetail &&
            (selected == null || !filtered.any((b) => b.id == selected))) {
          selected = filtered.isEmpty ? null : filtered.first.id;
        }

        final controls = showControls
            ? Column(
                children: [
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      masterDetail ? 0 : pad,
                      4,
                      masterDetail ? 0 : pad,
                      0,
                    ),
                    child: SearchField(
                      hint: 'Search name, phone or booking ID',
                      onChanged: (v) => setState(() => _query = v),
                    ),
                  ),
                  SizedBox(
                    height: 56,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(
                        horizontal: masterDetail ? 0 : pad,
                        vertical: 10,
                      ),
                      children: [
                        for (final f in BookingFilter.values)
                          if (f == BookingFilter.all ||
                              counts[f]! > 0 ||
                              f == _filter)
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterPill(
                                key: ValueKey('filter-${f.name}'),
                                label: f.label,
                                count: counts[f],
                                dot: f.color,
                                selected: _filter == f,
                                onTap: () => setState(() => _filter = f),
                              ),
                            ),
                      ],
                    ),
                  ),
                ],
              )
            : const SizedBox.shrink();

        final listBody = filtered.isEmpty
            ? EmptyState(
                icon: all.isEmpty
                    ? Icons.event_note_outlined
                    : Icons.filter_alt_off_outlined,
                title: all.isEmpty ? 'No bookings yet' : 'Nothing here',
                message: all.isEmpty
                    ? 'Bookings made on the website appear here instantly.'
                    : 'No bookings match this filter or search.',
              )
            : RefreshIndicator(
                color: BrandColors.plum,
                onRefresh: () =>
                    Future.delayed(const Duration(milliseconds: 600)),
                child: ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.fromLTRB(
                    masterDetail ? 0 : pad,
                    4,
                    masterDetail ? 0 : pad,
                    28,
                  ),
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final b = filtered[i];
                    return FadeSlideIn(
                      key: ValueKey(b.id),
                      index: i,
                      child: BookingTile(
                        booking: b,
                        selected: masterDetail && b.id == selected,
                        onTap: masterDetail
                            ? () => setState(() => _selectedId = b.id)
                            : null,
                      ),
                    );
                  },
                ),
              );

        final listColumn = Column(
          children: [
            controls,
            Expanded(
              child: SmoothSwitcher(
                child: KeyedSubtree(
                  key: ValueKey(filtered.isEmpty),
                  child: listBody,
                ),
              ),
            ),
          ],
        );

        if (!masterDetail) return listColumn;

        final repos = context.read<AdminRepositories>();
        final session = context.read<AdminSession>();
        return Padding(
          padding: EdgeInsets.fromLTRB(pad, 0, pad, 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(width: 420, child: listColumn),
              const SizedBox(width: 24),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 4, bottom: 20),
                  child: AppCard(
                    padding: EdgeInsets.zero,
                    color: const Color(0xFFFDFBF8),
                    child: SmoothSwitcher(
                      child: selected == null
                          ? const EmptyState(
                              key: ValueKey('none'),
                              icon: Icons.touch_app_outlined,
                              title: 'Select a booking',
                              message: 'Details and actions appear here.',
                            )
                          : Padding(
                              key: ValueKey(selected),
                              padding: const EdgeInsets.only(top: 20),
                              child: BookingDetailView(
                                bookingId: selected,
                                repos: repos,
                                session: session,
                              ),
                            ),
                    ),
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

class BookingTile extends StatelessWidget {
  final BookingEntity booking;
  final bool selected;

  /// Defaults to opening the detail sheet/panel.
  final VoidCallback? onTap;
  const BookingTile({
    super.key,
    required this.booking,
    this.selected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final theme = Theme.of(context);
    return AnimatedContainer(
      duration: motion(context, const Duration(milliseconds: 200)),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppTheme.radius + 2),
        border: Border.all(
          color: selected ? BrandColors.plum : Colors.transparent,
          width: 1.5,
        ),
      ),
      child: AppCard(
        semanticLabel: 'Booking ${b.id} ${displayName(b)}',
        shadow: !selected,
        onTap: () {
          tapHaptic();
          (onTap ?? () => showBookingDetailSheet(context, b.id))();
        },
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            InitialsAvatar(name: b.customer.fullName, size: 44),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          displayName(b),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleMedium,
                        ),
                      ),
                      const SizedBox(width: 8),
                      StatusChip.forBooking(b, dense: true),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${b.serviceTitle} · ${b.id}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            MetaChip(
                              icon: Icons.calendar_today_rounded,
                              label: formatDateKeyShort(b.event.dateKey),
                            ),
                            if (b.event.city.isNotEmpty)
                              MetaChip(
                                icon: Icons.place_outlined,
                                label: b.event.city,
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        formatInr(b.commercials.totalAmount),
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
