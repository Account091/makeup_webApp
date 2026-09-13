import { NextRequest, NextResponse } from 'next/server';
import { getDependencyStatuses } from '../../../../lib/core/health/dependency-monitor';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const dependencies = getDependencyStatuses();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: dependencies,
  });
}
