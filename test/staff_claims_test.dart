import 'package:flutter_test/flutter_test.dart';
import 'package:makeup_webapp/core/auth/staff_claims.dart';

void main() {
  test('owner/admin with correct orgId are granted', () {
    for (final role in ['owner', 'admin']) {
      final r = evaluateStaffClaims({
        'role': role,
        'orgId': 'makeovers_by_prachi',
      });
      expect(r.granted, isTrue, reason: role);
      expect(r.role, role);
    }
  });

  test('super_admin needs no orgId', () {
    expect(evaluateStaffClaims({'role': 'super_admin'}).granted, isTrue);
    expect(
      evaluateStaffClaims({'role': 'super_admin', 'orgId': 'other'}).granted,
      isTrue,
    );
  });

  test('wrong or missing orgId is denied', () {
    expect(evaluateStaffClaims({'role': 'owner'}).granted, isFalse);
    expect(
      evaluateStaffClaims({'role': 'admin', 'orgId': 'other_org'}).granted,
      isFalse,
    );
  });

  test('non-staff roles, missing role, null claims are denied', () {
    expect(evaluateStaffClaims(null).granted, isFalse);
    expect(evaluateStaffClaims({}).granted, isFalse);
    expect(
      evaluateStaffClaims({
        'role': 'customer',
        'orgId': 'makeovers_by_prachi',
      }).granted,
      isFalse,
    );
    expect(
      evaluateStaffClaims({
        'role': 'OWNER',
        'orgId': 'makeovers_by_prachi',
      }).granted,
      isFalse,
    );
    expect(evaluateStaffClaims({'admin': true}).granted, isFalse);
  });
}
