import { NextResponse } from 'next/server';
import { getTrustAlerts, resolveTrustAlert } from '../../../../lib/marketplace/trust-score-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || undefined;

    const alerts = getTrustAlerts(orgId);
    return NextResponse.json({ success: true, count: alerts.length, alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ success: false, error: 'Missing alertId parameter.' }, { status: 400 });
    }

    const alert = resolveTrustAlert(alertId);
    return NextResponse.json({ success: true, message: 'Trust alert resolved.', alert });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
