import {
  MarketplaceConversation,
  MarketplaceMessage,
  ChatReport,
  ChatBlock,
  MessageType,
  SenderType,
  SystemEventType,
  ChatBlockType,
  ReportReason,
  ChatAnalyticsMetric,
} from "./marketplace-types";
import { getOrganizationMembers } from "./tenant-members-engine";

// In-Memory Data Stores for Conversations & Messages
export const conversationsStore: MarketplaceConversation[] = [
  {
    conversationId: "conv-jdp-01",
    organizationId: "org-jodhpur-luxe",
    customerId: "cust-101",
    artistId: "artist-103",
    bookingId: "bk-jdp-901",
    listingId: "list-jodhpur-luxe-01",
    status: "ACTIVE",
    createdFrom: "BOOKING_LINKED",
    lastMessageAt: "2026-09-12T10:15:00Z",
    lastMessageText: "Looking forward to your Marwari bridal makeup on Oct 18!",
    unreadForCustomer: 0,
    unreadForArtist: 1,
    createdAt: "2026-09-10T08:00:00Z",
    updatedAt: "2026-09-12T10:15:00Z",
  },
  {
    conversationId: "conv-jpr-02",
    organizationId: "org-jaipur-royal-glam",
    customerId: "cust-102",
    artistId: "artist-101",
    bookingId: null,
    listingId: "list-jaipur-bridal-01",
    status: "ACTIVE",
    createdFrom: "MARKETPLACE_PROFILE",
    lastMessageAt: "2026-09-13T09:30:00Z",
    lastMessageText: "Do you provide traditional Rajasthani jewelry draping?",
    unreadForCustomer: 0,
    unreadForArtist: 1,
    createdAt: "2026-09-13T09:30:00Z",
    updatedAt: "2026-09-13T09:30:00Z",
  },
];

export const messagesStore: MarketplaceMessage[] = [
  {
    messageId: "msg-jdp-001",
    conversationId: "conv-jdp-01",
    organizationId: "org-jodhpur-luxe",
    senderType: "PLATFORM",
    senderId: "system",
    messageType: "SYSTEM",
    text: "Booking BK-JDP-901 confirmed for 2026-10-18 in Jodhpur.",
    systemEventType: "BOOKING_CREATED",
    status: "READ",
    readAt: "2026-09-10T08:05:00Z",
    createdAt: "2026-09-10T08:00:00Z",
  },
  {
    messageId: "msg-jdp-002",
    conversationId: "conv-jdp-01",
    organizationId: "org-jodhpur-luxe",
    senderType: "ARTIST",
    senderId: "artist-103",
    messageType: "TEXT",
    text: "Looking forward to your Marwari bridal makeup on Oct 18!",
    status: "DELIVERED",
    createdAt: "2026-09-12T10:15:00Z",
  },
  {
    messageId: "msg-jpr-001",
    conversationId: "conv-jpr-02",
    organizationId: "org-jaipur-royal-glam",
    senderType: "CUSTOMER",
    senderId: "cust-102",
    messageType: "TEXT",
    text: "Do you provide traditional Rajasthani jewelry draping?",
    status: "DELIVERED",
    createdAt: "2026-09-13T09:30:00Z",
  },
];

export const chatReportsStore: ChatReport[] = [];
export const chatBlocksStore: ChatBlock[] = [];
export const analyticsMetricsStore: ChatAnalyticsMetric[] = [
  {
    organizationId: "org-jaipur-royal-glam",
    totalConversations: 15,
    totalMessages: 84,
    firstResponseTimeAvgMinutes: 12,
    chatToBookingConversionRate: 42.5,
    updatedAt: "2026-09-13T00:00:00Z",
  },
];

// Helper: Check if user is an authorized participant in a conversation
export function isUserAuthorizedForConversation(
  conversation: MarketplaceConversation,
  userId: string,
  userRole: "CUSTOMER" | "ARTIST" | "ORGANIZATION_ADMIN" | "PLATFORM_ADMIN"
): boolean {
  if (userRole === "PLATFORM_ADMIN") return true;
  if (userRole === "CUSTOMER") {
    return conversation.customerId === userId;
  }
  if (userRole === "ARTIST") {
    return conversation.artistId === userId;
  }
  if (userRole === "ORGANIZATION_ADMIN") {
    const orgMembers = getOrganizationMembers(conversation.organizationId);
    return orgMembers.some((m) => m.uid === userId && m.status === "ACTIVE");
  }
  return false;
}

// 1. Create or Find Existing Conversation
export function createOrGetConversation(params: {
  organizationId: string;
  customerId: string;
  artistId: string;
  listingId?: string;
  bookingId?: string;
  createdFrom?: "MARKETPLACE_PROFILE" | "BOOKING_LINKED" | "DIRECT";
}): MarketplaceConversation {
  // Check if conversation already exists between this customer and artist/org
  let existing = conversationsStore.find(
    (c) =>
      c.customerId === params.customerId &&
      c.artistId === params.artistId &&
      c.organizationId === params.organizationId
  );

  if (existing) {
    if (params.bookingId && !existing.bookingId) {
      existing.bookingId = params.bookingId;
      existing.updatedAt = new Date().toISOString();
    }
    return existing;
  }

  const now = new Date().toISOString();
  const newConversation: MarketplaceConversation = {
    conversationId: `conv-${Date.now()}`,
    organizationId: params.organizationId,
    customerId: params.customerId,
    artistId: params.artistId,
    bookingId: params.bookingId || null,
    listingId: params.listingId || null,
    status: "ACTIVE",
    createdFrom: params.createdFrom || (params.bookingId ? "BOOKING_LINKED" : "MARKETPLACE_PROFILE"),
    lastMessageAt: now,
    lastMessageText: "Conversation started",
    unreadForCustomer: 0,
    unreadForArtist: 0,
    createdAt: now,
    updatedAt: now,
  };

  conversationsStore.push(newConversation);

  // Generate initial system message if booking-linked
  if (params.bookingId) {
    createSystemMessage(newConversation.conversationId, "BOOKING_CREATED", `Booking ${params.bookingId} attached to chat.`);
  }

  return newConversation;
}

// 2. Attach Booking to Conversation (Post-Booking Protection)
export function attachBookingToConversation(params: {
  conversationId: string;
  bookingId: string;
  requestingUserId: string;
}): MarketplaceConversation {
  const conversation = conversationsStore.find((c) => c.conversationId === params.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Verify participant
  if (conversation.customerId !== params.requestingUserId && conversation.artistId !== params.requestingUserId) {
    throw new Error("Unauthorized to modify this conversation");
  }

  conversation.bookingId = params.bookingId;
  conversation.updatedAt = new Date().toISOString();

  createSystemMessage(conversation.conversationId, "BOOKING_CREATED", `Booking ${params.bookingId} successfully confirmed.`);
  return conversation;
}

// 3. Simple Rate Limiting Check (Max 15 msgs / minute)
const userMessageTimestamps: Record<string, number[]> = {};

function isRateLimited(senderId: string): boolean {
  const now = Date.now();
  const history = userMessageTimestamps[senderId] || [];
  const recent = history.filter((t) => now - t < 60000);
  recent.push(now);
  userMessageTimestamps[senderId] = recent;
  return recent.length > 15;
}

// 4. Basic Safety & Evasion Screening
export function screenMessageText(text: string): { flagged: boolean; reason?: string } {
  // Detect phone numbers (e.g. 9876543210 or +91 98765 43210)
  const phonePattern = /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{5}[\s-]?\d{5}\b/;
  if (phonePattern.test(text)) {
    return { flagged: true, reason: "PHONE_EVASION_DETECTED" };
  }

  // Detect email addresses
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(text)) {
    return { flagged: true, reason: "EMAIL_EVASION_DETECTED" };
  }

  // Detect off-platform payment prompts
  const paymentEvasionPattern = /pay\s*(cash|outside|direct|gpay|paytm)\b/i;
  if (paymentEvasionPattern.test(text)) {
    return { flagged: true, reason: "OFF_PLATFORM_PAYMENT_PROMPT" };
  }

  return { flagged: false };
}

// 5. Send Message
export function sendMessage(params: {
  conversationId: string;
  senderType: SenderType;
  senderId: string;
  messageType?: MessageType;
  text: string;
  mediaUrl?: string;
  userRole?: "CUSTOMER" | "ARTIST" | "ORGANIZATION_ADMIN" | "PLATFORM_ADMIN";
}): MarketplaceMessage {
  const conversation = conversationsStore.find((c) => c.conversationId === params.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.status === "CLOSED" || conversation.status === "BLOCKED") {
    throw new Error(`Cannot send message. Conversation is ${conversation.status}`);
  }

  // Check rate limits
  if (isRateLimited(params.senderId)) {
    throw new Error("Rate limit exceeded. Please wait a moment before sending more messages.");
  }

  // Verify Block status
  const isBlocked = chatBlocksStore.some((b) => b.conversationId === params.conversationId);
  if (isBlocked) {
    throw new Error("Conversation is blocked.");
  }

  // Screening
  const screening = screenMessageText(params.text);

  const now = new Date().toISOString();
  const message: MarketplaceMessage = {
    messageId: `msg-${Date.now()}`,
    conversationId: params.conversationId,
    organizationId: conversation.organizationId,
    senderType: params.senderType,
    senderId: params.senderId,
    messageType: params.messageType || (params.mediaUrl ? "IMAGE" : "TEXT"),
    text: params.text,
    mediaUrl: params.mediaUrl,
    status: "DELIVERED",
    createdAt: now,
    flaggedForModeration: screening.flagged,
    moderationReason: screening.reason,
  };

  messagesStore.push(message);

  // Update Conversation state & Unread counts
  conversation.lastMessageAt = now;
  conversation.lastMessageText = params.mediaUrl ? "📷 Image attached" : params.text;
  conversation.updatedAt = now;

  if (params.senderType === "CUSTOMER") {
    conversation.unreadForArtist += 1;
  } else if (params.senderType === "ARTIST" || params.senderType === "ORGANIZATION") {
    conversation.unreadForCustomer += 1;
  }

  return message;
}

// 6. Create Structured System Message
export function createSystemMessage(
  conversationId: string,
  eventType: SystemEventType,
  detailsText: string
): MarketplaceMessage {
  const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const now = new Date().toISOString();
  const msg: MarketplaceMessage = {
    messageId: `msg-sys-${Date.now()}`,
    conversationId,
    organizationId: conversation.organizationId,
    senderType: "PLATFORM",
    senderId: "system",
    messageType: "SYSTEM",
    text: detailsText,
    systemEventType: eventType,
    status: "READ",
    createdAt: now,
  };

  messagesStore.push(msg);
  conversation.lastMessageAt = now;
  conversation.lastMessageText = `[System] ${detailsText}`;
  conversation.updatedAt = now;

  return msg;
}

// 7. Mark Conversation Read
export function markConversationRead(conversationId: string, userId: string, userRole: "CUSTOMER" | "ARTIST"): boolean {
  const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
  if (!conversation) return false;

  const now = new Date().toISOString();
  if (userRole === "CUSTOMER" && conversation.customerId === userId) {
    conversation.unreadForCustomer = 0;
  } else if (userRole === "ARTIST" && conversation.artistId === userId) {
    conversation.unreadForArtist = 0;
  }

  // Update messages readAt status
  messagesStore.forEach((m) => {
    if (m.conversationId === conversationId && m.senderId !== userId && !m.readAt) {
      m.readAt = now;
      m.status = "READ";
    }
  });

  return true;
}

// 8. Block Conversation
export function blockConversation(params: {
  conversationId: string;
  blockedBy: string;
  blockType: ChatBlockType;
  reason?: string;
}): ChatBlock {
  const conversation = conversationsStore.find((c) => c.conversationId === params.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  conversation.status = "BLOCKED";
  conversation.updatedAt = new Date().toISOString();

  const block: ChatBlock = {
    blockId: `block-${Date.now()}`,
    conversationId: params.conversationId,
    blockedBy: params.blockedBy,
    blockType: params.blockType,
    reason: params.reason,
    createdAt: new Date().toISOString(),
  };

  chatBlocksStore.push(block);
  return block;
}

// 9. Report Conversation
export function reportConversation(params: {
  conversationId: string;
  reportedBy: string;
  reason: ReportReason;
  description: string;
}): ChatReport {
  const report: ChatReport = {
    reportId: `report-${Date.now()}`,
    conversationId: params.conversationId,
    reportedBy: params.reportedBy,
    reason: params.reason,
    description: params.description,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  chatReportsStore.push(report);
  return report;
}

// 10. Retrieve Authorized Conversations
export function getAuthorizedConversations(
  userId: string,
  userRole: "CUSTOMER" | "ARTIST" | "ORGANIZATION_ADMIN" | "PLATFORM_ADMIN",
  statusFilter?: string
): MarketplaceConversation[] {
  let list = conversationsStore.filter((c) => isUserAuthorizedForConversation(c, userId, userRole));
  if (statusFilter && statusFilter !== "ALL") {
    list = list.filter((c) => c.status === statusFilter);
  }
  return list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

// 11. Retrieve Message History
export function getMessagesForConversation(
  conversationId: string,
  requestingUserId: string,
  userRole: "CUSTOMER" | "ARTIST" | "ORGANIZATION_ADMIN" | "PLATFORM_ADMIN"
): MarketplaceMessage[] {
  const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (!isUserAuthorizedForConversation(conversation, requestingUserId, userRole)) {
    throw new Error("Unauthorized to access conversation history");
  }

  return messagesStore
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// 12. Track Conversion Analytics
export function trackChatConversion(conversationId: string, bookingId: string): void {
  const conversation = conversationsStore.find((c) => c.conversationId === conversationId);
  if (!conversation) return;

  const metric = analyticsMetricsStore.find((m) => m.organizationId === conversation.organizationId);
  if (metric) {
    metric.chatToBookingConversionRate = Number(
      (((metric.totalConversations * (metric.chatToBookingConversionRate / 100) + 1) / metric.totalConversations) * 100).toFixed(1)
    );
    metric.updatedAt = new Date().toISOString();
  }
}
