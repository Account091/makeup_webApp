/**
 * Canonical Permission Definition & Role Access Matrix — V9.0
 */

export type AppPermission =
  | 'bookings.read'
  | 'bookings.create'
  | 'bookings.update'
  | 'payments.read'
  | 'payments.verify'
  | 'finance.read'
  | 'finance.adjust'
  | 'staff.manage'
  | 'analytics.read'
  | 'marketplace.manage'
  | 'risk.manage';

export const ROLE_PERMISSION_MATRIX: Record<string, AppPermission[]> = {
  SUPER_ADMIN: [
    'bookings.read',
    'bookings.create',
    'bookings.update',
    'payments.read',
    'payments.verify',
    'finance.read',
    'finance.adjust',
    'staff.manage',
    'analytics.read',
    'marketplace.manage',
    'risk.manage',
  ],
  ORGANIZATION_ADMIN: [
    'bookings.read',
    'bookings.create',
    'bookings.update',
    'payments.read',
    'payments.verify',
    'finance.read',
    'staff.manage',
    'analytics.read',
  ],
  ARTIST: [
    'bookings.read',
    'bookings.update',
    'payments.read',
    'analytics.read',
  ],
  CUSTOMER: [
    'bookings.read',
    'bookings.create',
    'payments.read',
  ],
  FINANCE_OFFICER: [
    'bookings.read',
    'payments.read',
    'payments.verify',
    'finance.read',
    'finance.adjust',
    'analytics.read',
  ],
};

export function hasPermission(role: string, permission: AppPermission): boolean {
  const perms = ROLE_PERMISSION_MATRIX[role] || [];
  return perms.includes(permission);
}
