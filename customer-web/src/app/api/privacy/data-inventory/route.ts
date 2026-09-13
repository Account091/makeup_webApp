import { NextRequest, NextResponse } from 'next/server';
import { DATA_CLASSIFICATION_REGISTRY } from '../../../../lib/core/privacy/data-classification';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: DATA_CLASSIFICATION_REGISTRY });
}
