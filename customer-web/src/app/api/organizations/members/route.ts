import { NextRequest, NextResponse } from "next/server";
import {
  getOrganizationMembers,
  createOrganizationInvitation,
  getOrganizationInvitations,
  acceptOrganizationInvitation,
  deactivateMember,
} from "../../../../lib/marketplace/tenant-members-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";
import { hasOrganizationPermission } from "../../../../lib/marketplace/tenant-permissions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const authUid = searchParams.get("authUid");

    if (!orgId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, orgId);
    const members = getOrganizationMembers(orgId);
    const invitations = getOrganizationInvitations(orgId);

    return NextResponse.json({ success: true, members, invitations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch members" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, organizationId, authUid, inviteeEmail, assignedRole, invitationId, membershipId } = body;

    if (!organizationId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);

    if (action === "invite") {
      const canManageStaff = hasOrganizationPermission(authUid, organizationId, "staff.manage");
      if (!canManageStaff) {
        return NextResponse.json({ success: false, error: "Permission Denied: Requires 'staff.manage' permission." }, { status: 403 });
      }

      const invitation = createOrganizationInvitation({
        organizationId,
        inviteeEmail,
        assignedRole,
        invitedByUid: authUid,
      });
      return NextResponse.json({ success: true, invitation });
    } else if (action === "accept") {
      const newMembership = acceptOrganizationInvitation(invitationId, authUid);
      return NextResponse.json({ success: true, membership: newMembership });
    } else if (action === "deactivate") {
      const canManageStaff = hasOrganizationPermission(authUid, organizationId, "staff.manage");
      if (!canManageStaff) {
        return NextResponse.json({ success: false, error: "Permission Denied: Requires 'staff.manage' permission." }, { status: 403 });
      }

      const revoked = deactivateMember(membershipId);
      return NextResponse.json({ success: true, membership: revoked });
    } else {
      return NextResponse.json({ success: false, error: "Invalid action type" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Action failed" }, { status: 403 });
  }
}
