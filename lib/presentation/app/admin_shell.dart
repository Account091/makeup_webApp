import 'dart:async';

import 'package:animations/animations.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_theme.dart';
import '../../data/admin/admin_repositories.dart';
import '../common/widgets/admin_widgets.dart';
import '../features/bookings/bookings_screen.dart';
import '../features/calendar/views/calendar_screen.dart';
import '../features/customers/views/customer_crm_screen.dart';
import '../features/dashboard/views/admin_dashboard_screen.dart';
import '../features/notifications/views/notifications_screen.dart';
import '../features/payment/views/admin_payment_verification_screen.dart';
import '../features/services/views/admin_services_screen.dart';
import '../features/settings/views/settings_screen.dart';

enum AdminSection {
  dashboard(
    'Dashboard',
    Icons.space_dashboard_outlined,
    Icons.space_dashboard_rounded,
    'Your studio at a glance',
  ),
  bookings(
    'Bookings',
    Icons.event_note_outlined,
    Icons.event_note_rounded,
    'Every booking from the website, live',
  ),
  payments(
    'Payments',
    Icons.verified_outlined,
    Icons.verified_rounded,
    'Verify UPI deposits to confirm dates',
  ),
  calendar(
    'Calendar',
    Icons.calendar_month_outlined,
    Icons.calendar_month_rounded,
    'Holds, bookings and blocked dates',
  ),
  services(
    'Services',
    Icons.auto_awesome_outlined,
    Icons.auto_awesome_rounded,
    'What clients can book on the website',
  ),
  customers(
    'Customers',
    Icons.people_alt_outlined,
    Icons.people_alt_rounded,
    'Everyone who has booked with you',
  ),
  settings(
    'Settings',
    Icons.tune_outlined,
    Icons.tune_rounded,
    'Business details used by the website',
  ),
  notifications(
    'Notifications',
    Icons.notifications_none_rounded,
    Icons.notifications_rounded,
    'Activity from the website',
  );

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final String subtitle;
  const AdminSection(this.label, this.icon, this.selectedIcon, this.subtitle);
}

const _mobilePrimary = [
  AdminSection.dashboard,
  AdminSection.bookings,
  AdminSection.payments,
  AdminSection.calendar,
];
const _mobileMore = [
  AdminSection.services,
  AdminSection.customers,
  AdminSection.settings,
  AdminSection.notifications,
];

/// Single shell: owns the only AppBar; builds only the active page and
/// cross-fades between sections.
class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  AdminSection _section = AdminSection.dashboard;

  final _awaitingCount = ValueNotifier<int>(0);
  final _unreadCount = ValueNotifier<int>(0);
  final _subs = <StreamSubscription<dynamic>>[];

  @override
  void initState() {
    super.initState();
    final repos = context.read<AdminRepositories>();
    _subs.add(
      repos.bookings.watchAwaitingVerification().listen(
        (l) => _awaitingCount.value = l.length,
        onError: (_) {},
      ),
    );
    _subs.add(
      repos.notifications.watchUnreadCount().listen(
        (n) => _unreadCount.value = n,
        onError: (_) {},
      ),
    );
  }

  @override
  void dispose() {
    for (final s in _subs) {
      s.cancel();
    }
    _awaitingCount.dispose();
    _unreadCount.dispose();
    super.dispose();
  }

  void _go(AdminSection s) {
    if (s == _section) return;
    setState(() => _section = s);
  }

  Future<void> _signOut() async {
    final ok = await confirmDialog(
      context,
      title: 'Sign out?',
      message: 'You will need your password to sign in again.',
      confirmLabel: 'Sign out',
      icon: Icons.logout_rounded,
    );
    if (!ok) return;
    try {
      await FirebaseAuth.instance.signOut();
    } catch (e) {
      if (mounted) showErrorSnack(context, e);
    }
  }

  Widget _page(AdminSection s) {
    switch (s) {
      case AdminSection.dashboard:
        return AdminDashboardScreen(
          onOpenPayments: () => _go(AdminSection.payments),
          onOpenBookings: () => _go(AdminSection.bookings),
          onOpenCalendar: () => _go(AdminSection.calendar),
        );
      case AdminSection.bookings:
        return const BookingsScreen();
      case AdminSection.payments:
        return const AdminPaymentVerificationScreen();
      case AdminSection.calendar:
        return const CalendarScreen();
      case AdminSection.services:
        return const AdminServicesScreen();
      case AdminSection.customers:
        return const CustomerCrmScreen();
      case AdminSection.settings:
        return const SettingsScreen();
      case AdminSection.notifications:
        return const NotificationsScreen();
    }
  }

  ValueNotifier<int>? _countFor(AdminSection s) => s == AdminSection.payments
      ? _awaitingCount
      : s == AdminSection.notifications
      ? _unreadCount
      : null;

  Widget _badged(AdminSection s, Widget icon) {
    final count = _countFor(s);
    if (count == null) return icon;
    return ValueListenableBuilder<int>(
      valueListenable: count,
      builder: (context, n, _) {
        return Badge(
          isLabelVisible: n > 0,
          label: Text(n > 99 ? '99+' : '$n'),
          child: icon,
        );
      },
    );
  }

  Widget _body() {
    return PageTransitionSwitcher(
      duration: motion(context, const Duration(milliseconds: 320)),
      transitionBuilder: (child, primary, secondary) => FadeThroughTransition(
        animation: primary,
        secondaryAnimation: secondary,
        fillColor: BrandColors.ivory,
        child: child,
      ),
      child: KeyedSubtree(key: ValueKey(_section), child: _page(_section)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 900;
    return wide ? _buildWide(context) : _buildMobile(context);
  }

  // ---------------------------------------------------------------- wide

  Widget _buildWide(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final session = context.read<AdminSession>();
    final theme = Theme.of(context);
    final subtitle = _section == AdminSection.dashboard
        ? DateFormat('EEEE, d MMMM').format(DateTime.now())
        : _section.subtitle;
    return Scaffold(
      backgroundColor: BrandColors.ivory,
      body: Row(
        children: [
          _SideNav(
            key: const ValueKey('side-nav'),
            extended: width >= 1200,
            selected: _section,
            onSelect: _go,
            badged: _badged,
            session: session,
            onSignOut: _signOut,
          ),
          Expanded(
            child: Scaffold(
              backgroundColor: BrandColors.ivory,
              appBar: AppBar(
                toolbarHeight: 84,
                titleSpacing: 28,
                title: SmoothSwitcher(
                  child: Column(
                    key: ValueKey(_section),
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_section.label, style: AppTheme.serif(size: 28)),
                      const SizedBox(height: 2),
                      Text(subtitle, style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
                actions: [
                  if (_section != AdminSection.notifications)
                    _BellButton(
                      count: _unreadCount,
                      onTap: () => _go(AdminSection.notifications),
                    ),
                  const SizedBox(width: 20),
                ],
              ),
              body: _body(),
            ),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------- mobile

  Future<void> _openMore() async {
    final session = context.read<AdminSession>();
    final picked = await showAppSheet<AdminSection>(
      context,
      builder: (ctx) => _MoreSheet(
        badged: _badged,
        session: session,
        current: _section,
        onSignOut: () {
          Navigator.pop(ctx);
          _signOut();
        },
      ),
    );
    if (picked != null) _go(picked);
  }

  Widget _buildMobile(BuildContext context) {
    final inMore = _mobileMore.contains(_section);
    final navIndex = inMore ? 4 : _mobilePrimary.indexOf(_section);
    final isHome = _section == AdminSection.dashboard;

    return Scaffold(
      backgroundColor: BrandColors.ivory,
      appBar: AppBar(
        toolbarHeight: 64,
        titleSpacing: 20,
        title: SmoothSwitcher(
          child: isHome
              ? const Row(
                  key: ValueKey('brand'),
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    BrandMark(size: 32),
                    SizedBox(width: 10),
                    Flexible(child: BrandWordmark(size: 18, caption: '')),
                  ],
                )
              : Text(
                  _section.label,
                  key: ValueKey(_section),
                  style: AppTheme.serif(size: 26),
                ),
        ),
        actions: [
          if (_section != AdminSection.notifications)
            _BellButton(
              count: _unreadCount,
              onTap: () => _go(AdminSection.notifications),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: _body(),
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: BrandColors.outline)),
        ),
        child: NavigationBar(
          selectedIndex: navIndex,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (i) {
            tapHaptic();
            if (i == 4) {
              _openMore();
            } else {
              _go(_mobilePrimary[i]);
            }
          },
          destinations: [
            for (final s in _mobilePrimary)
              NavigationDestination(
                icon: _badged(s, Icon(s.icon)),
                selectedIcon: _badged(s, Icon(s.selectedIcon)),
                label: s.label,
              ),
            NavigationDestination(
              icon: _badged(
                AdminSection.notifications,
                const Icon(Icons.grid_view_rounded),
              ),
              label: 'More',
            ),
          ],
        ),
      ),
    );
  }
}

class _BellButton extends StatelessWidget {
  final ValueListenable<int> count;
  final VoidCallback onTap;
  const _BellButton({required this.count, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: count,
      builder: (context, n, _) {
        return IconButton(
          tooltip: n > 0 ? 'Notifications ($n unread)' : 'Notifications',
          onPressed: onTap,
          style: IconButton.styleFrom(
            backgroundColor: Colors.white,
            side: const BorderSide(color: BrandColors.outline),
          ),
          icon: Badge(
            isLabelVisible: n > 0,
            smallSize: 8,
            label: null,
            child: const Icon(Icons.notifications_none_rounded),
          ),
        );
      },
    );
  }
}

class _SideNav extends StatelessWidget {
  final bool extended;
  final AdminSection selected;
  final ValueChanged<AdminSection> onSelect;
  final Widget Function(AdminSection, Widget) badged;
  final AdminSession session;
  final VoidCallback onSignOut;

  const _SideNav({
    super.key,
    required this.extended,
    required this.selected,
    required this.onSelect,
    required this.badged,
    required this.session,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    final w = extended ? 256.0 : 88.0;
    return AnimatedContainer(
      duration: motion(context, const Duration(milliseconds: 250)),
      width: w,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF3A1233), BrandColors.plumDeep],
        ),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(
                extended ? 22 : 0,
                24,
                extended ? 16 : 0,
                28,
              ),
              child: extended
                  ? const Row(
                      children: [
                        BrandMark(size: 40, onDark: true),
                        SizedBox(width: 12),
                        Expanded(
                          child: BrandWordmark(
                            onDark: true,
                            size: 17,
                            caption: 'STUDIO CONSOLE',
                          ),
                        ),
                      ],
                    )
                  : const Center(child: BrandMark(size: 40, onDark: true)),
            ),
            if (extended)
              const Padding(
                padding: EdgeInsets.fromLTRB(24, 0, 0, 8),
                child: Text(
                  'MENU',
                  style: TextStyle(
                    color: Color(0x80FFFFFF),
                    fontSize: 10.5,
                    letterSpacing: 2,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.symmetric(horizontal: extended ? 14 : 12),
                children: [
                  for (final s in AdminSection.values)
                    _NavItem(
                      section: s,
                      selected: s == selected,
                      extended: extended,
                      icon: badged(
                        s,
                        Icon(s == selected ? s.selectedIcon : s.icon),
                      ),
                      onTap: () => onSelect(s),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: extended
                  ? Container(
                      padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.07),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.08),
                        ),
                      ),
                      child: Row(
                        children: [
                          InitialsAvatar(name: session.firstName, size: 36),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  session.email,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12.5,
                                  ),
                                ),
                                Text(
                                  session.roleLabel,
                                  style: const TextStyle(
                                    color: BrandColors.goldBright,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: 'Sign out',
                            onPressed: onSignOut,
                            color: Colors.white70,
                            icon: const Icon(Icons.logout_rounded, size: 20),
                          ),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        Tooltip(
                          message: session.email,
                          child: InitialsAvatar(
                            name: session.firstName,
                            size: 36,
                          ),
                        ),
                        const SizedBox(height: 6),
                        IconButton(
                          tooltip: 'Sign out',
                          onPressed: onSignOut,
                          color: Colors.white70,
                          icon: const Icon(Icons.logout_rounded, size: 20),
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

class _NavItem extends StatefulWidget {
  final AdminSection section;
  final bool selected;
  final bool extended;
  final Widget icon;
  final VoidCallback onTap;
  const _NavItem({
    required this.section,
    required this.selected,
    required this.extended,
    required this.icon,
    required this.onTap,
  });

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final sel = widget.selected;
    final fg = sel
        ? Colors.white
        : Colors.white.withValues(alpha: _hover ? 0.92 : 0.66);
    final bg = sel
        ? Colors.white.withValues(alpha: 0.12)
        : Colors.white.withValues(alpha: _hover ? 0.05 : 0);
    final item = AnimatedContainer(
      duration: motion(context, const Duration(milliseconds: 200)),
      margin: const EdgeInsets.only(bottom: 4),
      height: widget.extended ? 46 : 52,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Stack(
        children: [
          AnimatedPositioned(
            duration: motion(context, const Duration(milliseconds: 220)),
            left: 0,
            top: sel ? 12 : 23,
            bottom: sel ? 12 : 23,
            width: 3,
            child: Container(
              decoration: BoxDecoration(
                color: sel ? BrandColors.goldBright : Colors.transparent,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
          Positioned.fill(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: widget.extended ? 14 : 0,
              ),
              child: Row(
                mainAxisAlignment: widget.extended
                    ? MainAxisAlignment.start
                    : MainAxisAlignment.center,
                children: [
                  IconTheme(
                    data: IconThemeData(
                      color: sel ? BrandColors.goldBright : fg,
                      size: 22,
                    ),
                    child: widget.icon,
                  ),
                  if (widget.extended) ...[
                    const SizedBox(width: 14),
                    Text(
                      widget.section.label,
                      style: TextStyle(
                        color: fg,
                        fontSize: 14,
                        fontWeight: sel ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
    return Semantics(
      button: true,
      selected: sel,
      label: widget.section.label,
      excludeSemantics: true,
      onTap: widget.onTap,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hover = true),
        onExit: (_) => setState(() => _hover = false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTap,
          child: widget.extended
              ? item
              : Tooltip(
                  message: widget.section.label,
                  preferBelow: false,
                  child: item,
                ),
        ),
      ),
    );
  }
}

class _MoreSheet extends StatelessWidget {
  final Widget Function(AdminSection, Widget) badged;
  final AdminSession session;
  final AdminSection current;
  final VoidCallback onSignOut;
  const _MoreSheet({
    required this.badged,
    required this.session,
    required this.current,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('More', style: AppTheme.serif(size: 22)),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.75,
            children: [
              for (final s in _mobileMore)
                AppCard(
                  semanticLabel: s.label,
                  padding: const EdgeInsets.all(14),
                  borderColor: s == current ? BrandColors.plum : null,
                  onTap: () {
                    tapHaptic();
                    Navigator.pop(context, s);
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      badged(
                        s,
                        IconTile(icon: s.selectedIcon, size: 36, iconSize: 19),
                      ),
                      Text(s.label, style: theme.textTheme.titleSmall),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          AppCard(
            shadow: false,
            padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
            child: Row(
              children: [
                InitialsAvatar(name: session.firstName, size: 40),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.email,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall,
                      ),
                      Text(session.roleLabel, style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: onSignOut,
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('Sign out'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
