import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_models.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/admin_widgets.dart';
import '../../bookings/booking_detail_sheet.dart';

bool _isActiveBooking(BookingEntity b) =>
    b.status == BookingStatus.confirmed || b.status == BookingStatus.completed;

Color calendarColorFor(CalendarEntry e) {
  if (e.isLapsedHold()) return StatusColors.unknown;
  switch (e.status) {
    case CalendarEntryStatus.hold:
      return StatusColors.hold;
    case CalendarEntryStatus.booked:
      return StatusColors.booked;
    case CalendarEntryStatus.blocked:
      return StatusColors.blocked;
    case CalendarEntryStatus.unknown:
      return StatusColors.unknown;
  }
}

String _entryLabel(CalendarEntry e) {
  if (e.isLapsedHold()) return 'Hold lapsed (free)';
  switch (e.status) {
    case CalendarEntryStatus.hold:
      return 'On hold';
    case CalendarEntryStatus.booked:
      return 'Booked';
    case CalendarEntryStatus.blocked:
      return 'Blocked';
    case CalendarEntryStatus.unknown:
      return e.rawStatus.isEmpty ? 'Unknown' : e.rawStatus;
  }
}

/// Month view of `calendar/{date}` plus bookings on those dates.
class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  late DateTime _month;
  int _direction = 1;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
  }

  String get _fromKey => dateKeyOf(_month);
  String get _toKey => dateKeyOf(DateTime(_month.year, _month.month + 1, 0));

  void _shift(int delta) {
    tapHaptic();
    setState(() {
      _direction = delta;
      _month = DateTime(_month.year, _month.month + delta);
    });
  }

  void _today() {
    final now = DateTime.now();
    final m = DateTime(now.year, now.month);
    if (m == _month) return;
    setState(() {
      _direction = m.isAfter(_month) ? 1 : -1;
      _month = m;
    });
  }

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    final monthKey = _fromKey;

    return LiveStreamBuilder<Map<String, CalendarEntry>>(
      streamKey: monthKey,
      create: () => repos.calendar.watchRange(_fromKey, _toKey),
      loading: (_) => const _CalendarSkeleton(),
      builder: (context, entries) => LiveStreamBuilder<List<BookingEntity>>(
        streamKey: monthKey,
        create: () => repos.bookings.watchByEventDateRange(_fromKey, _toKey),
        loading: (_) => const _CalendarSkeleton(),
        builder: (context, bookings) {
          final byDate = <String, List<BookingEntity>>{};
          for (final b in bookings) {
            byDate.putIfAbsent(b.event.dateKey, () => []).add(b);
          }
          final activeByDate = {
            for (final e in byDate.entries)
              if (e.value.any(_isActiveBooking))
                e.key: e.value.where(_isActiveBooking).toList(),
          };

          void onDay(String key) => showCalendarDaySheet(
            context,
            dateKey: key,
            entry: entries[key],
            bookings: byDate[key] ?? const [],
          );

          return LayoutBuilder(
            builder: (context, c) {
              final wide = c.maxWidth >= 900;
              final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
              final calendar = _MonthCard(
                month: _month,
                direction: _direction,
                entries: entries,
                activeByDate: activeByDate,
                cellHeight: wide ? 50 : 46,
                onPrev: () => _shift(-1),
                onNext: () => _shift(1),
                onToday: _today,
                onTap: onDay,
              );
              final agenda = _Agenda(
                month: _month,
                entries: entries,
                byDate: byDate,
                activeByDate: activeByDate,
                onTap: onDay,
              );
              if (wide) {
                return Padding(
                  padding: EdgeInsets.fromLTRB(pad, 4, pad, 0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 440,
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Column(
                            children: [
                              calendar,
                              const SizedBox(height: 14),
                              const _BlockHint(),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 28),
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.only(bottom: 24),
                          children: [agenda],
                        ),
                      ),
                    ],
                  ),
                );
              }
              return ListView(
                padding: EdgeInsets.fromLTRB(pad, 4, pad, 28),
                children: [
                  calendar,
                  const SizedBox(height: 10),
                  const _BlockHint(),
                  agenda,
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _BlockHint extends StatelessWidget {
  const _BlockHint();
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      const Icon(Icons.touch_app_outlined, size: 15, color: BrandColors.muted),
      const SizedBox(width: 6),
      Text(
        'Tap a day to see it or block it',
        style: Theme.of(context).textTheme.bodySmall,
      ),
    ],
  );
}

class _MonthCard extends StatelessWidget {
  final DateTime month;
  final int direction;
  final Map<String, CalendarEntry> entries;
  final Map<String, List<BookingEntity>> activeByDate;
  final double cellHeight;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onToday;
  final ValueChanged<String> onTap;

  const _MonthCard({
    required this.month,
    required this.direction,
    required this.entries,
    required this.activeByDate,
    required this.cellHeight,
    required this.onPrev,
    required this.onNext,
    required this.onToday,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final isCurrent = month.year == now.year && month.month == now.month;
    return AppCard(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
      child: Column(
        children: [
          Row(
            children: [
              const SizedBox(width: 6),
              Expanded(
                child: SmoothSwitcher(
                  child: RichText(
                    key: ValueKey(month),
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: DateFormat('MMMM ').format(month),
                          style: AppTheme.serif(size: 22),
                        ),
                        TextSpan(
                          text: '${month.year}',
                          style: AppTheme.serif(
                            size: 22,
                            weight: FontWeight.w500,
                            color: BrandColors.gold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (!isCurrent)
                TextButton(
                  onPressed: onToday,
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                  ),
                  child: const Text('Today'),
                ),
              IconButton(
                tooltip: 'Previous month',
                onPressed: onPrev,
                icon: const Icon(Icons.chevron_left_rounded),
              ),
              IconButton(
                tooltip: 'Next month',
                onPressed: onNext,
                icon: const Icon(Icons.chevron_right_rounded),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final w in const ['M', 'T', 'W', 'T', 'F', 'S', 'S'])
                Expanded(
                  child: Center(
                    child: Text(
                      w,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: BrandColors.muted,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          GestureDetector(
            behavior: HitTestBehavior.translucent,
            onHorizontalDragEnd: (d) {
              final v = d.primaryVelocity ?? 0;
              if (v < -250) onNext();
              if (v > 250) onPrev();
            },
            child: AnimatedSwitcher(
              duration: motion(context, const Duration(milliseconds: 300)),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              layoutBuilder: (current, previous) => Stack(
                alignment: Alignment.topCenter,
                children: [...previous, ?current],
              ),
              transitionBuilder: (child, anim) {
                final incoming = child.key == ValueKey(month);
                final dx = (incoming ? 0.12 : -0.12) * direction;
                return FadeTransition(
                  opacity: anim,
                  child: SlideTransition(
                    position: Tween(
                      begin: Offset(dx, 0),
                      end: Offset.zero,
                    ).animate(anim),
                    child: child,
                  ),
                );
              },
              child: _MonthGrid(
                key: ValueKey(month),
                month: month,
                entries: entries,
                activeByDate: activeByDate,
                cellHeight: cellHeight,
                onTap: onTap,
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 10),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 14,
            runSpacing: 6,
            children: [
              _legend(context, StatusColors.booked, 'Booked'),
              _legend(context, StatusColors.hold, 'On hold'),
              _legend(context, StatusColors.blocked, 'Blocked'),
              _legend(context, BrandColors.plum, 'Today', ring: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legend(
    BuildContext context,
    Color c,
    String l, {
    bool ring = false,
  }) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: ring ? null : c.withValues(alpha: 0.85),
          border: ring ? Border.all(color: c, width: 1.6) : null,
        ),
      ),
      const SizedBox(width: 6),
      Text(l, style: Theme.of(context).textTheme.bodySmall),
    ],
  );
}

class _MonthGrid extends StatelessWidget {
  final DateTime month;
  final Map<String, CalendarEntry> entries;
  final Map<String, List<BookingEntity>> activeByDate;
  final double cellHeight;
  final ValueChanged<String> onTap;

  const _MonthGrid({
    super.key,
    required this.month,
    required this.entries,
    required this.activeByDate,
    required this.cellHeight,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final first = DateTime(month.year, month.month, 1);
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final leading = first.weekday - 1; // Monday first
    final todayKey = dateKeyOf(DateTime.now());
    final total = ((leading + daysInMonth + 6) ~/ 7) * 7;

    return Column(
      children: [
        for (var row = 0; row < total ~/ 7; row++)
          Row(
            children: [
              for (var col = 0; col < 7; col++)
                Expanded(
                  child: SizedBox(
                    height: cellHeight,
                    child: () {
                      final day = row * 7 + col - leading + 1;
                      if (day < 1 || day > daysInMonth) {
                        return const SizedBox.shrink();
                      }
                      return _dayCell(
                        context,
                        DateTime(month.year, month.month, day),
                        todayKey,
                      );
                    }(),
                  ),
                ),
            ],
          ),
      ],
    );
  }

  Widget _dayCell(BuildContext context, DateTime day, String todayKey) {
    final theme = Theme.of(context);
    final key = dateKeyOf(day);
    final e = entries[key];
    final hasActive = activeByDate[key]?.isNotEmpty == true;
    Color? color;
    String status = 'free';
    if (e != null && !e.isLapsedHold()) {
      color = calendarColorFor(e);
      status = _entryLabel(e);
    } else if (hasActive) {
      color = StatusColors.booked;
      status = 'Booked';
    }
    final isPast = key.compareTo(todayKey) < 0;
    final isToday = key == todayKey;
    final size = (cellHeight - 8).clamp(30.0, 40.0);

    return Semantics(
      button: true,
      label: '${DateFormat('d MMMM').format(day)}, $status',
      excludeSemantics: true,
      onTap: () => onTap(key),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: () {
          tapHaptic();
          onTap(key);
        },
        child: Center(
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color?.withValues(alpha: isPast ? 0.1 : 0.16),
              border: isToday
                  ? Border.all(color: BrandColors.plum, width: 1.8)
                  : null,
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Text(
                  '${day.day}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: color != null || isToday
                        ? FontWeight.w800
                        : FontWeight.w500,
                    color: color != null
                        ? Color.lerp(color, Colors.black, 0.2)
                        : isPast
                        ? const Color(0xFFBDB1B4)
                        : BrandColors.plumInk,
                    decoration: e?.status == CalendarEntryStatus.blocked
                        ? TextDecoration.lineThrough
                        : null,
                    decorationColor: color,
                  ),
                ),
                if (color != null)
                  Positioned(
                    bottom: size * 0.12,
                    child: Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Month's held/booked/blocked dates as a list.
class _Agenda extends StatelessWidget {
  final DateTime month;
  final Map<String, CalendarEntry> entries;
  final Map<String, List<BookingEntity>> byDate;
  final Map<String, List<BookingEntity>> activeByDate;
  final ValueChanged<String> onTap;

  const _Agenda({
    required this.month,
    required this.entries,
    required this.byDate,
    required this.activeByDate,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final keys = <String>{
      ...entries.keys.where((k) => !entries[k]!.isLapsedHold()),
      ...activeByDate.keys,
    }.toList()..sort();
    final todayKey = dateKeyOf(DateTime.now());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(
          'In ${DateFormat('MMMM').format(month)}',
          subtitle: keys.isEmpty
              ? null
              : '${keys.length} date${keys.length == 1 ? '' : 's'} taken',
          padding: const EdgeInsets.only(top: 12, bottom: 12),
        ),
        if (keys.isEmpty)
          const AppCard(
            shadow: false,
            child: EmptyState(
              compact: true,
              icon: Icons.event_available_outlined,
              title: 'Wide open',
              message: 'No holds, bookings or blocked dates this month.',
            ),
          )
        else
          for (var i = 0; i < keys.length; i++)
            FadeSlideIn(
              key: ValueKey('${keys[i]}-${entries[keys[i]]?.rawStatus}'),
              index: i,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _agendaItem(context, theme, keys[i], todayKey),
              ),
            ),
      ],
    );
  }

  Widget _agendaItem(
    BuildContext context,
    ThemeData theme,
    String key,
    String todayKey,
  ) {
    final e = entries[key];
    final active = activeByDate[key] ?? const <BookingEntity>[];
    final color = e != null ? calendarColorFor(e) : StatusColors.booked;
    final label = e != null ? _entryLabel(e) : 'Booked';
    final linked = <BookingEntity>[
      ...?byDate[key]?.where((b) => b.id == e?.bookingId),
      ...active.where((b) => b.id != e?.bookingId),
    ];
    final d = EventDetails.parseDateKey(key)!;
    final title = linked.isNotEmpty
        ? linked.map(displayName).join(', ')
        : e?.status == CalendarEntryStatus.blocked
        ? (e?.note?.isNotEmpty == true ? e!.note! : 'Blocked')
        : (e?.bookingId ?? label);
    final subtitle = [
      if (linked.isNotEmpty) linked.first.serviceTitle,
      if (linked.isNotEmpty)
        'Ready by ${formatReadyTime(linked.first.event.readyByTime)}',
      if (e?.status == CalendarEntryStatus.hold && e?.expiresAt != null)
        'Hold ${timeUntil(e!.expiresAt!)}',
      if (e?.status == CalendarEntryStatus.blocked) 'Not available for booking',
    ].join(' · ');
    final past = key.compareTo(todayKey) < 0;

    return AppCard(
      semanticLabel: '${formatDateKey(key)} $label',
      onTap: () => onTap(key),
      padding: const EdgeInsets.all(12),
      child: Opacity(
        opacity: past ? 0.6 : 1,
        child: Row(
          children: [
            Container(
              width: 50,
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    DateFormat('EEE').format(d).toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: color,
                      fontSize: 10,
                    ),
                  ),
                  Text(
                    '${d.day}',
                    style: AppTheme.serif(
                      size: 20,
                      weight: FontWeight.w700,
                      color: Color.lerp(color, Colors.black, 0.25)!,
                      height: 1.1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall,
                  ),
                  if (subtitle.isNotEmpty)
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall,
                    ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            StatusChip(label: label, color: color, dense: true),
          ],
        ),
      ),
    );
  }
}

class _CalendarSkeleton extends StatelessWidget {
  const _CalendarSkeleton();
  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(w >= 600 ? 28 : 16, 4, 16, 16),
        children: [
          Align(
            alignment: Alignment.topLeft,
            child: SkeletonBox(
              width: w >= 900 ? 440 : double.infinity,
              height: 380,
              radius: 18,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Day sheet
// ---------------------------------------------------------------------------

/// Bottom sheet for one day: status, linked bookings, block/unblock.
Future<void> showCalendarDaySheet(
  BuildContext context, {
  required String dateKey,
  required CalendarEntry? entry,
  required List<BookingEntity> bookings,
}) {
  final repos = context.read<AdminRepositories>();
  return showAppSheet<void>(
    context,
    maxWidth: 560,
    builder: (ctx) => _DaySheet(
      dateKey: dateKey,
      entry: entry,
      bookings: bookings,
      repos: repos,
      hostContext: context,
    ),
  );
}

/// Quick action: pick a future date, then open its day sheet.
Future<void> pickAndBlockDate(BuildContext context) async {
  final repos = context.read<AdminRepositories>();
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final picked = await showDatePicker(
    context: context,
    initialDate: today,
    firstDate: today,
    lastDate: DateTime(today.year + 3, 12, 31),
    helpText: 'Choose a date to block',
  );
  if (picked == null || !context.mounted) return;
  final key = dateKeyOf(picked);
  try {
    final entries = await repos.calendar.watchRange(key, key).first;
    final bookings = await repos.bookings.watchByEventDateRange(key, key).first;
    if (!context.mounted) return;
    await showCalendarDaySheet(
      context,
      dateKey: key,
      entry: entries[key],
      bookings: bookings,
    );
  } catch (e) {
    if (context.mounted) showErrorSnack(context, e);
  }
}

class _DaySheet extends StatefulWidget {
  final String dateKey;
  final CalendarEntry? entry;
  final List<BookingEntity> bookings;
  final AdminRepositories repos;
  final BuildContext hostContext;
  const _DaySheet({
    required this.dateKey,
    required this.entry,
    required this.bookings,
    required this.repos,
    required this.hostContext,
  });

  @override
  State<_DaySheet> createState() => _DaySheetState();
}

class _DaySheetState extends State<_DaySheet> {
  final _note = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _block() async {
    final key = widget.dateKey;
    final note = _note.text.trim();
    setState(() => _busy = true);
    try {
      await widget.repos.calendar.block(key, note);
      tapHaptic();
      if (!mounted) return;
      Navigator.pop(context);
      final host = widget.hostContext;
      if (host.mounted) {
        showSuccessSnack(
          host,
          '${formatDateKey(key)} blocked',
          actionLabel: 'Undo',
          onAction: () => runWithFeedback(
            host,
            () => widget.repos.calendar.unblock(key),
            success: '${formatDateKey(key)} unblocked',
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        showErrorSnack(context, e);
      }
    }
  }

  Future<void> _unblock() async {
    final key = widget.dateKey;
    final note = widget.entry?.note ?? '';
    setState(() => _busy = true);
    try {
      await widget.repos.calendar.unblock(key);
      tapHaptic();
      if (!mounted) return;
      Navigator.pop(context);
      final host = widget.hostContext;
      if (host.mounted) {
        showSuccessSnack(
          host,
          '${formatDateKey(key)} is open again',
          actionLabel: 'Undo',
          onAction: () => runWithFeedback(
            host,
            () => widget.repos.calendar.block(key, note),
            success: '${formatDateKey(key)} blocked',
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        showErrorSnack(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final key = widget.dateKey;
    final entry = widget.entry;
    final active = widget.bookings.where(_isActiveBooking).toList();
    final d = EventDetails.parseDateKey(key);
    final isFree = entry == null || entry.isLapsedHold();
    final past = key.compareTo(dateKeyOf(DateTime.now())) < 0;

    final Color color;
    final String label;
    final IconData icon;
    if (!isFree) {
      color = calendarColorFor(entry);
      label = _entryLabel(entry);
      icon = entry.status == CalendarEntryStatus.blocked
          ? Icons.block_rounded
          : entry.status == CalendarEntryStatus.hold
          ? Icons.hourglass_top_rounded
          : Icons.event_available_rounded;
    } else if (active.isNotEmpty) {
      color = StatusColors.booked;
      label = 'Booked';
      icon = Icons.event_available_rounded;
    } else {
      color = past ? StatusColors.expired : const Color(0xFF2E7D57);
      label = past ? 'Past date' : 'Open for bookings';
      icon = past ? Icons.history_rounded : Icons.event_available_outlined;
    }

    final ids = <String>{
      if (entry?.bookingId != null && !isFree) entry.bookingId!,
      ...active.map((b) => b.id),
    };
    final linked = [
      for (final id in ids)
        (id, widget.bookings.where((b) => b.id == id).firstOrNull),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              IconTile(icon: icon, color: color, size: 48, iconSize: 24),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      d == null ? key : DateFormat('EEEE, d MMMM').format(d),
                      style: AppTheme.serif(size: 22),
                    ),
                    Text(
                      [
                        if (d != null && d.year != DateTime.now().year)
                          '${d.year}',
                        relativeDayLabel(key),
                      ].where((s) => s.isNotEmpty).join(' · '),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              StatusChip(label: label, color: color),
            ],
          ),
          const SizedBox(height: 18),
          if (entry?.status == CalendarEntryStatus.hold &&
              entry?.expiresAt != null)
            _InfoLine(
              icon: Icons.timer_outlined,
              text: entry!.isLapsedHold()
                  ? 'Hold lapsed ${formatDateTime(entry.expiresAt)} — the date is free'
                  : 'Held while the client pays · expires ${timeUntil(entry.expiresAt!)}',
            ),
          if (entry?.note != null && entry!.note!.isNotEmpty)
            _InfoLine(icon: Icons.sticky_note_2_outlined, text: entry.note!),
          if (linked.isNotEmpty) ...[
            const SectionTitle('Bookings'),
            for (final (id, b) in linked)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  shadow: false,
                  semanticLabel: 'Open booking $id',
                  onTap: () {
                    Navigator.pop(context);
                    showBookingDetailSheet(widget.hostContext, id);
                  },
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      InitialsAvatar(
                        name: b?.customer.fullName ?? id,
                        size: 38,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              b == null ? id : displayName(b),
                              style: theme.textTheme.titleSmall,
                            ),
                            Text(
                              b == null
                                  ? 'Open booking'
                                  : '${b.serviceTitle} · ready by ${formatReadyTime(b.event.readyByTime)}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      if (b != null) StatusChip.forBooking(b, dense: true),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: BrandColors.muted,
                      ),
                    ],
                  ),
                ),
              ),
          ],
          if (isFree && active.isEmpty && !past) ...[
            const SizedBox(height: 4),
            Text(
              'Block this date so it can’t be booked on the website.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _note,
              decoration: const InputDecoration(
                labelText: 'Note (internal)',
                hintText: 'e.g. Personal leave, outstation trip',
                prefixIcon: Icon(Icons.edit_note_rounded),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _busy ? null : _block,
              icon: _busy
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.block_rounded, size: 18),
              label: const Text('Block this date'),
            ),
          ],
          if (isFree && active.isEmpty && past)
            const _InfoLine(
              icon: Icons.history_rounded,
              text: 'This date has passed and cannot be blocked.',
            ),
          if (entry?.status == CalendarEntryStatus.blocked) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _busy ? null : _unblock,
              icon: const Icon(Icons.lock_open_rounded, size: 18),
              label: const Text('Unblock date'),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoLine({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: BrandColors.muted),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
        ),
      ],
    ),
  );
}
