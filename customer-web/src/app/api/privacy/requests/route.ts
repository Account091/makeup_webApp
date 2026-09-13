import { NextRequest, NextResponse } from 'next/server';
import { submitDataRequest, getDataRequests } from '../../../../lib/core/privacy/data-request-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const customerId = req.nextUrl.searchParams.get('customerId');
  const requests = getDataRequests(customerId || undefined);
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: requests });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const request = submitDataRequest({ customerId: body.customerId, type: body.type });
    return NextResponse.json({ success: true, requestId: ctx.requestId, data: request });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
