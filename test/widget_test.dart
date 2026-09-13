import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/data/repositories/booking_repository_impl.dart';
import 'package:makeup_webapp/data/repositories/service_repository_impl.dart';
import 'package:makeup_webapp/presentation/features/booking/bloc/booking_bloc.dart';
import 'package:makeup_webapp/presentation/features/booking/bloc/booking_event.dart';
import 'package:makeup_webapp/presentation/features/services/bloc/service_bloc.dart';
import 'package:makeup_webapp/presentation/features/services/bloc/service_event.dart';
import 'package:makeup_webapp/presentation/features/dashboard/views/admin_dashboard_screen.dart';
import 'package:makeup_webapp/presentation/features/customers/views/customer_crm_screen.dart';
import 'package:makeup_webapp/presentation/features/services/views/service_catalog_screen.dart';
import 'package:makeup_webapp/presentation/features/settings/views/settings_screen.dart';
import 'package:makeup_webapp/presentation/features/booking/views/booking_inquiry_screen.dart';

Widget createTestableWidget(Widget child) {
  final bookingRepo = BookingRepositoryImpl();
  final serviceRepo = ServiceRepositoryImpl();

  return MultiBlocProvider(
    providers: [
      BlocProvider<BookingBloc>(
        create: (_) => BookingBloc(repository: bookingRepo)..add(FetchBookingsEvent()),
      ),
      BlocProvider<ServiceBloc>(
        create: (_) => ServiceBloc(repository: serviceRepo)..add(FetchServicesEvent()),
      ),
    ],
    child: MaterialApp(
      home: child,
    ),
  );
}

void main() {
  testWidgets('AdminDashboardScreen renders dashboard widget', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(createTestableWidget(const AdminDashboardScreen()));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(AdminDashboardScreen), findsOneWidget);
  });

  testWidgets('CustomerCrmScreen renders CRM widget', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(createTestableWidget(const CustomerCrmScreen()));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(CustomerCrmScreen), findsOneWidget);
  });

  testWidgets('ServiceCatalogScreen renders catalog widget', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(createTestableWidget(const ServiceCatalogScreen()));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(ServiceCatalogScreen), findsOneWidget);
  });

  testWidgets('SettingsScreen renders settings widget', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(createTestableWidget(const SettingsScreen()));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(SettingsScreen), findsOneWidget);
  });

  testWidgets('BookingInquiryScreen renders inquiry widget', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(createTestableWidget(const BookingInquiryScreen()));
    await tester.pump(const Duration(seconds: 1));

    expect(find.byType(BookingInquiryScreen), findsOneWidget);
  });
}
