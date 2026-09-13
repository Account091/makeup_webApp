/**
 * File Upload Security & MIME Hardening — V9.0
 */

import { FileUploadPolicy } from '../system-types';

export const PAYMENT_PROOF_POLICY: FileUploadPolicy = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  restrictedPathPrefixes: ['/payments/proofs/'],
};

export const GENERAL_MEDIA_POLICY: FileUploadPolicy = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
  restrictedPathPrefixes: ['/media/'],
};

export function validateFileUpload(params: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  policy: FileUploadPolicy;
  destinationPath: string;
}): { valid: boolean; error?: string } {
  const { filename, mimeType, sizeBytes, policy, destinationPath } = params;

  // Size check
  if (sizeBytes > policy.maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit (${(policy.maxSizeBytes / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  // MIME check
  if (!policy.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type '${mimeType}' is not allowed`,
    };
  }

  // Extension check
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (!policy.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' does not match allowed extensions`,
    };
  }

  // Path check
  if (destinationPath.includes('..') || destinationPath.includes('//')) {
    return {
      valid: false,
      error: 'Invalid directory path traversal attempt',
    };
  }

  return { valid: true };
}
