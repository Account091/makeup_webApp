/**
 * V10.8 Procurement, Reorder Recommendation & Supplier Engine
 * 
 * Manages reorder rules, purchase order lifecycle, goods receipts, partial shipments,
 * discrepancy detection, and idempotency protection.
 */

import {
  Supplier,
  SupplierProduct,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  GoodsReceiptStatus,
  ReorderRule,
  ReorderRecommendation,
} from './inventory-types';
import { getInventoryLevel, recordInventoryMovement } from './inventory-ledger-engine';

const suppliersStore = new Map<string, Supplier>();
const supplierProductsStore = new Map<string, SupplierProduct>();
const purchaseRequestsStore = new Map<string, PurchaseRequest>();
const purchaseOrdersStore = new Map<string, PurchaseOrder>();
const goodsReceiptsStore = new Map<string, GoodsReceipt>();
const reorderRulesStore = new Map<string, ReorderRule>();
const poIdempotencyKeysStore = new Map<string, string>(); // idempotencyKey -> PO ID

export function registerSupplier(supplier: Supplier): Supplier {
  suppliersStore.set(supplier.supplierId, supplier);
  return supplier;
}

export function registerSupplierProduct(sp: SupplierProduct): SupplierProduct {
  supplierProductsStore.set(sp.supplierProductId, sp);
  return sp;
}

export function registerReorderRule(rule: ReorderRule): ReorderRule {
  reorderRulesStore.set(rule.ruleId, rule);
  return rule;
}

/**
 * Calculates reorder recommendation based on available stock, lead times, safety stock, and MOQ.
 */
export function calculateReorderRecommendation(itemId: string, locationId: string): ReorderRecommendation {
  const level = getInventoryLevel(itemId, locationId);
  const rule = Array.from(reorderRulesStore.values()).find(
    r => r.itemId === itemId && r.locationId === locationId && r.active
  );

  const minStock = rule?.minimumStock || 5;
  const safetyStock = rule?.safetyStock || 2;
  const moq = rule?.minimumOrderQuantity || 10;
  const reorderPoint = rule?.reorderPoint || (minStock + safetyStock);

  let recQty = 0;
  let priority: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  let reason = 'Stock level healthy';

  if (level.available <= safetyStock) {
    priority = 'CRITICAL';
    reason = `Critical stockout risk: Available (${level.available}) <= Safety Stock (${safetyStock})`;
    recQty = Math.max(moq, (rule?.targetStock || 20) - level.available - level.incoming);
  } else if (level.available <= reorderPoint) {
    priority = 'HIGH';
    reason = `Reorder point breached: Available (${level.available}) <= Reorder Point (${reorderPoint})`;
    recQty = Math.max(moq, (rule?.targetStock || 20) - level.available - level.incoming);
  }

  // Find supplier for item
  const sp = Array.from(supplierProductsStore.values()).find(
    p => p.itemId === itemId && p.active
  );

  return {
    itemId,
    locationId,
    currentAvailable: level.available,
    reserved: level.reserved,
    incoming: level.incoming,
    recommendedQuantity: recQty,
    suggestedSupplierId: sp?.supplierId,
    reason,
    priority,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Creates an authoritative Purchase Order with server-side validation and idempotency protection.
 */
export function createPurchaseOrder(params: Omit<PurchaseOrder, 'purchaseOrderId' | 'status' | 'createdAt' | 'updatedAt'>): PurchaseOrder {
  if (params.idempotencyKey && poIdempotencyKeysStore.has(params.idempotencyKey)) {
    const existingPoId = poIdempotencyKeysStore.get(params.idempotencyKey)!;
    return purchaseOrdersStore.get(existingPoId)!;
  }

  const poId = `po_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Validate totals server-side
  let calculatedSubtotal = 0;
  const validatedItems = params.items.map(item => {
    const total = item.quantity * item.unitPrice;
    calculatedSubtotal += total;
    return {
      ...item,
      receivedQuantity: 0,
      totalPrice: total,
    };
  });

  const total = calculatedSubtotal + (params.tax || 0) + (params.shipping || 0) - (params.discount || 0);

  const po: PurchaseOrder = {
    ...params,
    purchaseOrderId: poId,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    total,
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  purchaseOrdersStore.set(poId, po);

  if (params.idempotencyKey) {
    poIdempotencyKeysStore.set(params.idempotencyKey, poId);
  }

  // Update incoming quantities for items
  for (const item of validatedItems) {
    const level = getInventoryLevel(item.itemId, 'STORAGE');
    level.incoming += item.quantity;
  }

  return po;
}

/**
 * Process goods receiving for a purchase order (supports complete and partial receipts).
 */
export function processGoodsReceipt(params: {
  purchaseOrderId: string;
  locationId: string;
  receivedBy: string;
  items: Array<{
    itemId: string;
    receivedQuantity: number;
    damagedQuantity?: number;
    expiredQuantity?: number;
    lotNumber?: string;
    expiryDate?: string;
  }>;
}): { receipt: GoodsReceipt; poStatus: PurchaseOrder['status'] } {
  const po = purchaseOrdersStore.get(params.purchaseOrderId);
  if (!po) {
    throw new Error(`Purchase Order '${params.purchaseOrderId}' not found.`);
  }

  let totalOrdered = 0;
  let totalReceived = 0;
  let hasDiscrepancy = false;
  let discrepancyReason = '';

  for (const recvItem of params.items) {
    const poItem = po.items.find(i => i.itemId === recvItem.itemId);
    if (poItem) {
      poItem.receivedQuantity += recvItem.receivedQuantity;
      totalOrdered += poItem.quantity;
      totalReceived += poItem.receivedQuantity;

      if (recvItem.damagedQuantity && recvItem.damagedQuantity > 0) {
        hasDiscrepancy = true;
        discrepancyReason += `Item ${recvItem.itemId}: ${recvItem.damagedQuantity} damaged; `;
      }
      if (recvItem.receivedQuantity < poItem.quantity) {
        hasDiscrepancy = true;
        discrepancyReason += `Item ${recvItem.itemId}: short shipment (${recvItem.receivedQuantity}/${poItem.quantity}); `;
      }

      // Decrement incoming stock and post inventory receipt movement
      const level = getInventoryLevel(recvItem.itemId, params.locationId);
      level.incoming = Math.max(0, level.incoming - recvItem.receivedQuantity);

      recordInventoryMovement({
        organizationId: po.organizationId,
        itemId: recvItem.itemId,
        toLocationId: params.locationId,
        movementType: 'RECEIPT',
        quantity: recvItem.receivedQuantity,
        unitCost: poItem.unitPrice,
        totalCost: recvItem.receivedQuantity * poItem.unitPrice,
        referenceType: 'PO',
        referenceId: po.purchaseOrderId,
        lotNumber: recvItem.lotNumber,
        expiryDate: recvItem.expiryDate,
        createdBy: params.receivedBy,
      });
    }
  }

  const receiptStatus: GoodsReceiptStatus = hasDiscrepancy
    ? 'DISCREPANCY'
    : totalReceived >= totalOrdered
    ? 'RECEIVED'
    : 'PARTIAL';

  const newPoStatus: PurchaseOrder['status'] = totalReceived >= totalOrdered
    ? 'RECEIVED'
    : 'PARTIALLY_RECEIVED';

  po.status = newPoStatus;
  po.updatedAt = new Date().toISOString();

  const receiptId = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const receipt: GoodsReceipt = {
    receiptId,
    purchaseOrderId: po.purchaseOrderId,
    supplierId: po.supplierId,
    items: params.items,
    receivedAt: new Date().toISOString(),
    receivedBy: params.receivedBy,
    status: receiptStatus,
    discrepancyReason: hasDiscrepancy ? discrepancyReason.trim() : undefined,
    createdAt: new Date().toISOString(),
  };

  goodsReceiptsStore.set(receiptId, receipt);

  return { receipt, poStatus: newPoStatus };
}

export function getPurchaseOrder(poId: string): PurchaseOrder | undefined {
  return purchaseOrdersStore.get(poId);
}
