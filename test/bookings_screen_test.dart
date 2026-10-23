import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/core/theme/app_theme.dart';
import 'package:makeup_webapp/data/admin/admin_repositories.dart';
import 'package:makeup_webapp/presentation/common/widgets/admin_widgets.dart';
import 'package:makeup_webapp/presentation/features/bookings/bookings_screen.dart';

import 'fixtures.dart';

void main() {
  testWidgets('BookingsScreen lists live bookings, filters and searches', (
    tester,
  ) async {
    final db = FakeFirebaseFirestore();
    await db
        .collection('bookings')
        .doc('MBP-AAAAAA')
        .set(
          contractBooking(
            bookingId: 'MBP-AAAAAA',
            fullName: 'Aditi',
            status: 'CONFIRMED',
          ),
        );
    await db
        .collection('bookings')
        .doc('MBP-BBBBBB')
        .set(
          contractBooking(
            bookingId: 'MBP-BBBBBB',
            fullName: 'Neha',
            phone: '9000000001',
            status: 'PAYMENT_PROOF_SUBMITTED',
          ),
        );

    await tester.pumpWidget(
      MultiRepositoryProvider(
        providers: [
          RepositoryProvider.value(value: AdminRepositories(db)),
          RepositoryProvider.value(
            value: const AdminSession(uid: 'u', email: 'o@x.in', role: 'owner'),
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.light,
          home: const Scaffold(body: BookingsScreen()),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Aditi'), findsOneWidget);
    expect(find.text('Neha'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('filter-awaitingVerification')));
    await tester.pumpAndSettle();
    expect(find.text('Aditi'), findsNothing);
    expect(find.text('Neha'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('filter-all')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'MBP-AAA');
    await tester.pumpAndSettle();
    expect(find.text('Aditi'), findsOneWidget);
    expect(find.text('Neha'), findsNothing);
  });
}
