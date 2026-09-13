import { NextResponse } from 'next/server';
import { 
  getOrganizationVerification, 
  getVerificationChecklist,
  submitOrganizationVerification,
  approveOrganizationVerification,
  rejectOrganizationVerification 
} from '../../../../lib/marketplace/verification-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org-jaipur-royal-glam';

    const verification = getOrganizationVerification(orgId);
    const checklist = getVerificationChecklist(orgId);

    return NextResponse.json({
      success: true,
      verification,
      checklist
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, verificationType, evidencePaths, reviewedByUid, reason } = body;

    if (action === 'APPROVE') {
      const approved = approveOrganizationVerification({ organizationId, reviewedByUid });
      return NextResponse.json({ success: true, message: 'Organization verification approved.', verification: approved });
    }

    if (action === 'REJECT') {
      const rejected = rejectOrganizationVerification({ organizationId, reviewedByUid, reason });
      return NextResponse.json({ success: true, message: 'Organization verification rejected.', verification: rejected });
    }

    if (!organizationId || !verificationType || !evidencePaths) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: organizationId, verificationType, evidencePaths.' },
        { status: 400 }
      );
    }

    const record = submitOrganizationVerification({ organizationId, verificationType, evidencePaths });

    return NextResponse.json({
      success: true,
      message: 'Verification submitted for administrative review.',
      verification: record
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
