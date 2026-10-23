import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/admin_widgets.dart';
import '../../bookings/booking_actions.dart';
import '../../bookings/booking_detail_sheet.dart';

/// Live queue of bookings with status PAYMENT_PROOF_SUBMITTED, with a
/// focused review experience (list + review pane on desktop, list + full
/// screen review on phones).
class AdminPaymentVerificationScreen extends StatefulWidget {
  const AdminPaymentVerificationScreen({super.key});

  @override
  State<AdminPaymentVerificationScreen> createState() =>
      _AdminPaymentVerificationScreenState();
}

class _AdminPaymentVerificationScreenState
    extends State<AdminPaymentVerificationScreen> {
  String? _selectedId;
  int _selectedIndex = 0;

  /// Picks the selected booking; when it left the queue (approved/rejected),
  /// moves on to the item now at the same position.
  BookingEntity? _resolveSelected(List<BookingEntity> queue) {
    if (queue.isEmpty) return null;
    final i = queue.indexWhere((b) => b.id == _selectedId);
    if (i >= 0) {
      _selectedIndex = i;
      return queue[i];
    }
    final idx = _selectedIndex.clamp(0, queue.length - 1);
    _selectedIndex = idx;
    _selectedId = queue[idx].id;
    return queue[idx];
  }

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    return LiveStreamBuilder<List<BookingEntity>>(
      create: repos.bookings.watchAwaitingVerification,
      loading: (_) => const SkeletonList(itemHeight: 120),
      builder: (context, queue) {
        return LayoutBuilder(
          builder: (context, c) {
            final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
            final wide = c.maxWidth >= 980;
            if (queue.isEmpty) {
              return const _AllClear();
            }
            if (!wide) {
              return _QueueList(
                queue: queue,
                padding: EdgeInsets.fromLTRB(pad, 4, pad, 28),
                onOpen: (b) => _openReviewPage(context, b),
              );
            }
            final current = _resolveSelected(queue)!;
            return Padding(
              padding: EdgeInsets.fromLTRB(pad, 0, pad, 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(
                    width: 340,
                    child: _QueueList(
                      queue: queue,
                      selectedId: current.id,
                      compact: true,
                      padding: const EdgeInsets.only(top: 4, bottom: 20),
                      onOpen: (b) => setState(() {
                        _selectedId = b.id;
                        _selectedIndex = queue.indexOf(b);
                      }),
                    ),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: AppCard(
                        padding: EdgeInsets.zero,
                        color: const Color(0xFFFDFBF8),
                        child: _AnimatedReview(
                          booking: current,
                          position: queue.indexOf(current) + 1,
                          total: queue.length,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _openReviewPage(BuildContext context, BookingEntity b) {
    tapHaptic();
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            withAdminProviders(context, _PaymentReviewPage(initialId: b.id)),
      ),
    );
  }
}

class _AllClear extends StatelessWidget {
  const _AllClear();
  @override
  Widget build(BuildContext context) => const EmptyState(
    icon: Icons.verified_rounded,
    title: 'All payments verified',
    message:
        'New UPI payment proofs from the website land here for your review.',
  );
}

// ---------------------------------------------------------------------------
// Queue list
// ---------------------------------------------------------------------------

class _QueueList extends StatelessWidget {
  final List<BookingEntity> queue;
  final String? selectedId;
  final bool compact;
  final EdgeInsetsGeometry padding;
  final ValueChanged<BookingEntity> onOpen;

  const _QueueList({
    required this.queue,
    required this.onOpen,
    required this.padding,
    this.selectedId,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: EdgeInsets.only(
            left: compact ? 0 : padding.horizontal / 2,
            right: compact ? 0 : padding.horizontal / 2,
            bottom: 6,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: StatusColors.awaitingVerification.withValues(
                    alpha: 0.12,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${queue.length} to review',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: const Color(0xFF8A560A),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Oldest submission first',
                  style: theme.textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            color: BrandColors.plum,
            onRefresh: () => Future.delayed(const Duration(milliseconds: 600)),
            child: DiffAnimatedList<BookingEntity>(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: padding.resolve(TextDirection.ltr).copyWith(top: 6),
              items: queue,
              idOf: (b) => b.id,
              itemBuilder: (context, b, i) => FadeSlideIn(
                index: i,
                child: _QueueCard(
                  booking: b,
                  selected: b.id == selectedId,
                  compact: compact,
                  onTap: () => onOpen(b),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _QueueCard extends StatelessWidget {
  final BookingEntity booking;
  final bool selected;
  final bool compact;
  final VoidCallback onTap;
  const _QueueCard({
    required this.booking,
    required this.selected,
    required this.compact,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final b = booking;
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
        semanticLabel: 'Review payment ${b.id} ${displayName(b)}',
        shadow: !selected,
        onTap: onTap,
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                InitialsAvatar(name: b.customer.fullName, size: 42),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName(b),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleMedium,
                      ),
                      Text(
                        'Submitted ${timeAgo(b.payment.submittedAt)}',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatInr(b.commercials.depositRequired),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text('deposit', style: theme.textTheme.bodySmall),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Flexible(
                  child: MetaChip(
                    icon: Icons.calendar_today_rounded,
                    label: formatDateKeyShort(b.event.dateKey),
                  ),
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: MetaChip(
                    icon: Icons.tag_rounded,
                    label: b.payment.utrNumber == null
                        ? 'No UTR'
                        : 'UTR …${_tail(b.payment.utrNumber!)}',
                  ),
                ),
                if (!compact) ...[
                  const Spacer(),
                  Text(
                    'Review',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: BrandColors.plum,
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: BrandColors.plum,
                    size: 20,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  static String _tail(String s) =>
      s.length <= 4 ? s : s.substring(s.length - 4);
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

/// Cross-fades/slides between bookings as the selection moves on.
class _AnimatedReview extends StatelessWidget {
  final BookingEntity booking;
  final int position;
  final int total;
  const _AnimatedReview({
    required this.booking,
    required this.position,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: motion(context, const Duration(milliseconds: 380)),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, anim) => FadeTransition(
        opacity: anim,
        child: SlideTransition(
          position: Tween(
            begin: const Offset(0.04, 0),
            end: Offset.zero,
          ).animate(anim),
          child: child,
        ),
      ),
      child: PaymentReview(
        key: ValueKey(booking.id),
        booking: booking,
        position: position,
        total: total,
      ),
    );
  }
}

/// Review of one payment: proof, UTR, amounts, client & event, actions.
class PaymentReview extends StatefulWidget {
  final BookingEntity booking;
  final int position;
  final int total;
  final bool showHeaderCounter;
  const PaymentReview({
    super.key,
    required this.booking,
    required this.position,
    required this.total,
    this.showHeaderCounter = true,
  });

  @override
  State<PaymentReview> createState() => _PaymentReviewState();
}

class _PaymentReviewState extends State<PaymentReview> {
  bool _busy = false;

  Future<void> _run(Future<bool> Function() action) async {
    setState(() => _busy = true);
    await action();
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;
    final theme = Theme.of(context);
    final repos = context.read<AdminRepositories>();
    final session = context.read<AdminSession>();

    return LayoutBuilder(
      builder: (context, c) {
        final twoCol = c.maxWidth >= 640;
        final hp = c.maxWidth >= 600 ? 24.0 : 16.0;

        final header = Row(
          children: [
            InitialsAvatar(name: b.customer.fullName, size: 48),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName(b),
                    style: AppTheme.serif(size: 22),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${b.id} · submitted ${formatDateTime(b.payment.submittedAt)}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            if (widget.showHeaderCounter && widget.total > 1)
              Text(
                '${widget.position} of ${widget.total}',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: BrandColors.muted,
                ),
              ),
            const SizedBox(width: 4),
            IconButton(
              tooltip: 'Full booking details',
              onPressed: () => showBookingDetailSheet(context, b.id),
              icon: const Icon(Icons.open_in_new_rounded, size: 20),
            ),
          ],
        );

        final proof = PaymentProofImage(
          proofPath: b.payment.proofPath,
          resolveUrl: repos.proofDownloadUrl,
          height: twoCol ? 470 : 300,
        );

        final details = Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _AmountCheck(booking: b),
            const SizedBox(height: 12),
            _UtrCard(utr: b.payment.utrNumber),
            const SizedBox(height: 12),
            DetailSection(
              title: 'Client & event',
              icon: Icons.event_outlined,
              children: [
                InfoRow('Service', b.serviceTitle),
                InfoRow(
                  'Event date',
                  '${formatDateKey(b.event.dateKey)} · ${relativeDayLabel(b.event.dateKey)}',
                ),
                InfoRow('Ready by', formatReadyTime(b.event.readyByTime)),
                InfoRow(
                  'Venue',
                  [
                    b.event.venueLocation,
                    b.event.city,
                  ].where((s) => s.isNotEmpty).join(', '),
                ),
                InfoRow('Phone', b.customer.phone, copyable: true),
                InfoRow(
                  'Paid to',
                  '${b.payment.upiId}  ${b.payment.payeeName}'.trim(),
                ),
              ],
            ),
          ],
        );

        final actions = Container(
          padding: EdgeInsets.fromLTRB(hp, 12, hp, 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: BrandColors.outline)),
          ),
          child: SafeArea(
            top: false,
            child: AnimatedSwitcher(
              duration: motion(context, const Duration(milliseconds: 200)),
              child: _busy
                  ? const SizedBox(
                      key: ValueKey('busy'),
                      height: 52,
                      child: Center(
                        child: SizedBox(
                          width: 26,
                          height: 26,
                          child: CircularProgressIndicator(strokeWidth: 2.4),
                        ),
                      ),
                    )
                  : Row(
                      key: const ValueKey('actions'),
                      children: [
                        Expanded(
                          flex: 2,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 52),
                              foregroundColor: theme.colorScheme.error,
                              side: BorderSide(
                                color: theme.colorScheme.error.withValues(
                                  alpha: 0.4,
                                ),
                              ),
                            ),
                            onPressed: () => _run(
                              () => rejectPaymentFlow(context, repos, b),
                            ),
                            icon: const Icon(Icons.close_rounded, size: 20),
                            label: const Text('Reject'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 3,
                          child: FilledButton.icon(
                            style: FilledButton.styleFrom(
                              minimumSize: const Size(0, 52),
                            ),
                            onPressed: () => _run(
                              () => approvePaymentFlow(
                                context,
                                repos,
                                session,
                                b,
                              ),
                            ),
                            icon: const Icon(
                              Icons.verified_rounded,
                              size: 20,
                              color: BrandColors.goldBright,
                            ),
                            label: const Text('Approve'),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        );

        return Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.fromLTRB(hp, 20, hp, 24),
                children: [
                  header,
                  const SizedBox(height: 18),
                  if (twoCol)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 5, child: proof),
                        const SizedBox(width: 18),
                        Expanded(flex: 6, child: details),
                      ],
                    )
                  else ...[
                    proof,
                    const SizedBox(height: 14),
                    details,
                  ],
                ],
              ),
            ),
            actions,
          ],
        );
      },
    );
  }
}

class _AmountCheck extends StatelessWidget {
  final BookingEntity booking;
  const _AmountCheck({required this.booking});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = booking.commercials;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [BrandColors.goldSoft, Colors.white],
        ),
        borderRadius: BorderRadius.circular(AppTheme.radius),
        border: Border.all(color: const Color(0xFFEBD9B4)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'EXPECTED DEPOSIT',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: BrandColors.gold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formatInr(c.depositRequired),
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontFamily: theme.textTheme.titleLarge?.fontFamily,
                    fontWeight: FontWeight.w800,
                    fontSize: 26,
                  ),
                ),
                Text(
                  'Check this amount on the screenshot',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Container(width: 1, height: 56, color: const Color(0xFFEBD9B4)),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Booking total', style: theme.textTheme.bodySmall),
              Text(
                formatInr(c.totalAmount),
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (c.travelFee > 0)
                Text(
                  'incl. ${formatInr(c.travelFee)} travel',
                  style: theme.textTheme.bodySmall,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _UtrCard extends StatelessWidget {
  final String? utr;
  const _UtrCard({required this.utr});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final has = utr != null && utr!.isNotEmpty;
    return AppCard(
      shadow: false,
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
      child: Row(
        children: [
          const IconTile(icon: Icons.tag_rounded, size: 38, iconSize: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'UTR / reference number',
                  style: theme.textTheme.bodySmall,
                ),
                SelectableText(
                  has ? _group(utr!) : 'Not provided',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
              ],
            ),
          ),
          if (has)
            TextButton.icon(
              onPressed: () => copyToClipboard(context, utr!, label: 'UTR'),
              icon: const Icon(Icons.copy_rounded, size: 16),
              label: const Text('Copy'),
            ),
        ],
      ),
    );
  }

  static String _group(String s) {
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && i % 4 == 0) b.write(' ');
      b.write(s[i]);
    }
    return b.toString();
  }
}

// ---------------------------------------------------------------------------
// Phone: full-screen review that walks through the queue
// ---------------------------------------------------------------------------

class _PaymentReviewPage extends StatefulWidget {
  final String initialId;
  const _PaymentReviewPage({required this.initialId});

  @override
  State<_PaymentReviewPage> createState() => _PaymentReviewPageState();
}

class _PaymentReviewPageState extends State<_PaymentReviewPage> {
  late String _currentId = widget.initialId;
  int _index = 0;
  StreamSubscription<List<BookingEntity>>? _sub;
  List<BookingEntity>? _queue;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _sub = context
        .read<AdminRepositories>()
        .bookings
        .watchAwaitingVerification()
        .listen(
          (q) => setState(() {
            _queue = q;
            _error = null;
          }),
          onError: (Object e) => setState(() => _error = e),
        );
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  void _step(int delta, List<BookingEntity> q) {
    final next = (_index + delta).clamp(0, q.length - 1);
    tapHaptic();
    setState(() {
      _index = next;
      _currentId = q[next].id;
    });
  }

  @override
  Widget build(BuildContext context) {
    final q = _queue;
    BookingEntity? current;
    if (q != null && q.isNotEmpty) {
      final i = q.indexWhere((b) => b.id == _currentId);
      if (i >= 0) {
        _index = i;
      } else {
        _index = _index.clamp(0, q.length - 1);
        _currentId = q[_index].id;
      }
      current = q[_index];
    }
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: BrandColors.ivory,
      appBar: AppBar(
        title: Text('Review payment', style: AppTheme.serif(size: 22)),
        actions: [
          if (q != null && q.length > 1) ...[
            IconButton(
              tooltip: 'Previous',
              onPressed: _index > 0 ? () => _step(-1, q) : null,
              icon: const Icon(Icons.chevron_left_rounded),
            ),
            Text(
              '${_index + 1}/${q.length}',
              style: theme.textTheme.labelLarge,
            ),
            IconButton(
              tooltip: 'Next',
              onPressed: _index < q.length - 1 ? () => _step(1, q) : null,
              icon: const Icon(Icons.chevron_right_rounded),
            ),
          ],
          const SizedBox(width: 4),
        ],
        bottom: q == null || q.isEmpty
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(3),
                child: TweenAnimationBuilder<double>(
                  tween: Tween(end: (_index + 1) / q.length),
                  duration: motion(context, const Duration(milliseconds: 300)),
                  builder: (_, v, _) => LinearProgressIndicator(
                    value: v,
                    minHeight: 3,
                    color: BrandColors.gold,
                  ),
                ),
              ),
      ),
      body: _error != null
          ? ErrorView(error: _error!)
          : q == null
          ? const SkeletonList(count: 3, itemHeight: 160)
          : current == null
          ? EmptyState(
              icon: Icons.verified_rounded,
              title: 'All caught up',
              message: 'Every payment in the queue has been reviewed.',
              action: FilledButton(
                onPressed: () => Navigator.of(context).maybePop(),
                child: const Text('Back to payments'),
              ),
            )
          : _AnimatedReview(
              booking: current,
              position: _index + 1,
              total: q.length,
            ),
    );
  }
}
