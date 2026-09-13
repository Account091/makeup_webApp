import {
  createOrGetConversation,
  attachBookingToConversation,
  isUserAuthorizedForConversation,
  sendMessage,
  screenMessageText,
  createSystemMessage,
  markConversationRead,
  blockConversation,
  reportConversation,
  getAuthorizedConversations,
  getMessagesForConversation,
  conversationsStore,
} from "../src/lib/marketplace/chat-engine";
import { generateAIChatDraft, screenMessageSafety } from "../src/lib/ai/marketplace-chat-ai";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export async function runV86ChatEngineTests() {
  console.log("=================================================");
  console.log("RUNNING V8.6 CUSTOMER ↔ ARTIST CHAT TESTS");
  console.log("=================================================\n");

  // 1. Conversation Creation Test (Pre-booking Inquiry)
  console.log("[Test 1] Testing Pre-Booking Conversation Creation...");
  const conv1 = createOrGetConversation({
    organizationId: "org-jaipur-royal-glam",
    customerId: "cust-test-99",
    artistId: "artist-101",
    listingId: "list-jaipur-bridal-01",
    createdFrom: "MARKETPLACE_PROFILE",
  });

  assert(conv1.conversationId.startsWith("conv-"), "Invalid conversation ID");
  assert(conv1.bookingId === null, "Pre-booking conversation must have null bookingId");
  assert(conv1.createdFrom === "MARKETPLACE_PROFILE", "Creation source mismatch");
  console.log("  ✓ Pre-booking conversation created successfully.");

  // 2. Participant Authorization Validation Test
  console.log("\n[Test 2] Testing Participant Authorization & Isolation...");
  const isCustAuth = isUserAuthorizedForConversation(conv1, "cust-test-99", "CUSTOMER");
  const isArtistAuth = isUserAuthorizedForConversation(conv1, "artist-101", "ARTIST");
  const isIntruderAuth = isUserAuthorizedForConversation(conv1, "cust-intruder", "CUSTOMER");

  assert(isCustAuth === true, "Customer participant must be authorized");
  assert(isArtistAuth === true, "Artist participant must be authorized");
  assert(isIntruderAuth === false, "Intruder customer must NOT be authorized");
  console.log("  ✓ Participant isolation enforced (Intruder Customer B rejected).");

  // 3. Post-Booking Conversation Attachment Test
  console.log("\n[Test 3] Testing Post-Booking Conversation Linking...");
  const updatedConv = attachBookingToConversation({
    conversationId: conv1.conversationId,
    bookingId: "bk-confirm-999",
    requestingUserId: "cust-test-99",
  });

  assert(updatedConv.bookingId === "bk-confirm-999", "Booking ID not linked");
  console.log("  ✓ Post-booking relationship attached securely to conversation.");

  // 4. Message Sending & Ledger Persistence Test
  console.log("\n[Test 4] Testing Message Sending & Unread Counters...");
  const msg1 = sendMessage({
    conversationId: conv1.conversationId,
    senderType: "CUSTOMER",
    senderId: "cust-test-99",
    text: "Can we add hair draping for 3 bridesmaids?",
  });

  assert(msg1.messageId.startsWith("msg-"), "Invalid message ID");
  assert(msg1.status === "DELIVERED", "Message status should be DELIVERED");
  assert(conv1.unreadForArtist > 0, "Unread count for artist must increment");
  console.log(`  ✓ Message sent successfully: "${msg1.text}"`);

  // 5. Safety Moderation Screening Test
  console.log("\n[Test 5] Testing Safety Moderation Evasion Screening...");
  const phoneResult = screenMessageText("Call me at 9876543210 for offline payment");
  const emailResult = screenMessageText("Email me at secret@gmail.com");
  const cleanResult = screenMessageText("Looking forward to the bridal makeup session!");

  assert(phoneResult.flagged === true && phoneResult.reason === "PHONE_EVASION_DETECTED", "Phone evasion not flagged");
  assert(emailResult.flagged === true && emailResult.reason === "EMAIL_EVASION_DETECTED", "Email evasion not flagged");
  assert(cleanResult.flagged === false, "Clean text falsely flagged");
  console.log("  ✓ Evasion screening correctly flagged phone/email bypass attempts.");

  // 6. System Message Generation Test
  console.log("\n[Test 6] Testing System Event Message Generation...");
  const sysMsg = createSystemMessage(conv1.conversationId, "CONSULTATION_SCHEDULED", "Consultation scheduled for 2026-10-01.");

  assert(sysMsg.senderType === "PLATFORM", "System message sender must be PLATFORM");
  assert(sysMsg.systemEventType === "CONSULTATION_SCHEDULED", "System event type mismatch");
  console.log(`  ✓ System event created: ${sysMsg.text}`);

  // 7. Read Receipts Update Test
  console.log("\n[Test 7] Testing Read Receipts & Unread Counter Reset...");
  markConversationRead(conv1.conversationId, "artist-101", "ARTIST");
  assert(conv1.unreadForArtist === 0, "Artist unread counter must reset to 0");
  console.log("  ✓ Read receipts updated and unread count reset.");

  // 8. Blocking & Reporting Test
  console.log("\n[Test 8] Testing Conversation Blocking & Reporting...");
  const report = reportConversation({
    conversationId: conv1.conversationId,
    reportedBy: "cust-test-99",
    reason: "HARASSMENT",
    description: "Testing report flow",
  });
  assert(report.status === "PENDING", "Report status should be PENDING");

  const block = blockConversation({
    conversationId: conv1.conversationId,
    blockedBy: "cust-test-99",
    blockType: "BLOCKED_BY_CUSTOMER",
    reason: "Blocked by user request",
  });
  assert(block.conversationId === conv1.conversationId, "Block conversationId mismatch");
  assert(conv1.status === "BLOCKED", "Conversation status must be BLOCKED");
  console.log("  ✓ Report & Block actions recorded successfully.");

  // 9. AI Draft Suggestion Mode & Human Handoff Test
  console.log("\n[Test 9] Testing AI Draft Recommendations & Human Handoff Triggers...");
  const conv2 = createOrGetConversation({
    organizationId: "org-jaipur-royal-glam",
    customerId: "cust-ai-test",
    artistId: "artist-101",
  });

  const aiNormal = generateAIChatDraft("What is your price for bridal makeup?", conv2.conversationId, "AI_SUGGEST");
  assert(aiNormal.aiMode === "AI_SUGGEST", "AI mode mismatch");
  assert(aiNormal.draftText.includes("₹25,000"), "AI draft price text missing");

  const aiHandoff = generateAIChatDraft("I want a full refund due to a complaint", conv2.conversationId, "AI_SUGGEST");
  assert(aiHandoff.handoffTriggered === true, "AI must trigger human handoff on complaint/refund");
  assert(conv2.status === "HUMAN_HANDOFF", "Conversation status must change to HUMAN_HANDOFF");
  console.log("  ✓ AI Assistant generated draft and successfully escalated sensitive query to HUMAN_HANDOFF.");

  console.log("\n=================================================");
  console.log("ALL V8.6 CUSTOMER ↔ ARTIST CHAT TESTS PASSED SUCCESSFULLY! 🎯");
  console.log("=================================================\n");
}
