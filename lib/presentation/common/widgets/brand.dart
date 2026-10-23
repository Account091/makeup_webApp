import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Circular gold monogram used as the studio's logo mark.
class BrandMark extends StatelessWidget {
  final double size;
  final bool onDark;
  const BrandMark({super.key, this.size = 40, this.onDark = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: BrandColors.goldGradient,
        boxShadow: [
          BoxShadow(
            color: BrandColors.gold.withValues(alpha: onDark ? 0.35 : 0.25),
            blurRadius: size * 0.4,
            offset: Offset(0, size * 0.08),
          ),
        ],
      ),
      padding: EdgeInsets.all(size * 0.06),
      child: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.55),
            width: size > 48 ? 1.4 : 1,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          'P',
          style: AppTheme.serif(
            size: size * 0.5,
            weight: FontWeight.w700,
            color: Colors.white,
            height: 1.05,
          ),
        ),
      ),
    );
  }
}

/// "Makeovers by Prachi" wordmark: serif name + small tracked caps.
class BrandWordmark extends StatelessWidget {
  final bool onDark;
  final double size;
  final String caption;
  final CrossAxisAlignment align;
  const BrandWordmark({
    super.key,
    this.onDark = false,
    this.size = 20,
    this.caption = 'STUDIO CONSOLE',
    this.align = CrossAxisAlignment.start,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: align,
      children: [
        Text(
          'Makeovers by Prachi',
          maxLines: 1,
          overflow: TextOverflow.fade,
          softWrap: false,
          style: AppTheme.serif(
            size: size,
            weight: FontWeight.w600,
            color: onDark ? Colors.white : BrandColors.plumInk,
            height: 1.15,
          ),
        ),
        if (caption.isNotEmpty) ...[
          SizedBox(height: size * 0.18),
          Text(
            caption,
            style: TextStyle(
              fontSize: (size * 0.48).clamp(9.0, 13.0),
              letterSpacing: 2.2,
              fontWeight: FontWeight.w700,
              color: onDark ? BrandColors.goldBright : BrandColors.gold,
            ),
          ),
        ],
      ],
    );
  }
}

/// Full-screen branded loader (between login and the shell).
class BrandSplash extends StatelessWidget {
  final String? message;
  const BrandSplash({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BrandColors.ivory,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const BrandMark(size: 64),
            const SizedBox(height: 18),
            const BrandWordmark(size: 22, align: CrossAxisAlignment.center),
            const SizedBox(height: 28),
            const SizedBox(
              width: 120,
              child: LinearProgressIndicator(minHeight: 2),
            ),
            if (message != null) ...[
              const SizedBox(height: 14),
              Text(message!, style: Theme.of(context).textTheme.bodySmall),
            ],
          ],
        ),
      ),
    );
  }
}
