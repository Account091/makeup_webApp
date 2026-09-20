/**
 * V10.5 Channel Selection & Preference Resolution Engine
 */

import { CommChannel, CommPurpose, CommMessageType, CommunicationProfile } from './comm-types';

export function selectCommunicationChannel(params: {
  purpose: CommPurpose;
  messageType: CommMessageType;
  profile: CommunicationProfile;
  whatsappAvailable?: boolean;
}): { selectedChannel: CommChannel; fallbackChannel?: CommChannel; allowed: boolean; reason?: string } {
  const { purpose, messageType, profile, whatsappAvailable = true } = params;

  // 1. Consent Check
  if (messageType === 'MARKETING' && !profile.marketingPreferences.enabled) {
    return {
      selectedChannel: 'PORTAL',
      allowed: false,
      reason: 'Marketing communication blocked by customer opt-out preference.',
    };
  }

  // 2. Quiet Hours Check (Non-critical messages delayed or routed to Portal)
  if (profile.quietHoursActive && messageType !== 'SECURITY' && messageType !== 'TRANSACTIONAL') {
    return {
      selectedChannel: 'PORTAL',
      allowed: false,
      reason: 'Non-essential message blocked during quiet hours.',
    };
  }

  // 3. Channel Availability & Preference Selection
  let primary: CommChannel = profile.preferredChannel;
  let fallback: CommChannel | undefined = 'EMAIL';

  if (primary === 'WHATSAPP' && !whatsappAvailable) {
    primary = 'EMAIL'; // Fallback to Email if WhatsApp API is unavailable
    fallback = 'PORTAL';
  }

  if (!profile.allowedChannels.includes(primary)) {
    primary = profile.allowedChannels[0] || 'PORTAL';
  }

  return {
    selectedChannel: primary,
    fallbackChannel: fallback,
    allowed: true,
  };
}
