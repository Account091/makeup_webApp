import { NextRequest, NextResponse } from 'next/server';
import { getActiveIncidents, createIncident, updateIncidentStatus } from '../../../../lib/core/incidents/incident-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const incidents = getActiveIncidents();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: incidents,
  });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    if (body.action === 'UPDATE_STATUS') {
      const updated = updateIncidentStatus(body.incidentId, body.status);
      return NextResponse.json({ success: Boolean(updated), data: updated, requestId: ctx.requestId });
    }

    const newIncident = createIncident({
      severity: body.severity || 'SEV3',
      summary: body.summary || 'Operational Incident',
      affectedServices: body.affectedServices || [],
      ownerUid: body.ownerUid,
      requestIds: body.requestIds,
    });

    return NextResponse.json({ success: true, data: newIncident, requestId: ctx.requestId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
