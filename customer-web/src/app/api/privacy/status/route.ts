import { NextRequest, NextResponse } from 'next/server';
import { getPrivacyHealthStatus, getActivePrivacyIncidents } from '../../../../lib/core/privacy/privacy-incident';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const health = getPrivacyHealthStatus();
  const incidents = getActivePrivacyIncidents();
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: { health, incidents } });
}
