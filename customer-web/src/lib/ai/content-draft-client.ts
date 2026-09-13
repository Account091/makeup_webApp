import { db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { ContentDraftType, DraftStatus } from "./types";

export interface ContentDraftPayload {
  contentType: ContentDraftType;
  platform?: string;
  serviceId?: string;
  campaignId?: string;
  topic: string;
  tone?: string;
  language?: string;
  keywords?: string[];
  callToAction?: string;
  authPayload?: {
    uid?: string;
    role?: string;
    organizationId?: string;
  };
}

export interface GeneratedContentStructure {
  title: string;
  body: string;
  caption: string;
  hashtags: string[];
  seoTitle?: string;
  seoDescription?: string;
  callToAction: string;
  sourceReferences: string[];
  requiresHumanApproval: boolean;
}

export interface ContentDraftResponseData {
  success: boolean;
  draftId: string;
  contentType: ContentDraftType;
  platform: string;
  generatedContent: GeneratedContentStructure;
  status: DraftStatus;
  providerUsed: string;
  modelUsed: string;
  requestId: string;
  error?: string;
}

export interface ContentDraftDocument {
  draftId: string;
  organizationId: string;
  createdBy: string;
  feature: "CONTENT_DRAFTER";
  contentType: ContentDraftType;
  platform: string;
  serviceId?: string;
  campaignId?: string;
  promptSummary: string;
  generatedContent: GeneratedContentStructure;
  sourceReferences: string[];
  status: DraftStatus;
  aiProvider: string;
  aiModel: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  contentAttribution: {
    campaignId?: string;
    sourcePlatform: string;
    medium: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    createdViaAi: boolean;
  };
}

/**
 * Client helper to generate AI content draft via API route.
 */
export async function generateContentDraft(
  payload: ContentDraftPayload
): Promise<ContentDraftResponseData> {
  const response = await fetch("/api/ai/content-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate content draft.");
  }

  return data;
}

/**
 * Persists an AI content draft into Firestore collection `contentDrafts/{draftId}`
 */
export async function saveContentDraftToFirestore(
  draftData: ContentDraftResponseData,
  createdBy: string = "admin_user"
): Promise<ContentDraftDocument> {
  const now = new Date().toISOString();
  const draftDocRef = doc(db, "contentDrafts", draftData.draftId);

  const docPayload: ContentDraftDocument = {
    draftId: draftData.draftId,
    organizationId: "makeovers_by_prachi",
    createdBy,
    feature: "CONTENT_DRAFTER",
    contentType: draftData.contentType,
    platform: draftData.platform,
    promptSummary: draftData.generatedContent.title,
    generatedContent: draftData.generatedContent,
    sourceReferences: draftData.generatedContent.sourceReferences || [],
    status: "AI_GENERATED",
    aiProvider: draftData.providerUsed,
    aiModel: draftData.modelUsed,
    requestId: draftData.requestId,
    createdAt: now,
    updatedAt: now,
    contentAttribution: {
      sourcePlatform: draftData.platform,
      medium: "social_ai_draft",
      utmSource: "ai_content_drafter",
      utmMedium: draftData.platform.toLowerCase(),
      utmCampaign: `ai_draft_${draftData.contentType.toLowerCase()}`,
      createdViaAi: true,
    },
  };

  try {
    await setDoc(draftDocRef, docPayload);
  } catch (err) {
    console.warn("[ContentDraftClient] Non-blocking Firestore save warning:", err);
  }

  return docPayload;
}

/**
 * Updates the approval status of a content draft in Firestore.
 */
export async function updateContentDraftStatus(
  draftId: string,
  newStatus: DraftStatus,
  approvedBy: string = "admin_prachi"
): Promise<void> {
  const now = new Date().toISOString();
  const draftDocRef = doc(db, "contentDrafts", draftId);

  const updates: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === "APPROVED") {
    updates.approvedBy = approvedBy;
    updates.approvedAt = now;
  } else if (newStatus === "PUBLISHED") {
    updates.publishedAt = now;
  }

  try {
    await updateDoc(draftDocRef, updates);
  } catch (err) {
    console.warn("[ContentDraftClient] Failed to update draft status:", err);
  }
}
