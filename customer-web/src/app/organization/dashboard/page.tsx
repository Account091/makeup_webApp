import React from "react";
import OrganizationAdminDashboard from "../../../components/marketplace/OrganizationAdminDashboard";

export const metadata = {
  title: "Organization Admin Portal | Multi-Tenant Dashboard",
  description: "Manage tenant listings, earnings, commission ledgers, and team memberships.",
};

export default function OrganizationDashboardPage() {
  return <OrganizationAdminDashboard />;
}
