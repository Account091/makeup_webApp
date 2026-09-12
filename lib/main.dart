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
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    CustomerHomeScreen(),
    AdminDashboardScreen(),
    CalendarScreen(),
    CustomerCrmScreen(),
    SettingsScreen(),
    ReelsManagerScreen(),
    ModerationQueueScreen(),
    WhatsappDashboardScreen(),
    BookingStatusScreen(),
    ServiceCatalogScreen(),
    BookingInquiryScreen(),
    AuthScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: Container(
          color: AppColors.deepPlum,
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(color: Color(0xFF1F0D16)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Makeovers by Prachi',
                      style: AppTextStyles.headingTitle
                          .copyWith(color: AppColors.roseGold, fontSize: 20),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'V1.1 Automation Engine',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              _buildDrawerItem(0, 'Customer Website', Icons.web),
              _buildDrawerItem(8, 'Track Booking & PDF', Icons.receipt_long),
              const Divider(color: AppColors.lightBorder),
              _buildDrawerItem(1, 'Admin Dashboard', Icons.dashboard),
              _buildDrawerItem(2, 'Master Calendar', Icons.calendar_month),
              _buildDrawerItem(3, 'Customer CRM', Icons.people_alt),
              _buildDrawerItem(7, 'WhatsApp Automation', Icons.chat),
              _buildDrawerItem(4, 'Settings & Rules', Icons.settings),
              _buildDrawerItem(5, 'Reels & Content', Icons.video_library),
              _buildDrawerItem(6, 'Moderation Queue', Icons.rate_review),
              const Divider(color: AppColors.lightBorder),
              _buildDrawerItem(9, 'Services Catalog', Icons.grid_view),
              _buildDrawerItem(10, 'Book Date Wizard', Icons.add_task),
              _buildDrawerItem(11, 'Firebase Auth & FCM', Icons.security),
            ],
          ),
        ),
      ),
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex > 4 ? 0 : _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: AppColors.roseGold,
        unselectedItemColor: AppColors.mutedGray,
        backgroundColor: AppColors.deepPlum,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Website'),
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Admin'),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'CRM'),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(int index, String title, IconData icon) {
    final isSelected = _currentIndex == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppColors.roseGold : Colors.white70,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppColors.roseGold : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
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
