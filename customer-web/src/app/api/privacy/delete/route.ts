import { NextRequest, NextResponse } from 'next/server';
import { createDeletionPlan } from '../../../../lib/core/privacy/data-deletion';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const plan = createDeletionPlan(body.customerId);
    return NextResponse.json({ success: true, requestId: ctx.requestId, data: plan });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
