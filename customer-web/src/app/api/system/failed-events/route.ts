import { NextRequest, NextResponse } from 'next/server';
import { getDLQEvents, updateFailedEventStatus } from '../../../../lib/core/resilience/dead-letter-queue';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const events = getDLQEvents();

  return NextResponse.json({
    success: true,
    requestId: ctx.requestId,
    data: events,
  });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const { eventId, action } = body;
    if (action === 'RETRY') {
      const updated = updateFailedEventStatus(eventId, 'RETRYING');
      return NextResponse.json({ success: Boolean(updated), data: updated, requestId: ctx.requestId });
    }
    if (action === 'RESOLVE') {
      const updated = updateFailedEventStatus(eventId, 'RESOLVED');
      return NextResponse.json({ success: Boolean(updated), data: updated, requestId: ctx.requestId });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
