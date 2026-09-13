import { NextRequest, NextResponse } from 'next/server';
import { getSystemAlerts, acknowledgeAlert } from '../../../../lib/core/incidents/incident-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const alerts = getSystemAlerts();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: alerts,
  });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const { alertId } = body;
    if (!alertId) {
      return NextResponse.json({ success: false, error: 'alertId is required' }, { status: 400 });
    }
    const acked = acknowledgeAlert(alertId);
    return NextResponse.json({ success: acked, requestId: ctx.requestId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
