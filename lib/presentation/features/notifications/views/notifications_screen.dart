import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_models.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../common/widgets/admin_widgets.dart';
import '../../bookings/booking_detail_sheet.dart';

/// `notifications` collection, newest first, grouped by day. Marking read
/// is optimistic (rolled back if the write fails).
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final Set<String> _readLocally = {};

  bool _unread(AdminNotification n) =>
      n.isUnread && !_readLocally.contains(n.id);

  Future<void> _markRead(AdminNotification n) async {
    if (!_unread(n)) return;
    tapHaptic();
    setState(() => _readLocally.add(n.id));
    try {
      await context.read<AdminRepositories>().notifications.markRead(n.id);
    } catch (e) {
      if (!mounted) return;
      setState(() => _readLocally.remove(n.id));
      showErrorSnack(context, e);
    }
  }

  Future<void> _markAll(List<AdminNotification> items) async {
    final ids = items.where(_unread).map((n) => n.id).toList();
    if (ids.isEmpty) return;
    tapHaptic();
    setState(() => _readLocally.addAll(ids));
    try {
      await context.read<AdminRepositories>().notifications.markAllRead();
      if (mounted) showSuccessSnack(context, 'All caught up');
    } catch (e) {
      if (!mounted) return;
      setState(() => _readLocally.removeAll(ids));
      showErrorSnack(context, e);
    }
  }

  static String _dayLabel(DateTime? d) {
    if (d == null) return 'Earlier';
    final local = d.toLocal();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(local.year, local.month, local.day);
    final diff = today.difference(day).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    if (diff < 7) return DateFormat('EEEE').format(local);
    return DateFormat(
      local.year == now.year ? 'd MMMM' : 'd MMMM yyyy',
    ).format(local);
  }

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    return LiveStreamBuilder<List<AdminNotification>>(
      create: repos.notifications.watchRecent,
      loading: (_) => const SkeletonList(itemHeight: 76),
      builder: (context, items) {
        _readLocally.removeWhere(
          (id) => items.any((n) => n.id == id && !n.isUnread),
        );
        if (items.isEmpty) {
          return const EmptyState(
            icon: Icons.notifications_none_rounded,
            title: 'No notifications',
            message:
                'New bookings and payment proofs from the website show up here.',
          );
        }
        final unread = items.where(_unread).length;

        // Group by day, keeping newest-first order.
        final groups = <String, List<AdminNotification>>{};
        for (final n in items) {
          groups.putIfAbsent(_dayLabel(n.createdAt), () => []).add(n);
        }

        return LayoutBuilder(
          builder: (context, c) {
            final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
            var index = 0;
            return Align(
              alignment: Alignment.topLeft,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 820),
                child: Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.fromLTRB(pad, 0, pad - 8, 4),
                      child: Row(
                        children: [
                          AnimatedSwitcher(
                            duration: motion(
                              context,
                              const Duration(milliseconds: 200),
                            ),
                            child: StatusChip(
                              key: ValueKey(unread),
                              label: unread == 0
                                  ? 'All read'
                                  : '$unread unread',
                              color: unread == 0
                                  ? StatusColors.confirmed
                                  : BrandColors.gold,
                            ),
                          ),
                          const Spacer(),
                          TextButton.icon(
                            onPressed: unread == 0
                                ? null
                                : () => _markAll(items),
                            icon: const Icon(Icons.done_all_rounded, size: 18),
                            label: const Text('Mark all read'),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: RefreshIndicator(
                        color: BrandColors.plum,
                        onRefresh: () =>
                            Future.delayed(const Duration(milliseconds: 600)),
                        child: ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: EdgeInsets.fromLTRB(pad, 4, pad, 28),
                          children: [
                            for (final g in groups.entries) ...[
                              SectionTitle(g.key),
                              for (final n in g.value)
                                Padding(
                                  key: ValueKey(n.id),
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: FadeSlideIn(
                                    index: index++,
                                    child: _NotificationTile(
                                      item: n,
                                      unread: _unread(n),
                                      onRead: () => _markRead(n),
                                    ),
                                  ),
                                ),
                            ],
                            const SizedBox(height: 8),
                            if (unread > 0)
                              Center(
                                child: Text(
                                  'Swipe a notification to mark it read',
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AdminNotification item;
  final bool unread;
  final VoidCallback onRead;
  const _NotificationTile({
    required this.item,
    required this.unread,
    required this.onRead,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final n = item;
    final isPayment = n.category == 'PAYMENT';
    final color = isPayment
        ? StatusColors.awaitingVerification
        : BrandColors.plum;

    final tile = AppCard(
      semanticLabel: '${unread ? 'Unread: ' : ''}${n.title}',
      shadow: unread,
      color: unread ? Colors.white : const Color(0xFFFCFAF6),
      onTap: () {
        onRead();
        if (n.bookingId != null) {
          showBookingDetailSheet(context, n.bookingId!);
        }
      },
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconTile(
            icon: isPayment
                ? Icons.receipt_long_rounded
                : Icons.event_note_rounded,
            color: unread ? color : BrandColors.muted,
            size: 40,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        n.title.isEmpty ? '(no title)' : n.title,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: unread
                              ? FontWeight.w800
                              : FontWeight.w600,
                          color: unread
                              ? BrandColors.plumInk
                              : BrandColors.muted,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      n.createdAt == null
                          ? ''
                          : DateFormat('h:mm a').format(n.createdAt!.toLocal()),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
                if (n.body.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(
                    n.body,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: unread
                          ? const Color(0xFF5E4E54)
                          : BrandColors.muted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          AnimatedContainer(
            duration: motion(context, const Duration(milliseconds: 250)),
            margin: const EdgeInsets.only(left: 10, top: 4),
            width: unread ? 9 : 0,
            height: 9,
            decoration: const BoxDecoration(
              color: BrandColors.goldBright,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );

    if (!unread) return tile;
    return Dismissible(
      key: ValueKey('dismiss-${n.id}'),
      direction: DismissDirection.horizontal,
      confirmDismiss: (_) async {
        onRead();
        return false; // keep it in the list, just mark read
      },
      background: _swipeBg(Alignment.centerLeft),
      secondaryBackground: _swipeBg(Alignment.centerRight),
      child: tile,
    );
  }

  Widget _swipeBg(Alignment a) => Container(
    decoration: BoxDecoration(
      color: StatusColors.confirmed.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(AppTheme.radius),
    ),
    alignment: a,
    padding: const EdgeInsets.symmetric(horizontal: 20),
    child: const Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.mark_email_read_outlined, color: StatusColors.confirmed),
        SizedBox(width: 8),
        Text(
          'Mark read',
          style: TextStyle(
            color: StatusColors.confirmed,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    ),
  );
}
