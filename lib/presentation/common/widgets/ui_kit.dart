import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/admin/admin_repositories.dart';
import 'admin_widgets.dart' show AdminSession;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/// True when the platform asks for reduced motion.
bool reduceMotion(BuildContext context) =>
    MediaQuery.maybeDisableAnimationsOf(context) ?? false;

/// [d], or zero when reduced motion is requested.
Duration motion(BuildContext context, Duration d) =>
    reduceMotion(context) ? Duration.zero : d;

/// Light haptic tick for primary actions (no-op where unsupported).
void tapHaptic() {
  HapticFeedback.lightImpact();
}

/// One-shot fade + slight upward slide when first built. Staggers by
/// [index] (capped) so lists cascade in gently.
class FadeSlideIn extends StatefulWidget {
  final Widget child;
  final int index;
  final double offset;
  const FadeSlideIn({
    super.key,
    required this.child,
    this.index = 0,
    this.offset = 14,
  });

  @override
  State<FadeSlideIn> createState() => _FadeSlideInState();
}

class _FadeSlideInState extends State<FadeSlideIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 420),
  );
  late final Animation<double> _t = CurvedAnimation(
    parent: _c,
    curve: Curves.easeOutCubic,
  );
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (reduceMotion(context)) {
      _c.value = 1;
      return;
    }
    final delay = Duration(milliseconds: 35 * math.min(widget.index, 8));
    if (delay == Duration.zero) {
      _c.forward();
    } else {
      Future.delayed(delay, () {
        if (mounted) _c.forward();
      });
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _t,
      child: widget.child,
      builder: (context, child) => Opacity(
        opacity: _t.value,
        child: Transform.translate(
          offset: Offset(0, (1 - _t.value) * widget.offset),
          child: child,
        ),
      ),
    );
  }
}

/// Fades/sizes between children keyed by their [Key].
class SmoothSwitcher extends StatelessWidget {
  final Widget child;
  final Duration duration;
  const SmoothSwitcher({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 260),
  });

  @override
  Widget build(BuildContext context) => AnimatedSwitcher(
    duration: motion(context, duration),
    switchInCurve: Curves.easeOutCubic,
    switchOutCurve: Curves.easeInCubic,
    layoutBuilder: (current, previous) => Stack(
      alignment: Alignment.topCenter,
      children: [...previous, ?current],
    ),
    child: child,
  );
}

// ---------------------------------------------------------------------------
// Skeletons / shimmer
// ---------------------------------------------------------------------------

/// Animates a soft highlight sweeping across its [child]; paint the child
/// with opaque placeholder boxes ([SkeletonBox]).
class Shimmer extends StatefulWidget {
  final Widget child;
  const Shimmer({super.key, required this.child});

  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (reduceMotion(context)) {
      _c.stop();
    } else if (!_c.isAnimating) {
      _c.repeat();
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      child: widget.child,
      builder: (context, child) {
        final v = _c.value * 2 - 0.5; // -0.5 .. 1.5
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (rect) => LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: const [
              Color(0xFFF1E8DD),
              Color(0xFFFBF7F1),
              Color(0xFFF1E8DD),
            ],
            stops: [
              (v - 0.25).clamp(0.0, 1.0),
              v.clamp(0.0, 1.0),
              (v + 0.25).clamp(0.0, 1.0),
            ],
          ).createShader(rect),
          child: child,
        );
      },
    );
  }
}

class SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final double radius;
  const SkeletonBox({super.key, this.width, this.height = 14, this.radius = 8});

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(
      color: const Color(0xFFF1E8DD),
      borderRadius: BorderRadius.circular(radius),
    ),
  );
}

/// Placeholder list of card-shaped rows.
class SkeletonList extends StatelessWidget {
  final int count;
  final double itemHeight;
  final EdgeInsets padding;
  final bool withHeader;
  const SkeletonList({
    super.key,
    this.count = 6,
    this.itemHeight = 84,
    this.padding = const EdgeInsets.fromLTRB(16, 16, 16, 16),
    this.withHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: padding,
        children: [
          if (withHeader) ...[
            const SkeletonBox(height: 48, radius: 14),
            const SizedBox(height: 14),
            const Row(
              children: [
                SkeletonBox(width: 70, height: 32, radius: 20),
                SizedBox(width: 8),
                SkeletonBox(width: 110, height: 32, radius: 20),
                SizedBox(width: 8),
                SkeletonBox(width: 90, height: 32, radius: 20),
              ],
            ),
            const SizedBox(height: 16),
          ],
          for (var i = 0; i < count; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Container(
                height: itemHeight,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppTheme.radius),
                ),
                child: Row(
                  children: [
                    const SkeletonBox(width: 44, height: 44, radius: 22),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          FractionallySizedBox(
                            widthFactor: 0.55 + (i % 3) * 0.1,
                            child: const SkeletonBox(height: 13),
                          ),
                          const SizedBox(height: 9),
                          const FractionallySizedBox(
                            widthFactor: 0.4,
                            child: SkeletonBox(height: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    const SkeletonBox(width: 64, height: 22, radius: 12),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

/// Rounded white card with a hairline border and soft shadow.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? color;
  final Gradient? gradient;
  final Color? borderColor;
  final double radius;
  final bool shadow;
  final String? semanticLabel;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.color,
    this.gradient,
    this.borderColor,
    this.radius = AppTheme.radius,
    this.shadow = true,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final br = BorderRadius.circular(radius);
    Widget content = Padding(padding: padding, child: child);
    if (onTap != null) {
      content = InkWell(borderRadius: br, onTap: onTap, child: content);
    }
    final card = DecoratedBox(
      decoration: BoxDecoration(
        color: gradient == null ? (color ?? Colors.white) : null,
        gradient: gradient,
        borderRadius: br,
        border: Border.all(color: borderColor ?? BrandColors.outline),
        boxShadow: shadow ? AppShadows.soft : null,
      ),
      child: Material(
        type: MaterialType.transparency,
        borderRadius: br,
        clipBehavior: Clip.antiAlias,
        child: content,
      ),
    );
    if (semanticLabel == null) return card;
    return Semantics(button: onTap != null, label: semanticLabel, child: card);
  }
}

/// Title row for a content section, with an optional trailing action.
class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;

  const SectionHeader(
    this.title, {
    super.key,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.trailing,
    this.padding = const EdgeInsets.only(top: 24, bottom: 12),
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.titleLarge),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!, style: theme.textTheme.bodySmall),
                ],
              ],
            ),
          ),
          ?trailing,
          if (actionLabel != null)
            TextButton(
              onPressed: onAction,
              style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(actionLabel!),
                  const SizedBox(width: 2),
                  const Icon(Icons.arrow_forward_rounded, size: 16),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Small icon + label chip used for meta data (date, city, time...).
class MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final Color? background;
  const MetaChip({
    super.key,
    required this.icon,
    required this.label,
    this.color,
    this.background,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = color ?? BrandColors.muted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: background ?? BrandColors.champagne.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: c),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelMedium?.copyWith(
                color: c,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Rounded tinted square holding an icon.
class IconTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final double size;
  final double iconSize;
  const IconTile({
    super.key,
    required this.icon,
    this.color = BrandColors.plum,
    this.size = 40,
    this.iconSize = 20,
  });

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(size * 0.32),
    ),
    alignment: Alignment.center,
    child: Icon(icon, size: iconSize, color: color),
  );
}

/// Gradient circle with the person's initials.
class InitialsAvatar extends StatelessWidget {
  final String name;
  final double size;
  const InitialsAvatar({super.key, required this.name, this.size = 44});

  static const _palettes = [
    [Color(0xFF6B2A5E), Color(0xFF4A1942)],
    [Color(0xFFC9A55C), Color(0xFFA8813A)],
    [Color(0xFFB76E79), Color(0xFF8E4A57)],
    [Color(0xFF5E6B8C), Color(0xFF3F4A66)],
    [Color(0xFF4F8572), Color(0xFF2E6553)],
    [Color(0xFF9C6B4E), Color(0xFF75492F)],
  ];

  static String initialsOf(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty && RegExp(r'[A-Za-z0-9]').hasMatch(p[0]))
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final hash = name.codeUnits.fold<int>(0, (a, b) => (a * 31 + b) & 0xFFFF);
    final colors = _palettes[hash % _palettes.length];
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
      ),
      alignment: Alignment.center,
      child: Text(
        initialsOf(name),
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: size * 0.36,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

/// Illustration-like empty state: concentric soft rings, an icon and a few
/// gold sparkles.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;
  final bool compact;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final s = compact ? 84.0 : 120.0;
    return Center(
      child: Padding(
        padding: EdgeInsets.all(compact ? 16 : 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: s + 40,
              height: s + 16,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: s,
                    height: s,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          BrandColors.goldSoft,
                          BrandColors.goldSoft.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    width: s * 0.62,
                    height: s * 0.62,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(color: BrandColors.outline),
                      boxShadow: AppShadows.soft,
                    ),
                    child: Icon(icon, size: s * 0.27, color: BrandColors.plum),
                  ),
                  Positioned(
                    top: s * 0.08,
                    right: s * 0.12,
                    child: Icon(
                      Icons.auto_awesome,
                      size: s * 0.15,
                      color: BrandColors.gold,
                    ),
                  ),
                  Positioned(
                    bottom: s * 0.14,
                    left: s * 0.1,
                    child: Icon(
                      Icons.auto_awesome,
                      size: s * 0.1,
                      color: BrandColors.gold.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: compact ? 6 : 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: compact
                  ? theme.textTheme.titleMedium
                  : AppTheme.serif(size: 20),
            ),
            if (message != null) ...[
              const SizedBox(height: 6),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: Text(
                  message!,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: BrandColors.muted,
                  ),
                ),
              ),
            ],
            if (action != null) ...[const SizedBox(height: 18), action!],
          ],
        ),
      ),
    );
  }
}

/// Small rounded count pill.
class CountPill extends StatelessWidget {
  final int count;
  final bool selected;
  const CountPill(this.count, {super.key, this.selected = false});

  @override
  Widget build(BuildContext context) => AnimatedContainer(
    duration: const Duration(milliseconds: 200),
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1),
    decoration: BoxDecoration(
      color: selected
          ? Colors.white.withValues(alpha: 0.22)
          : BrandColors.champagne,
      borderRadius: BorderRadius.circular(10),
    ),
    child: Text(
      '$count',
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: selected ? Colors.white : BrandColors.muted,
      ),
    ),
  );
}

/// Pill filter chip with an animated selected state and count.
class FilterPill extends StatelessWidget {
  final String label;
  final int? count;
  final bool selected;
  final VoidCallback onTap;
  final Color? dot;

  const FilterPill({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.count,
    this.dot,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Semantics(
      button: true,
      selected: selected,
      label: count == null ? label : '$label ($count)',
      excludeSemantics: true,
      onTap: onTap,
      child: AnimatedContainer(
        duration: motion(context, const Duration(milliseconds: 220)),
        curve: Curves.easeOutCubic,
        decoration: BoxDecoration(
          color: selected ? BrandColors.plum : Colors.white,
          borderRadius: BorderRadius.circular(40),
          border: Border.all(
            color: selected ? BrandColors.plum : BrandColors.outline,
          ),
        ),
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            borderRadius: BorderRadius.circular(40),
            onTap: () {
              tapHaptic();
              onTap();
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (dot != null) ...[
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: selected ? Colors.white : dot,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 7),
                  ],
                  Text(
                    label,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: selected ? Colors.white : BrandColors.plumInk,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (count != null) ...[
                    const SizedBox(width: 6),
                    CountPill(count!, selected: selected),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Search field styled for list headers.
class SearchField extends StatelessWidget {
  final String hint;
  final ValueChanged<String> onChanged;
  final TextEditingController? controller;
  const SearchField({
    super.key,
    required this.hint,
    required this.onChanged,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.search_rounded),
        hintText: hint,
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sheets & panels
// ---------------------------------------------------------------------------

/// Re-provides the admin repositories/session to a modal route (modal routes
/// sit above the shell's providers).
Widget withAdminProviders(BuildContext context, Widget child) {
  AdminRepositories? repos;
  AdminSession? session;
  try {
    repos = context.read<AdminRepositories>();
  } catch (_) {}
  try {
    session = context.read<AdminSession>();
  } catch (_) {}
  if (repos == null && session == null) return child;
  return MultiRepositoryProvider(
    providers: [
      if (repos != null) RepositoryProvider.value(value: repos),
      if (session != null) RepositoryProvider.value(value: session),
    ],
    child: child,
  );
}

/// Modal bottom sheet with drag handle, rounded top and max width. Wraps in
/// its own [ScaffoldMessenger] so SnackBars appear above the sheet.
Future<T?> showAppSheet<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  bool fullHeight = false,
  double maxWidth = 720,
}) {
  final h = MediaQuery.sizeOf(context).height;
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    showDragHandle: true,
    constraints: BoxConstraints(
      maxWidth: maxWidth,
      maxHeight: fullHeight ? h : h * 0.92,
    ),
    builder: (ctx) => withAdminProviders(
      context,
      fullHeight
          // Full-height sheets get their own messenger + scaffold so
          // SnackBars appear above the sheet.
          ? ScaffoldMessenger(
              child: Builder(
                builder: (inner) => Scaffold(
                  backgroundColor: Colors.transparent,
                  body: builder(inner),
                ),
              ),
            )
          // Short sheets size to their content.
          : Builder(
              builder: (inner) => Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.viewInsetsOf(inner).bottom,
                ),
                child: builder(inner),
              ),
            ),
    ),
  );
}

/// Panel sliding in from the right edge (desktop detail views).
Future<T?> showSidePanel<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  double width = 520,
}) {
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close',
    barrierColor: const Color(0x552C1320),
    transitionDuration: motion(context, const Duration(milliseconds: 320)),
    pageBuilder: (ctx, _, _) => Align(
      alignment: Alignment.centerRight,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Material(
            color: BrandColors.ivory,
            elevation: 12,
            shadowColor: const Color(0x552C1320),
            borderRadius: BorderRadius.circular(24),
            clipBehavior: Clip.antiAlias,
            child: SizedBox(
              width: math.min(width, MediaQuery.sizeOf(ctx).width - 24),
              height: double.infinity,
              child: withAdminProviders(
                context,
                ScaffoldMessenger(
                  child: Scaffold(
                    backgroundColor: Colors.transparent,
                    body: builder(ctx),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    transitionBuilder: (ctx, anim, _, child) {
      final t = CurvedAnimation(
        parent: anim,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      );
      return FadeTransition(
        opacity: t,
        child: SlideTransition(
          position: Tween(
            begin: const Offset(0.08, 0),
            end: Offset.zero,
          ).animate(t),
          child: child,
        ),
      );
    },
  );
}

/// Side panel on wide screens, full-height bottom sheet on phones.
Future<T?> showAdaptivePanel<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  double width = 520,
}) {
  if (MediaQuery.sizeOf(context).width >= 900) {
    return showSidePanel<T>(context, builder: builder, width: width);
  }
  return showAppSheet<T>(context, builder: builder, fullHeight: true);
}

/// Header used at the top of sheets/panels: title, optional subtitle and a
/// close button on side panels.
class SheetHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final bool showClose;
  const SheetHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    this.showClose = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.fromLTRB(20, showClose ? 16 : 0, 12, 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTheme.serif(size: 22)),
                if (subtitle != null)
                  Text(subtitle!, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          ?trailing,
          if (showClose)
            IconButton(
              tooltip: 'Close',
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.close_rounded),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Celebration
// ---------------------------------------------------------------------------

/// Brief, subtle success moment: a gold check that scales in over a soft
/// scrim, with a title, then fades away on its own.
Future<void> showCelebration(
  BuildContext context, {
  required String title,
  String? subtitle,
}) async {
  final overlay = Overlay.maybeOf(context, rootOverlay: true);
  if (overlay == null) return;
  final reduce = reduceMotion(context);
  late OverlayEntry entry;
  entry = OverlayEntry(
    builder: (_) => _Celebration(
      title: title,
      subtitle: subtitle,
      reduce: reduce,
      onDone: () => entry.remove(),
    ),
  );
  overlay.insert(entry);
}

class _Celebration extends StatefulWidget {
  final String title;
  final String? subtitle;
  final bool reduce;
  final VoidCallback onDone;
  const _Celebration({
    required this.title,
    this.subtitle,
    required this.reduce,
    required this.onDone,
  });

  @override
  State<_Celebration> createState() => _CelebrationState();
}

class _CelebrationState extends State<_Celebration>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: Duration(milliseconds: widget.reduce ? 1400 : 1700),
  );

  @override
  void initState() {
    super.initState();
    _c.forward().whenComplete(widget.onDone);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _c,
        builder: (context, _) {
          final v = _c.value;
          // fade in 0-.15, hold, fade out .8-1
          final opacity = v < 0.15
              ? v / 0.15
              : v > 0.8
              ? (1 - v) / 0.2
              : 1.0;
          final scale = widget.reduce
              ? 1.0
              : Curves.elasticOut.transform((v / 0.45).clamp(0.0, 1.0)) * 0.4 +
                    0.6;
          final ring = (v / 0.6).clamp(0.0, 1.0);
          return Opacity(
            opacity: opacity.clamp(0.0, 1.0),
            child: Container(
              color: const Color(0x332C1320),
              alignment: Alignment.center,
              child: Container(
                padding: const EdgeInsets.fromLTRB(32, 28, 32, 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: AppShadows.lifted,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 96,
                      height: 96,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          if (!widget.reduce)
                            Container(
                              width: 60 + 36 * ring,
                              height: 60 + 36 * ring,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: BrandColors.goldBright.withValues(
                                    alpha: (1 - ring) * 0.8,
                                  ),
                                  width: 2,
                                ),
                              ),
                            ),
                          Transform.scale(
                            scale: scale,
                            child: Container(
                              width: 64,
                              height: 64,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: BrandColors.goldGradient,
                              ),
                              child: const Icon(
                                Icons.check_rounded,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(widget.title, style: AppTheme.serif(size: 20)),
                    if (widget.subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        widget.subtitle!,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Animated list that diffs a live list by id
// ---------------------------------------------------------------------------

/// A list that animates items in/out (size + fade) when [items] changes,
/// matching items by [idOf]. Reorders fall back to an instant rebuild.
class DiffAnimatedList<T> extends StatefulWidget {
  final List<T> items;
  final String Function(T item) idOf;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final EdgeInsetsGeometry padding;
  final double spacing;
  final ScrollPhysics? physics;
  final bool shrinkWrap;

  const DiffAnimatedList({
    super.key,
    required this.items,
    required this.idOf,
    required this.itemBuilder,
    this.padding = EdgeInsets.zero,
    this.spacing = 10,
    this.physics,
    this.shrinkWrap = false,
  });

  @override
  State<DiffAnimatedList<T>> createState() => _DiffAnimatedListState<T>();
}

class _DiffAnimatedListState<T> extends State<DiffAnimatedList<T>> {
  var _listKey = GlobalKey<AnimatedListState>();
  late List<T> _items = List.of(widget.items);

  Duration get _d => motion(context, const Duration(milliseconds: 340));

  @override
  void didUpdateWidget(covariant DiffAnimatedList<T> old) {
    super.didUpdateWidget(old);
    final id = widget.idOf;
    final next = widget.items;
    final nextIds = next.map(id).toSet();
    final state = _listKey.currentState;
    if (state == null) {
      _items = List.of(next);
      return;
    }
    // Removals (from the end so indexes stay valid).
    for (var i = _items.length - 1; i >= 0; i--) {
      if (!nextIds.contains(id(_items[i]))) {
        final removed = _items.removeAt(i);
        state.removeItem(
          i,
          (ctx, anim) => _wrap(ctx, removed, i, anim, removing: true),
          duration: _d,
        );
      }
    }
    // Remaining order must match, otherwise rebuild without animation.
    final keptIds = _items.map(id).toList();
    final nextKept = next.map(id).where(keptIds.contains).toList();
    var sameOrder = keptIds.length == nextKept.length;
    for (var i = 0; sameOrder && i < keptIds.length; i++) {
      if (keptIds[i] != nextKept[i]) sameOrder = false;
    }
    if (!sameOrder) {
      _items = List.of(next);
      _listKey = GlobalKey<AnimatedListState>();
      return;
    }
    // Insertions and in-place updates.
    for (var i = 0; i < next.length; i++) {
      if (i < _items.length && id(_items[i]) == id(next[i])) {
        _items[i] = next[i];
      } else {
        _items.insert(i, next[i]);
        state.insertItem(i, duration: _d);
      }
    }
  }

  Widget _wrap(
    BuildContext context,
    T item,
    int index,
    Animation<double> anim, {
    bool removing = false,
  }) {
    final curved = CurvedAnimation(
      parent: anim,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    return SizeTransition(
      sizeFactor: curved,
      axisAlignment: -1,
      child: FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween(
            begin: Offset(removing ? 0.12 : 0, removing ? 0 : 0.08),
            end: Offset.zero,
          ).animate(curved),
          child: Padding(
            padding: EdgeInsets.only(bottom: widget.spacing),
            child: IgnorePointer(
              ignoring: removing,
              child: widget.itemBuilder(context, item, index),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedList(
      key: _listKey,
      padding: widget.padding,
      physics: widget.physics,
      shrinkWrap: widget.shrinkWrap,
      initialItemCount: _items.length,
      itemBuilder: (context, i, anim) => _wrap(context, _items[i], i, anim),
    );
  }
}
