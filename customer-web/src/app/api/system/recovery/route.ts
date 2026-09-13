import { NextRequest, NextResponse } from 'next/server';
import { requestRecovery, approveRecovery, executeRecovery, runRecoveryDrill, getRecoveryPlans } from '../../../../lib/core/backup/recovery-manager';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const plans = getRecoveryPlans();
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: plans });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const action = body.action || 'REQUEST';

    if (action === 'REQUEST') {
      const plan = requestRecovery({
        backupId: body.backupId, requestedBy: body.requestedBy || 'admin',
        reason: body.reason || 'Recovery request', scope: body.scope || 'FULL',
        targetCollections: body.targetCollections, targetDocumentIds: body.targetDocumentIds,
      });
      return NextResponse.json({ success: true, requestId: ctx.requestId, data: plan });
    }
    if (action === 'APPROVE') {
      const approved = approveRecovery(body.recoveryId, body.approvedBy || 'admin');
      return NextResponse.json({ success: Boolean(approved), requestId: ctx.requestId, data: approved });
    }
    if (action === 'EXECUTE') {
      const executed = executeRecovery(body.recoveryId);
      return NextResponse.json({ success: Boolean(executed), requestId: ctx.requestId, data: executed });
    }
    if (action === 'DRILL') {
      const report = runRecoveryDrill(body.backupId);
      return NextResponse.json({ success: true, requestId: ctx.requestId, data: report });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
