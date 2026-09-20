import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';

import 'core/constants/app_colors.dart';
import 'core/constants/app_text_styles.dart';
import 'core/services/firebase_options.dart';
import 'data/repositories/booking_repository_impl.dart';
import 'data/repositories/service_repository_impl.dart';
import 'presentation/features/booking/bloc/booking_bloc.dart';
import 'presentation/features/booking/bloc/booking_event.dart';
import 'presentation/features/booking/views/booking_inquiry_screen.dart';
import 'presentation/features/calendar/views/calendar_screen.dart';
import 'presentation/features/content/views/reels_manager_screen.dart';
import 'presentation/features/customers/views/customer_crm_screen.dart';
import 'presentation/features/dashboard/views/admin_dashboard_screen.dart';
import 'presentation/features/moderation/views/moderation_queue_screen.dart';
import 'presentation/features/services/bloc/service_bloc.dart';
import 'presentation/features/services/bloc/service_event.dart';
import 'presentation/features/services/views/service_catalog_screen.dart';
import 'presentation/features/settings/views/settings_screen.dart';

import 'presentation/features/booking/views/booking_status_screen.dart';
import 'presentation/features/whatsapp_automation/views/whatsapp_dashboard_screen.dart';
import 'presentation/features/customer_website/views/customer_home_screen.dart';
import 'presentation/features/auth/views/auth_screen.dart';
import 'presentation/features/payment/views/admin_payment_verification_screen.dart';

import 'core/services/firebase_messaging_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    await FirebaseMessagingService().initialize();
  } catch (e) {
    debugPrint('Firebase Initialization Notice: $e');
  }
  runApp(const MakeoversByPrachiApp());
}

class MakeoversByPrachiApp extends StatelessWidget {
  const MakeoversByPrachiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final bookingRepo = BookingRepositoryImpl();
    final serviceRepo = ServiceRepositoryImpl();

    return MultiBlocProvider(
      providers: [
        BlocProvider<BookingBloc>(
          create: (_) =>
              BookingBloc(repository: bookingRepo)..add(FetchBookingsEvent()),
        ),
        BlocProvider<ServiceBloc>(
          create: (_) =>
              ServiceBloc(repository: serviceRepo)..add(FetchServicesEvent()),
        ),
      ],
      child: MaterialApp(
        title: 'Makeovers by Prachi',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.roseGold,
            primary: AppColors.deepPlum,
            secondary: AppColors.roseGold,
            surface: AppColors.champagne,
          ),
          scaffoldBackgroundColor: AppColors.champagne,
        ),
        home: const MainNavigationWrapper(),
      ),
    );
  }
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _currentIndex = 1; // Default to Admin Dashboard
  bool _isSidebarCollapsed = false;

  final List<Widget> _pages = const [
    CustomerHomeScreen(), // 0
    AdminDashboardScreen(), // 1
    CalendarScreen(), // 2
    CustomerCrmScreen(), // 3
    SettingsScreen(), // 4
    ReelsManagerScreen(), // 5
    ModerationQueueScreen(), // 6
    WhatsappDashboardScreen(), // 7
    BookingStatusScreen(), // 8
    ServiceCatalogScreen(), // 9
    BookingInquiryScreen(), // 10
    AuthScreen(), // 11
    AdminPaymentVerificationScreen(), // 12
  ];

  static const Map<int, String> _screenTitles = {
    0: 'Customer Website Experience',
    1: 'Admin Operations Command Center',
    2: 'Master Availability Calendar',
    3: 'Customer CRM & Revenue Profiles',
    4: 'Business Settings & Distance Rules',
    5: 'Reels & Video Content Manager',
    6: 'Comments & Review Moderation',
    7: 'WhatsApp Cloud Automation Engine',
    8: 'Track Booking & Event Status',
    9: 'Bridal Services & Rates Catalog',
    10: 'Book Date Inquiries Wizard',
    11: 'Firebase Auth & Security Admin',
    12: 'UPI Payment Verification Queue',
  };

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 960;

    if (isDesktop) {
      return Scaffold(
        backgroundColor: AppColors.champagne,
        body: Row(
          children: [
            // Responsive Luxury Admin Sidebar
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: _isSidebarCollapsed ? 84 : 280,
              color: AppColors.deepPlum,
              child: Column(
                children: [
                  _buildDesktopSidebarHeader(),
                  const Divider(color: Color(0x33D4AF37), height: 1),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      children: [
                        _buildNavCategory('CORE OPERATIONS'),
                        _buildSidebarItem(
                          1,
                          'Admin Dashboard',
                          Icons.dashboard_outlined,
                        ),
                        _buildSidebarItem(
                          2,
                          'Master Calendar',
                          Icons.calendar_month_outlined,
                        ),
                        _buildSidebarItem(
                          12,
                          'Payment Queue',
                          Icons.verified_user_outlined,
                          badge: 'UPI',
                        ),

                        const SizedBox(height: 12),
                        _buildNavCategory('CLIENTS & PIPELINE'),
                        _buildSidebarItem(
                          3,
                          'Customer CRM',
                          Icons.people_alt_outlined,
                        ),
                        _buildSidebarItem(
                          8,
                          'Track Booking Status',
                          Icons.receipt_long_outlined,
                        ),
                        _buildSidebarItem(
                          10,
                          'Booking Wizard',
                          Icons.add_task_outlined,
                        ),

                        const SizedBox(height: 12),
                        _buildNavCategory('SERVICES & MEDIA'),
                        _buildSidebarItem(
                          9,
                          'Services Catalog',
                          Icons.grid_view_outlined,
                        ),
                        _buildSidebarItem(
                          5,
                          'Reels & Videos',
                          Icons.video_library_outlined,
                        ),
                        _buildSidebarItem(
                          6,
                          'Review Moderation',
                          Icons.rate_review_outlined,
                        ),

                        const SizedBox(height: 12),
                        _buildNavCategory('AUTOMATION & SYSTEM'),
                        _buildSidebarItem(
                          7,
                          'WhatsApp Engine',
                          Icons.chat_bubble_outline,
                        ),
                        _buildSidebarItem(
                          11,
                          'Auth & Security',
                          Icons.security_outlined,
                        ),
                        _buildSidebarItem(
                          4,
                          'Rules & Settings',
                          Icons.settings_outlined,
                        ),
                        _buildSidebarItem(
                          0,
                          'Customer Website',
                          Icons.storefront_outlined,
                          badge: 'Live',
                        ),
                      ],
                    ),
                  ),
                  const Divider(color: Color(0x33D4AF37), height: 1),
                  _buildDesktopSidebarFooter(),
                ],
              ),
            ),
            // Main Content Area
            Expanded(
              child: Container(
                color: AppColors.champagne,
                child: IndexedStack(index: _currentIndex, children: _pages),
              ),
            ),
          ],
        ),
      );
    }

    // Mobile / Tablet Navigation Shell
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        elevation: 1,
        title: Text(
          _screenTitles[_currentIndex] ?? 'Admin Portal',
          style: const TextStyle(
            color: AppColors.champagne,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Customer View',
            icon: const Icon(
              Icons.storefront_outlined,
              color: AppColors.roseGold,
            ),
            onPressed: () {
              setState(() => _currentIndex = 0);
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: Container(
          color: AppColors.deepPlum,
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1F0D16), Color(0xFF2A0D1E)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.roseGold.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.roseGold,
                              width: 1.5,
                            ),
                          ),
                          child: const Center(
                            child: Text(
                              'P',
                              style: TextStyle(
                                color: AppColors.roseGold,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Makeovers by Prachi',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTextStyles.headingTitle.copyWith(
                                  color: AppColors.roseGold,
                                  fontSize: 17,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Admin Operations Engine',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              _buildMobileDrawerSection('OPERATIONS'),
              _buildDrawerItem(1, 'Admin Dashboard', Icons.dashboard_outlined),
              _buildDrawerItem(
                2,
                'Master Calendar',
                Icons.calendar_month_outlined,
              ),
              _buildDrawerItem(
                12,
                'Payment Queue',
                Icons.verified_user_outlined,
              ),

              _buildMobileDrawerSection('CLIENTS & BOOKINGS'),
              _buildDrawerItem(3, 'Customer CRM', Icons.people_alt_outlined),
              _buildDrawerItem(
                8,
                'Track Booking Status',
                Icons.receipt_long_outlined,
              ),
              _buildDrawerItem(10, 'Booking Wizard', Icons.add_task_outlined),

              _buildMobileDrawerSection('CATALOG & MEDIA'),
              _buildDrawerItem(9, 'Services Catalog', Icons.grid_view_outlined),
              _buildDrawerItem(
                5,
                'Reels & Video Manager',
                Icons.video_library_outlined,
              ),
              _buildDrawerItem(
                6,
                'Review Moderation',
                Icons.rate_review_outlined,
              ),

              _buildMobileDrawerSection('AUTOMATION & SYSTEM'),
              _buildDrawerItem(
                7,
                'WhatsApp Automation',
                Icons.chat_bubble_outline,
              ),
              _buildDrawerItem(
                11,
                'Firebase Auth & Security',
                Icons.security_outlined,
              ),
              _buildDrawerItem(4, 'Settings & Rules', Icons.settings_outlined),
              _buildDrawerItem(
                0,
                'Customer Website',
                Icons.storefront_outlined,
              ),
            ],
          ),
        ),
      ),
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _getMobileBottomNavIndex(),
        onTap: (index) {
          if (index == 4) {
            _scaffoldKey.currentState?.openDrawer();
          } else {
            setState(() {
              switch (index) {
                case 0:
                  _currentIndex = 1; // Admin Dashboard
                  break;
                case 1:
                  _currentIndex = 2; // Calendar
                  break;
                case 2:
                  _currentIndex = 12; // Payments
                  break;
                case 3:
                  _currentIndex = 3; // CRM
                  break;
              }
            });
          }
        },
        selectedItemColor: AppColors.roseGold,
        unselectedItemColor: AppColors.mutedGray,
        backgroundColor: AppColors.deepPlum,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month_outlined),
            activeIcon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.verified_user_outlined),
            activeIcon: Icon(Icons.verified_user),
            label: 'Payments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_alt_outlined),
            activeIcon: Icon(Icons.people),
            label: 'CRM',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.menu), label: 'Modules'),
        ],
      ),
    );
  }

  int _getMobileBottomNavIndex() {
    switch (_currentIndex) {
      case 1:
        return 0;
      case 2:
        return 1;
      case 12:
        return 2;
      case 3:
        return 3;
      default:
        return 4; // Highlight "Modules" when on any secondary page
    }
  }

  Widget _buildDesktopSidebarHeader() {
    if (_isSidebarCollapsed) {
      return Container(
        height: 72,
        alignment: Alignment.center,
        child: IconButton(
          icon: const Icon(Icons.menu_open, color: AppColors.roseGold),
          tooltip: 'Expand Sidebar',
          onPressed: () => setState(() => _isSidebarCollapsed = false),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFD4AF37), Color(0xFFAA7C11)],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(
              child: Text(
                'P',
                style: TextStyle(
                  color: AppColors.deepPlum,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Makeovers by Prachi',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.headingTitle.copyWith(
                    color: AppColors.roseGold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Admin Command Center',
                  style: TextStyle(color: Colors.white60, fontSize: 10),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white70, size: 20),
            tooltip: 'Collapse Sidebar',
            onPressed: () => setState(() => _isSidebarCollapsed = true),
          ),
        ],
      ),
    );
  }

  Widget _buildNavCategory(String title) {
    if (_isSidebarCollapsed) {
      return const SizedBox(height: 6);
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 16, 4),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0x77D4AF37),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildSidebarItem(
    int index,
    String title,
    IconData icon, {
    String? badge,
  }) {
    final isSelected = _currentIndex == index;

    if (_isSidebarCollapsed) {
      return Tooltip(
        message: title,
        preferBelow: false,
        child: InkWell(
          onTap: () => setState(() => _currentIndex = index),
          child: Container(
            height: 48,
            margin: const EdgeInsets.symmetric(vertical: 3, horizontal: 12),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.roseGold.withValues(alpha: 0.2)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: isSelected
                  ? Border.all(color: AppColors.roseGold, width: 1)
                  : null,
            ),
            child: Center(
              child: Icon(
                icon,
                color: isSelected ? AppColors.roseGold : Colors.white70,
                size: 22,
              ),
            ),
          ),
        ),
      );
    }

    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        height: 44,
        margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 12),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.roseGold.withValues(alpha: 0.18)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: isSelected
              ? Border.all(
                  color: AppColors.roseGold.withValues(alpha: 0.6),
                  width: 1,
                )
              : null,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.roseGold : Colors.white70,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: isSelected ? AppColors.roseGold : Colors.white,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
            ),
            if (badge != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.roseGold.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: AppColors.roseGold,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDesktopSidebarFooter() {
    if (_isSidebarCollapsed) {
      return Container(
        height: 52,
        alignment: Alignment.center,
        child: const Icon(
          Icons.check_circle,
          color: AppColors.emeraldGreen,
          size: 16,
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: AppColors.emeraldGreen,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'Cloud Sync Active • V10.2',
              style: TextStyle(color: Colors.white54, fontSize: 11),
            ),
          ),
          TextButton(
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(40, 24),
            ),
            onPressed: () => setState(() => _currentIndex = 0),
            child: const Text(
              'View Site',
              style: TextStyle(color: AppColors.roseGold, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileDrawerSection(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0x77D4AF37),
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildDrawerItem(int index, String title, IconData icon) {
    final isSelected = _currentIndex == index;
    return ListTile(
      dense: true,
      leading: Icon(
        icon,
        color: isSelected ? AppColors.roseGold : Colors.white70,
        size: 20,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppColors.roseGold : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 13,
        ),
      ),
      selected: isSelected,
      onTap: () {
        setState(() => _currentIndex = index);
        Navigator.pop(context);
      },
    );
  }
}
