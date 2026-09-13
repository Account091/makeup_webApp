import { NextRequest, NextResponse } from 'next/server';
import { grantConsent, revokeConsent, getCustomerConsents } from '../../../../lib/core/privacy/consent-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const customerId = req.nextUrl.searchParams.get('customerId') || 'customer_101';
  const consents = getCustomerConsents(customerId);
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: consents });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    if (body.action === 'REVOKE') {
      const revoked = revokeConsent(body.customerId, body.type);
      return NextResponse.json({ success: Boolean(revoked), requestId: ctx.requestId, data: revoked });
    }
    const consent = grantConsent({ customerId: body.customerId, type: body.type, version: body.version || '2026-09-v1', source: body.source });
    return NextResponse.json({ success: true, requestId: ctx.requestId, data: consent });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
