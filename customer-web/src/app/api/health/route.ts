import { NextRequest, NextResponse } from 'next/server';
import { runRuntimeHealthChecks } from '../../../lib/core/health/health-checker';
import { extractRequestContext } from '../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const health = runRuntimeHealthChecks();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: health,
  });
}
