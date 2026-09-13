import { NextRequest, NextResponse } from "next/server";
import {
  getOrganizationOnboardingChecklist,
  calculateMarketplaceReadinessScore,
  updateOnboardingChecklist,
  getAiOnboardingGuidance,
} from "../../../../lib/marketplace/tenant-onboarding-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const authUid = searchParams.get("authUid");

    if (!orgId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, orgId);
    const checklist = getOrganizationOnboardingChecklist(orgId);
    const readiness = calculateMarketplaceReadinessScore(orgId);
    const guidance = getAiOnboardingGuidance(orgId);

    return NextResponse.json({
      success: true,
      checklist,
      readiness,
      aiAdvice: guidance.aiAdvice,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch onboarding data" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { organizationId, authUid, updatedChecklist } = body;

    if (!organizationId || !authUid || !updatedChecklist) {
      return NextResponse.json({ success: false, error: "Missing organizationId, authUid, or updatedChecklist" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);
    const checklist = updateOnboardingChecklist(organizationId, updatedChecklist);
    const readiness = calculateMarketplaceReadinessScore(organizationId);

    return NextResponse.json({ success: true, checklist, readiness });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update onboarding checklist" }, { status: 403 });
  }
}
