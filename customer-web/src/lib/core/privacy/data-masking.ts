/**
 * Data Masking Utilities — V9.1
 */

export function maskPhone(phone: string): string {
  if (phone.length < 6) return '******';
  return phone.substring(0, phone.length - 4).replace(/./g, '*') + phone.substring(phone.length - 4);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '****@****';
  const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : '**';
  return `${maskedLocal}@${domain}`;
}

export function maskPaymentReference(ref: string): string {
  if (ref.length <= 4) return '****';
  return '****' + ref.substring(ref.length - 4);
}

export function maskSensitiveId(id: string): string {
  if (id.length <= 3) return '•••';
  return '•'.repeat(id.length - 3) + id.substring(id.length - 3);
}
