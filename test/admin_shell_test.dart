import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/core/theme/app_theme.dart';
import 'package:makeup_webapp/data/admin/admin_repositories.dart';
import 'package:makeup_webapp/presentation/app/admin_shell.dart';
import 'package:makeup_webapp/presentation/common/widgets/admin_widgets.dart';

import 'fixtures.dart';

Future<void> _pumpShell(WidgetTester tester, Size size) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);

  final db = FakeFirebaseFirestore();
  await db
      .collection('bookings')
      .doc('MBP-7K2QXD')
      .set(contractBooking(bookingId: 'MBP-7K2QXD'));
  await tester.pumpWidget(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(
          value: AdminRepositories(
            db,
            proofDownloadUrl: (p) async =>
                throw Exception('no storage in tests'),
          ),
        ),
        RepositoryProvider.value(
          value: const AdminSession(uid: 'u', email: 'o@x.in', role: 'owner'),
        ),
      ],
      child: MaterialApp(theme: AppTheme.light, home: const AdminShell()),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('wide layout: side nav with all sections, one AppBar', (
    tester,
  ) async {
    await _pumpShell(tester, const Size(1400, 900));
    expect(find.byKey(const ValueKey('side-nav')), findsOneWidget);
    for (final label in [
      'Dashboard',
      'Bookings',
      'Payments',
      'Calendar',
      'Services',
      'Customers',
      'Settings',
      'Notifications',
    ]) {
      expect(find.text(label), findsWidgets, reason: label);
    }
    expect(find.byType(AppBar), findsOneWidget);
    expect(find.text('Awaiting verification'), findsOneWidget);
    expect(find.text('Needs your attention'), findsOneWidget);

    await tester.tap(find.text('Payments'));
    await tester.pumpAndSettle();
    // Review pane for the only queued payment.
    expect(find.textContaining('MBP-7K2QXD'), findsWidgets);
    expect(find.text('Approve'), findsOneWidget);
    expect(find.text('Reject'), findsOneWidget);
    expect(find.text('EXPECTED DEPOSIT'), findsOneWidget);
    expect(find.byType(AppBar), findsOneWidget);
  });

  testWidgets('mobile layout: 5-item bar and More menu', (tester) async {
    await _pumpShell(tester, const Size(400, 800));
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.byType(NavigationDestination), findsNWidgets(5));

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    for (final label in [
      'Services',
      'Customers',
      'Settings',
      'Notifications',
      'Sign out',
    ]) {
      expect(find.text(label), findsOneWidget, reason: label);
    }
    await tester.tap(find.text('Customers'));
    await tester.pumpAndSettle();
    expect(find.text('Aditi Rathore'), findsOneWidget);
    expect(find.byType(AppBar), findsOneWidget);
  });
}
