import { NextRequest, NextResponse } from 'next/server';
import {
  getMaintenanceConfig,
  updateMaintenanceConfig,
  getFeatureKillSwitches,
  updateFeatureKillSwitches,
} from '../../../../lib/core/health/maintenance-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const maintenance = getMaintenanceConfig();
  const killSwitches = getFeatureKillSwitches();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: {
      maintenance,
      killSwitches,
    },
  });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    if (body.type === 'MAINTENANCE') {
      const updated = updateMaintenanceConfig(body.config || {});
      return NextResponse.json({ success: true, data: updated, requestId: ctx.requestId });
    }
    if (body.type === 'KILL_SWITCH') {
      const updated = updateFeatureKillSwitches(body.switches || {});
      return NextResponse.json({ success: true, data: updated, requestId: ctx.requestId });
    }
    return NextResponse.json({ success: false, error: 'Invalid update type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
