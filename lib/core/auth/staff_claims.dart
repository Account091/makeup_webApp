/// Organisation ID every staff account must carry in its custom claims.
const String kOrgId = 'makeovers_by_prachi';

const Set<String> kStaffRoles = {'owner', 'admin', 'super_admin'};

class StaffAccess {
  final bool granted;
  final String? role;

  /// Why access was refused (null when granted).
  final String? reason;

  const StaffAccess.granted(this.role) : granted = true, reason = null;
  const StaffAccess.denied(this.reason) : granted = false, role = null;
}

/// Pure check of Firebase ID-token custom claims.
///
/// Access requires `role` in {owner, admin, super_admin} and
/// `orgId == 'makeovers_by_prachi'` (super_admin needs no orgId).
StaffAccess evaluateStaffClaims(Map<String, dynamic>? claims) {
  if (claims == null) return const StaffAccess.denied('No custom claims');
  final role = claims['role'];
  if (role is! String || !kStaffRoles.contains(role)) {
    return const StaffAccess.denied('Account has no staff role');
  }
  if (role == 'super_admin') return StaffAccess.granted(role);
  if (claims['orgId'] != kOrgId) {
    return const StaffAccess.denied(
      'Account belongs to a different organisation',
    );
  }
  return StaffAccess.granted(role);
}
