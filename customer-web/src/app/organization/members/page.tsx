import React from "react";
import OrganizationMembersScreen from "../../../components/marketplace/OrganizationMembersScreen";

export const metadata = {
  title: "Organization Staff & Permissions | Multi-Tenant Portal",
  description: "Manage team memberships, send staff invitations, and view role permission matrix.",
};

export default function MembersPage() {
  return <OrganizationMembersScreen />;
}
