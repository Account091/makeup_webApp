import React from "react";
import OrganizationSettingsScreen from "../../../components/marketplace/OrganizationSettingsScreen";

export const metadata = {
  title: "Organization Settings & Policies | Multi-Tenant Portal",
  description: "Manage tenant business profile, deposit percentage, cancellation policies, and payment VPA settings.",
};

export default function SettingsPage() {
  return <OrganizationSettingsScreen />;
}
