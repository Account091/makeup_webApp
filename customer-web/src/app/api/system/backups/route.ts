import { NextRequest, NextResponse } from 'next/server';
import { createFirestoreBackup, verifyBackup, reconcileFinancialBackup, getBackupManifests, getBackupPolicy } from '../../../../lib/core/backup/backup-engine';
import { extractRequestContext } from '../../../../lib/core/observability/request-context';

export async function GET(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  const manifests = getBackupManifests();
  const policy = getBackupPolicy();
  return NextResponse.json({ success: true, requestId: ctx.requestId, data: { policy, manifests } });
}

export async function POST(req: NextRequest) {
  const ctx = extractRequestContext(req.headers);
  try {
    const body = await req.json();
    const action = body.action || 'CREATE';

    if (action === 'CREATE') {
      const backup = createFirestoreBackup(body.type || 'MANUAL');
      return NextResponse.json({ success: true, requestId: ctx.requestId, data: backup });
    }
    if (action === 'VERIFY') {
      const result = verifyBackup(body.backupId);
      return NextResponse.json({ success: result.verified, requestId: ctx.requestId, data: result });
    }
    if (action === 'RECONCILE') {
      const result = reconcileFinancialBackup(body.backupId);
      return NextResponse.json({ success: true, requestId: ctx.requestId, data: result });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
