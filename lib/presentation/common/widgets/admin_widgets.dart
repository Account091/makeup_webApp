import 'package:firebase_core/firebase_core.dart' show FirebaseException;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../domain/entities/booking_entity.dart';
import 'ui_kit.dart';

export 'brand.dart';
export 'ui_kit.dart';

/// Signed-in staff member, provided to the shell via RepositoryProvider.
class AdminSession {
  final String uid;
  final String email;
  final String role;
  final String? displayName;
  const AdminSession({
    required this.uid,
    required this.email,
    required this.role,
    this.displayName,
  });

  /// Value written to `payment.verifiedBy`.
  String get actor => email.isNotEmpty ? email : uid;

  /// Friendly first name: display name, else the email prefix, capitalised.
  String get firstName {
    final dn = displayName?.trim() ?? '';
    if (dn.isNotEmpty) return dn.split(RegExp(r'\s+')).first;
    final prefix = email.split('@').first.split(RegExp(r'[._\-+0-9]')).first;
    if (prefix.isEmpty) return 'there';
    return prefix[0].toUpperCase() + prefix.substring(1).toLowerCase();
  }

  String get roleLabel =>
      role.isEmpty ? '' : role[0].toUpperCase() + role.substring(1);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

final _inr = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

String formatInr(num v) => _inr.format(v);

/// Compact Indian format for KPI tiles: ₹7,500 · ₹1.2L · ₹2.4Cr.
String formatInrCompact(num v) {
  if (v.abs() >= 10000000) {
    return '₹${(v / 10000000).toStringAsFixed(v % 10000000 == 0 ? 0 : 1)}Cr';
  }
  if (v.abs() >= 100000) {
    return '₹${(v / 100000).toStringAsFixed(v % 100000 == 0 ? 0 : 1)}L';
  }
  return formatInr(v);
}

String formatDateTime(DateTime? d) =>
    d == null ? '—' : DateFormat('d MMM yyyy, h:mm a').format(d.toLocal());

/// Formats a `YYYY-MM-DD` key; falls back to the raw value if unparseable.
String formatDateKey(String key) {
  final d = EventDetails.parseDateKey(key);
  if (d == null) return key.isEmpty ? '—' : key;
  return DateFormat('EEE, d MMM yyyy').format(d);
}

/// `Sat, 12 Dec` (adds the year when it isn't the current one).
String formatDateKeyShort(String key) {
  final d = EventDetails.parseDateKey(key);
  if (d == null) return key.isEmpty ? '—' : key;
  final now = DateTime.now();
  return DateFormat(d.year == now.year ? 'EEE, d MMM' : 'd MMM yyyy').format(d);
}

/// `16:30` -> `4:30 PM`; returns the raw value when not HH:mm.
String formatReadyTime(String hhmm) {
  final m = RegExp(r'^(\d{1,2}):(\d{2})$').firstMatch(hhmm.trim());
  if (m == null) return hhmm.isEmpty ? '—' : hhmm;
  final dt = DateTime(
    2000,
    1,
    1,
    int.parse(m.group(1)!),
    int.parse(m.group(2)!),
  );
  return DateFormat('h:mm a').format(dt);
}

/// "Today", "Tomorrow", "In 5 days", "3 days ago" for a date key.
String relativeDayLabel(String key, [DateTime? now]) {
  final d = EventDetails.parseDateKey(key);
  if (d == null) return '';
  final n = now ?? DateTime.now();
  final today = DateTime(n.year, n.month, n.day);
  final diff = d.difference(today).inDays;
  if (diff == 0) return 'Today';
  if (diff == 1) return 'Tomorrow';
  if (diff == -1) return 'Yesterday';
  final days = diff.abs();
  final span = days <= 60
      ? '$days days'
      : days < 365
      ? '${(days / 30).round()} months'
      : '${(days / 365).floor()} yr ${((days % 365) / 30).round()} mo';
  return diff > 0 ? 'In $span' : '$span ago';
}

/// "just now", "12 min ago", "3 h ago", "2 d ago".
String timeAgo(DateTime? d, [DateTime? now]) {
  if (d == null) return '—';
  final diff = (now ?? DateTime.now()).difference(d);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
  if (diff.inHours < 24) return '${diff.inHours} h ago';
  if (diff.inDays < 7) return '${diff.inDays} d ago';
  return DateFormat('d MMM').format(d.toLocal());
}

/// "in 12 min", "in 3 h" for a future instant.
String timeUntil(DateTime d, [DateTime? now]) {
  final diff = d.difference(now ?? DateTime.now());
  if (diff.isNegative) return 'lapsed';
  if (diff.inMinutes < 1) return 'in <1 min';
  if (diff.inMinutes < 60) return 'in ${diff.inMinutes} min';
  if (diff.inHours < 48) return 'in ${diff.inHours} h';
  return 'in ${diff.inDays} d';
}

String dateKeyOf(DateTime d) => EventDetails.formatDateKey(d);

/// Human label for a raw `payment.status` (unknown values stay visible).
String paymentStatusLabel(String raw) {
  switch (raw) {
    case PaymentStatusValues.depositPending:
      return 'Deposit pending';
    case PaymentStatusValues.verificationPending:
      return 'Awaiting verification';
    case PaymentStatusValues.verified:
      return 'Verified';
    case PaymentStatusValues.rejected:
      return 'Rejected';
    case PaymentStatusValues.expired:
      return 'Expired';
    default:
      return raw;
  }
}

String displayName(BookingEntity b) =>
    b.customer.fullName.trim().isEmpty ? '(no name)' : b.customer.fullName;

// ---------------------------------------------------------------------------
// Status chip (status colours are defined once in StatusColors)
// ---------------------------------------------------------------------------

Color statusColorFor(BookingEntity b, [DateTime? now]) {
  if (b.isUnpaidExpired(now)) return StatusColors.expired;
  switch (b.status) {
    case BookingStatus.depositPending:
      return StatusColors.depositPending;
    case BookingStatus.paymentProofSubmitted:
      return StatusColors.awaitingVerification;
    case BookingStatus.confirmed:
      return StatusColors.confirmed;
    case BookingStatus.paymentRejected:
      return StatusColors.rejected;
    case BookingStatus.expired:
      return StatusColors.expired;
    case BookingStatus.cancelled:
      return StatusColors.cancelled;
    case BookingStatus.completed:
      return StatusColors.completed;
    case null:
      return StatusColors.unknown;
  }
}

IconData statusIconFor(BookingEntity b, [DateTime? now]) {
  if (b.isUnpaidExpired(now)) return Icons.timer_off_outlined;
  switch (b.status) {
    case BookingStatus.depositPending:
      return Icons.hourglass_top_rounded;
    case BookingStatus.paymentProofSubmitted:
      return Icons.receipt_long_outlined;
    case BookingStatus.confirmed:
      return Icons.verified_outlined;
    case BookingStatus.paymentRejected:
      return Icons.block_rounded;
    case BookingStatus.expired:
      return Icons.timer_off_outlined;
    case BookingStatus.cancelled:
      return Icons.cancel_outlined;
    case BookingStatus.completed:
      return Icons.task_alt_rounded;
    case null:
      return Icons.help_outline_rounded;
  }
}

class StatusChip extends StatelessWidget {
  final String label;
  final Color color;
  final bool dense;

  const StatusChip({
    super.key,
    required this.label,
    required this.color,
    this.dense = false,
  });

  factory StatusChip.forBooking(
    BookingEntity b, {
    Key? key,
    bool dense = false,
  }) => StatusChip(
    key: key,
    label: b.statusLabel(),
    color: statusColorFor(b),
    dense: dense,
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: dense ? 8 : 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Color.lerp(color, Colors.black, 0.18),
                fontWeight: FontWeight.w700,
                letterSpacing: 0.1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Loading / error / empty states
// ---------------------------------------------------------------------------

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});
  @override
  Widget build(BuildContext context) => const Center(
    child: Padding(
      padding: EdgeInsets.all(32),
      child: SizedBox(
        width: 28,
        height: 28,
        child: CircularProgressIndicator(strokeWidth: 2.4),
      ),
    ),
  );
}

class ErrorView extends StatelessWidget {
  final Object error;
  final VoidCallback? onRetry;
  const ErrorView({super.key, required this.error, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconTile(
                icon: Icons.cloud_off_rounded,
                color: theme.colorScheme.error,
                size: 56,
                iconSize: 28,
              ),
              const SizedBox(height: 14),
              Text('Could not load data', style: AppTheme.serif(size: 20)),
              const SizedBox(height: 8),
              SelectableText(
                describeError(error),
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall,
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Retry'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class EmptyView extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? title;
  const EmptyView({
    super.key,
    required this.icon,
    required this.message,
    this.title,
  });

  @override
  Widget build(BuildContext context) => EmptyState(
    icon: icon,
    title: title ?? message,
    message: title == null ? null : message,
  );
}

String describeError(Object e) {
  if (e is FirebaseException) {
    return '${e.message ?? e.code} (${e.plugin}/${e.code})';
  }
  return e.toString();
}

/// Subscribes to a stream created by [create] and renders loading / error
/// (with Retry, which re-creates the stream) / data. The first load shows
/// [loading] (a skeleton by default) and cross-fades into the content.
class LiveStreamBuilder<T> extends StatefulWidget {
  final Stream<T> Function() create;
  final Widget Function(BuildContext context, T data) builder;
  final WidgetBuilder? loading;

  /// Changing this key re-subscribes (e.g. month changes). The previous
  /// data stays visible until the new stream emits.
  final Object? streamKey;

  const LiveStreamBuilder({
    super.key,
    required this.create,
    required this.builder,
    this.streamKey,
    this.loading,
  });

  @override
  State<LiveStreamBuilder<T>> createState() => _LiveStreamBuilderState<T>();
}

class _LiveStreamBuilderState<T> extends State<LiveStreamBuilder<T>> {
  late Stream<T> _stream;

  @override
  void initState() {
    super.initState();
    _stream = widget.create();
  }

  @override
  void didUpdateWidget(covariant LiveStreamBuilder<T> old) {
    super.didUpdateWidget(old);
    if (old.streamKey != widget.streamKey) _stream = widget.create();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<T>(
      stream: _stream,
      builder: (context, snap) {
        final Widget child;
        if (snap.hasError) {
          child = KeyedSubtree(
            key: const ValueKey('error'),
            child: ErrorView(
              error: snap.error!,
              onRetry: () => setState(() => _stream = widget.create()),
            ),
          );
        } else if (!snap.hasData) {
          child = KeyedSubtree(
            key: const ValueKey('loading'),
            child: widget.loading?.call(context) ?? const SkeletonList(),
          );
        } else {
          child = KeyedSubtree(
            key: const ValueKey('data'),
            child: widget.builder(context, snap.data as T),
          );
        }
        return AnimatedSwitcher(
          duration: motion(context, const Duration(milliseconds: 280)),
          switchInCurve: Curves.easeOut,
          switchOutCurve: Curves.easeIn,
          child: child,
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Feedback helpers
// ---------------------------------------------------------------------------

void showSuccessSnack(
  BuildContext context,
  String message, {
  String? actionLabel,
  VoidCallback? onAction,
}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.check_circle_rounded,
              color: BrandColors.goldBright,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(message)),
          ],
        ),
        action: actionLabel == null
            ? null
            : SnackBarAction(label: actionLabel, onPressed: onAction ?? () {}),
      ),
    );
}

void showErrorSnack(BuildContext context, Object error) {
  final theme = Theme.of(context);
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF7A1F1A),
        duration: const Duration(seconds: 6),
        content: Row(
          children: [
            const Icon(
              Icons.error_outline_rounded,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                describeError(error),
                style: TextStyle(color: theme.colorScheme.onError),
              ),
            ),
          ],
        ),
      ),
    );
}

/// Runs [action]; shows a success SnackBar only after it completes, or an
/// error SnackBar. Returns true on success.
Future<bool> runWithFeedback(
  BuildContext context,
  Future<void> Function() action, {
  required String success,
}) async {
  try {
    await action();
    if (context.mounted) showSuccessSnack(context, success);
    return true;
  } catch (e) {
    if (context.mounted) showErrorSnack(context, e);
    return false;
  }
}

Future<bool> confirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  bool destructive = false,
  IconData? icon,
}) async {
  final theme = Theme.of(context);
  final color = destructive ? theme.colorScheme.error : BrandColors.plum;
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      icon: IconTile(
        icon:
            icon ??
            (destructive
                ? Icons.warning_amber_rounded
                : Icons.help_outline_rounded),
        color: color,
        size: 52,
        iconSize: 26,
      ),
      title: Text(title, textAlign: TextAlign.center),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Text(message, textAlign: TextAlign.center),
      ),
      actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      actions: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton(
                style: destructive
                    ? FilledButton.styleFrom(backgroundColor: color)
                    : null,
                onPressed: () {
                  tapHaptic();
                  Navigator.pop(ctx, true);
                },
                child: Text(confirmLabel, textAlign: TextAlign.center),
              ),
            ),
          ],
        ),
      ],
    ),
  );
  return ok == true;
}

/// Copies [text] and confirms with a SnackBar.
Future<void> copyToClipboard(
  BuildContext context,
  String text, {
  String? label,
}) async {
  await Clipboard.setData(ClipboardData(text: text));
  tapHaptic();
  if (context.mounted) showSuccessSnack(context, '${label ?? text} copied');
}

// ---------------------------------------------------------------------------
// Payment proof image (Storage path -> download URL)
// ---------------------------------------------------------------------------

class PaymentProofImage extends StatefulWidget {
  final String? proofPath;
  final Future<String> Function(String path) resolveUrl;
  final double height;
  const PaymentProofImage({
    super.key,
    required this.proofPath,
    required this.resolveUrl,
    this.height = 260,
  });

  @override
  State<PaymentProofImage> createState() => _PaymentProofImageState();
}

class _PaymentProofImageState extends State<PaymentProofImage> {
  Future<String>? _url;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant PaymentProofImage old) {
    super.didUpdateWidget(old);
    if (old.proofPath != widget.proofPath) _load();
  }

  void _load() {
    final p = widget.proofPath;
    _url = (p == null || p.isEmpty) ? null : widget.resolveUrl(p);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final box = BoxDecoration(
      color: const Color(0xFFF3ECE2),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: theme.colorScheme.outlineVariant),
    );
    if (_url == null) {
      return Container(
        height: 120,
        decoration: box,
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.image_not_supported_outlined,
              color: BrandColors.muted,
            ),
            const SizedBox(height: 6),
            Text('No payment proof uploaded', style: theme.textTheme.bodySmall),
          ],
        ),
      );
    }
    return FutureBuilder<String>(
      future: _url,
      builder: (context, snap) {
        if (snap.hasError) {
          return Container(
            decoration: box,
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                Text(
                  'Could not load proof: ${describeError(snap.error!)}',
                  style: theme.textTheme.bodySmall,
                ),
                TextButton.icon(
                  onPressed: () => setState(_load),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
              ],
            ),
          );
        }
        if (!snap.hasData) {
          return Shimmer(child: SkeletonBox(height: widget.height, radius: 16));
        }
        final url = snap.data!;
        return Semantics(
          button: true,
          label: 'Open payment proof full screen',
          child: GestureDetector(
            onTap: () => openImageViewer(context, url),
            child: Container(
              height: widget.height,
              decoration: box,
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Hero(
                    tag: url,
                    child: Image.network(
                      url,
                      fit: BoxFit.contain,
                      errorBuilder: (_, e, _) =>
                          Center(child: Text('Image failed to load: $e')),
                      frameBuilder: (_, child, frame, sync) => AnimatedOpacity(
                        opacity: sync || frame != null ? 1 : 0,
                        duration: const Duration(milliseconds: 300),
                        child: child,
                      ),
                    ),
                  ),
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xCC1C0A14),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.zoom_out_map_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Tap to zoom',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Full-screen, pinch/scroll-zoomable image viewer.
Future<void> openImageViewer(BuildContext context, String url) {
  return Navigator.of(context, rootNavigator: true).push(
    PageRouteBuilder<void>(
      opaque: false,
      barrierColor: Colors.black87,
      transitionDuration: motion(context, const Duration(milliseconds: 260)),
      pageBuilder: (ctx, _, _) => _ImageViewer(url: url),
      transitionsBuilder: (_, anim, _, child) =>
          FadeTransition(opacity: anim, child: child),
    ),
  );
}

class _ImageViewer extends StatefulWidget {
  final String url;
  const _ImageViewer({required this.url});

  @override
  State<_ImageViewer> createState() => _ImageViewerState();
}

class _ImageViewerState extends State<_ImageViewer> {
  final _ctrl = TransformationController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _zoom(double factor) {
    final s = (_ctrl.value.getMaxScaleOnAxis() * factor).clamp(1.0, 6.0);
    final size = MediaQuery.sizeOf(context);
    final c = Offset(size.width / 2, size.height / 2);
    _ctrl.value = Matrix4.identity()
      ..translateByDouble(c.dx, c.dy, 0, 1)
      ..scaleByDouble(s, s, 1, 1)
      ..translateByDouble(-c.dx, -c.dy, 0, 1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onDoubleTap: () => _ctrl.value.getMaxScaleOnAxis() > 1.1
                  ? _ctrl.value = Matrix4.identity()
                  : _zoom(2.5),
              child: InteractiveViewer(
                transformationController: _ctrl,
                minScale: 1,
                maxScale: 6,
                child: Center(
                  child: Hero(
                    tag: widget.url,
                    child: Image.network(widget.url, fit: BoxFit.contain),
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: 12,
            right: 12,
            child: SafeArea(
              child: Row(
                children: [
                  _ViewerButton(
                    icon: Icons.zoom_out_rounded,
                    tooltip: 'Zoom out',
                    onTap: () => _zoom(1 / 1.6),
                  ),
                  const SizedBox(width: 8),
                  _ViewerButton(
                    icon: Icons.zoom_in_rounded,
                    tooltip: 'Zoom in',
                    onTap: () => _zoom(1.6),
                  ),
                  const SizedBox(width: 8),
                  _ViewerButton(
                    icon: Icons.close_rounded,
                    tooltip: 'Close',
                    onTap: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ViewerButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  const _ViewerButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => IconButton.filled(
    tooltip: tooltip,
    style: IconButton.styleFrom(
      backgroundColor: Colors.white.withValues(alpha: 0.14),
      foregroundColor: Colors.white,
    ),
    onPressed: onTap,
    icon: Icon(icon),
  );
}

/// Label/value row used in detail views.
class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData? icon;
  final bool copyable;
  final bool emphasize;
  const InfoRow(
    this.label,
    this.value, {
    super.key,
    this.icon,
    this.copyable = false,
    this.emphasize = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final shown = value.isEmpty ? '—' : value;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 17, color: BrandColors.muted),
            const SizedBox(width: 10),
          ],
          SizedBox(
            width: icon == null ? 132 : 110,
            child: Text(label, style: theme.textTheme.bodySmall),
          ),
          Expanded(
            child: SelectableText(
              shown,
              style: emphasize
                  ? theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    )
                  : theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
            ),
          ),
          if (copyable && value.isNotEmpty)
            IconButton(
              tooltip: 'Copy $label',
              visualDensity: VisualDensity.compact,
              iconSize: 17,
              onPressed: () => copyToClipboard(context, value, label: label),
              icon: const Icon(Icons.copy_rounded),
            ),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  final String text;
  const SectionTitle(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 18, bottom: 8),
    child: Text(
      text.toUpperCase(),
      style: Theme.of(context).textTheme.labelSmall?.copyWith(
        color: BrandColors.gold,
        letterSpacing: 1.2,
        fontWeight: FontWeight.w800,
      ),
    ),
  );
}

/// White rounded section with an uppercase gold title.
class DetailSection extends StatelessWidget {
  final String title;
  final IconData? icon;
  final List<Widget> children;
  final Widget? trailing;
  const DetailSection({
    super.key,
    required this.title,
    required this.children,
    this.icon,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      shadow: false,
      padding: const EdgeInsets.fromLTRB(16, 14, 8, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8, bottom: 4),
            child: Row(
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 16, color: BrandColors.gold),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: Text(
                    title.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: BrandColors.gold,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                ?trailing,
              ],
            ),
          ),
          ...children,
        ],
      ),
    );
  }
}
