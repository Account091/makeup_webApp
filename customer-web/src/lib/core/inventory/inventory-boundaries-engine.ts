/**
 * V10.8 Inventory Security Boundaries, AI Guardrails & DR Reconciliation Engine
 * 
 * CORE BOUNDARY RULES:
 * 1. Client cannot directly mutate stock levels (onHand, reserved, available). Mutations occur strictly via append-only movements.
 * 2. Cross-tenant access is prohibited.
 * 3. AI cannot mutate stock, approve Purchase Orders, or alter supplier prices directly.
 * 4. DR Reconciliation rebuilds level state from authoritative movement history.
 */

import { InventoryLevel, InventoryMovement } from './inventory-types';
import { getAllMovements, getInventoryLevel } from './inventory-ledger-engine';

export interface GovernedInventoryOperationParams {
  action: 'UPDATE_STOCK' | 'APPROVE_PO' | 'MUTATE_SUPPLIER_PRICE';
  callerRole: 'CLIENT_BROWSER' | 'AI_ASSISTANT' | 'AUTHORIZED_ADMIN' | 'SYSTEM_WORKFLOW';
  organizationId: string;
  targetOrganizationId: string;
}

export function validateInventoryOperation(params: GovernedInventoryOperationParams): { allowed: boolean; reason: string } {
  // 1. Cross-Tenant Guard
  if (params.organizationId !== params.targetOrganizationId) {
    return {
      allowed: false,
      reason: 'TENANT_ISOLATION_VIOLATION: Cross-tenant inventory access denied',
    };
  }

  // 2. Client Direct Mutation Guard
  if (params.callerRole === 'CLIENT_BROWSER' && params.action === 'UPDATE_STOCK') {
    return {
      allowed: false,
      reason: 'SECURITY_VIOLATION: Direct client stock level mutation is prohibited. Use server movement functions.',
    };
  }

  // 3. AI Boundary Protection Guard
  if (params.callerRole === 'AI_ASSISTANT') {
    return {
      allowed: false,
      reason: 'AI_SAFETY_GUARD: AI is advisory only and cannot mutate stock, approve POs, or alter prices.',
    };
  }

  return { allowed: true, reason: 'AUTHORIZED' };
}

/**
 * Reconciles inventory level state from authoritative append-only movement ledger during Disaster Recovery.
 */
export function reconcileInventoryState(itemId: string, locationId: string): InventoryLevel {
  const movements = getAllMovements().filter(m => m.itemId === itemId);
  let computedOnHand = 0;

  for (const m of movements) {
    if (m.toLocationId === locationId) {
      if (m.movementType === 'RECEIPT' || m.movementType === 'TRANSFER_IN' || m.movementType === 'RETURN') {
        computedOnHand += m.quantity;
      } else if (m.movementType === 'ADJUSTMENT' && m.quantity > 0) {
        computedOnHand += m.quantity;
      }
    }

    if (m.fromLocationId === locationId) {
      if (m.movementType === 'SALE' || m.movementType === 'CONSUMPTION' || m.movementType === 'TRANSFER_OUT' || m.movementType === 'DAMAGE' || m.movementType === 'EXPIRY') {
        computedOnHand = Math.max(0, computedOnHand - m.quantity);
      } else if (m.movementType === 'ADJUSTMENT' && m.quantity < 0) {
        computedOnHand = Math.max(0, computedOnHand - Math.abs(m.quantity));
      }
    }
  }

  const level = getInventoryLevel(itemId, locationId);
  level.onHand = computedOnHand;
  level.available = Math.max(0, level.onHand - level.reserved - level.quarantined);
  level.updatedAt = new Date().toISOString();

  return level;
}
