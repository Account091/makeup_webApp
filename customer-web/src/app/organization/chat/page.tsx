import React from "react";
import OrganizationChatInboxScreen from "../../../components/marketplace/OrganizationChatInboxScreen";

export const metadata = {
  title: "Organization Chat Oversight | Platform Admin",
  description: "Monitor organization-level conversations, audit moderation alerts, and handle support escalations.",
};

export default function OrganizationChatPage() {
  return <OrganizationChatInboxScreen />;
}
