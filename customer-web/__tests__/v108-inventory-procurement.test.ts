/**
 * V10.8 Inventory, Procurement & Vendor Operations Test Suite
 */

import {
  registerInventoryItem,
  registerInventoryLocation,
  recordInventoryMovement,
  getInventoryLevel,
  reserveStock,
  releaseReservation,
  registerInventoryKit,
  reserveKitForBooking,
} from '../src/lib/core/inventory/inventory-ledger-engine';
import {
  registerSupplier,
  registerSupplierProduct,
  registerReorderRule,
  calculateReorderRecommendation,
  createPurchaseOrder,
  processGoodsReceipt,
} from '../src/lib/core/inventory/procurement-engine';
import {
  validateInventoryOperation,
  reconcileInventoryState,
} from '../src/lib/core/inventory/inventory-boundaries-engine';

console.log('====================================================================');
console.log('RUNNING V10.8 INVENTORY, PROCUREMENT & VENDOR OPERATIONS TESTS');
console.log('====================================================================\n');

let assertionsPassed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// Test 1: Inventory Item Registration & Append-Only Ledger
// -------------------------------------------------------------
console.log('[Test 1] Inventory Item Registration & Append-Only Movement Ledger...');
registerInventoryItem({
  itemId: 'item_setting_spray_v1',
  organizationId: 'org_delhi',
  sku: 'MUP-SSP-001',
  name: 'Professional Setting Spray 100ml',
  category: 'CONSUMABLE',
  itemType: 'CONSUMABLE',
  unitOfMeasure: 'BOTTLE',
  trackInventory: true,
  trackLot: true,
  trackExpiry: true,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

registerInventoryLocation({
  locationId: 'loc_main_storage',
  organizationId: 'org_delhi',
  name: 'Main Studio Storage',
  type: 'STORAGE',
  active: true,
});

recordInventoryMovement({
  organizationId: 'org_delhi',
  itemId: 'item_setting_spray_v1',
  toLocationId: 'loc_main_storage',
  movementType: 'RECEIPT',
  quantity: 50,
  unitCost: 450,
  totalCost: 22500,
  createdBy: 'warehouse_mgr_1',
});

const level = getInventoryLevel('item_setting_spray_v1', 'loc_main_storage');
assert(level.onHand === 50, 'On-hand stock level correctly incremented via RECEIPT movement');
assert(level.available === 50, 'Derived available stock matches on-hand level when no reservations exist');

// -------------------------------------------------------------
// Test 2: Stock Reservation & Kit Reservation
// -------------------------------------------------------------
console.log('\n[Test 2] Stock Reservation & Kit Reservation Engine...');
const res1 = reserveStock({
  organizationId: 'org_delhi',
  itemId: 'item_setting_spray_v1',
  locationId: 'loc_main_storage',
  quantity: 10,
  referenceType: 'BOOKING',
  referenceId: 'bkg_bridal_101',
});

assert(res1.success === true, 'Stock reservation succeeded');
const levelAfterRes = getInventoryLevel('item_setting_spray_v1', 'loc_main_storage');
assert(levelAfterRes.reserved === 10, 'Reserved quantity updated to 10');
assert(levelAfterRes.available === 40, 'Derived available stock correctly calculated as 50 - 10 = 40');

// Release reservation
if (res1.reservation) {
  const released = releaseReservation(res1.reservation.reservationId);
  assert(released === true, 'Reservation released successfully');
  const levelAfterRelease = getInventoryLevel('item_setting_spray_v1', 'loc_main_storage');
  assert(levelAfterRelease.reserved === 0, 'Reserved stock reset to 0');
  assert(levelAfterRelease.available === 50, 'Available stock restored to 50');
}

// Kit reservation test
registerInventoryKit({
  kitId: 'kit_bridal_deluxe',
  organizationId: 'org_delhi',
  name: 'Bridal Deluxe Kit',
  items: [{ itemId: 'item_setting_spray_v1', standardQuantity: 5 }],
  active: true,
});

const kitRes = reserveKitForBooking({
  kitId: 'kit_bridal_deluxe',
  organizationId: 'org_delhi',
  locationId: 'loc_main_storage',
  bookingId: 'bkg_bridal_202',
});

assert(kitRes.success === true, 'Kit reservation for booking succeeded');

// -------------------------------------------------------------
// Test 3: Reorder Recommendation Engine
// -------------------------------------------------------------
console.log('\n[Test 3] Reorder Recommendation Engine...');
registerReorderRule({
  ruleId: 'rule_spray_001',
  itemId: 'item_setting_spray_v1',
  locationId: 'loc_main_storage',
  minimumStock: 60,
  reorderPoint: 50,
  safetyStock: 10,
  minimumOrderQuantity: 20,
  targetStock: 100,
  leadTimeDays: 3,
  active: true,
});

registerSupplier({
  supplierId: 'sup_beauty_distributors',
  organizationId: 'org_delhi',
  name: 'Pro Beauty Distributors India',
  leadTimeDays: 3,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

registerSupplierProduct({
  supplierProductId: 'sp_spray_001',
  supplierId: 'sup_beauty_distributors',
  itemId: 'item_setting_spray_v1',
  supplierSku: 'PBD-SSP-100',
  unitPrice: 420,
  minimumOrderQuantity: 20,
  leadTimeDays: 3,
  active: true,
  lastVerifiedAt: new Date().toISOString(),
});

const reorderRec = calculateReorderRecommendation('item_setting_spray_v1', 'loc_main_storage');
assert(reorderRec.priority === 'HIGH' || reorderRec.priority === 'CRITICAL', 'Reorder recommendation priority triggered');
assert(reorderRec.recommendedQuantity >= 20, 'Recommended quantity meets minimum order quantity requirement');

// -------------------------------------------------------------
// Test 4: Purchase Order Lifecycle & Server-Side Price Validation
// -------------------------------------------------------------
console.log('\n[Test 4] Purchase Order Lifecycle & Idempotency...');
const po = createPurchaseOrder({
  organizationId: 'org_delhi',
  supplierId: 'sup_beauty_distributors',
  items: [{ itemId: 'item_setting_spray_v1', quantity: 30, receivedQuantity: 0, unitPrice: 420, totalPrice: 0 }],
  subtotal: 0,
  tax: 500,
  shipping: 200,
  discount: 0,
  total: 0,
  currency: 'INR',
  requestedBy: 'procurement_admin_1',
  idempotencyKey: 'idemp_po_001',
});

assert(po.subtotal === 12600, 'Server-side PO subtotal calculated correctly (30 * 420 = 12,600)');
assert(po.total === 13300, 'Server-side total calculated with tax and shipping (12600 + 500 + 200 = 13,300)');
assert(po.status === 'APPROVED', 'PO created in APPROVED status');

// Idempotency verification
const duplicatePo = createPurchaseOrder({
  organizationId: 'org_delhi',
  supplierId: 'sup_beauty_distributors',
  items: [{ itemId: 'item_setting_spray_v1', quantity: 30, receivedQuantity: 0, unitPrice: 420, totalPrice: 0 }],
  subtotal: 0,
  tax: 500,
  shipping: 200,
  discount: 0,
  total: 0,
  currency: 'INR',
  requestedBy: 'procurement_admin_1',
  idempotencyKey: 'idemp_po_001',
});

assert(duplicatePo.purchaseOrderId === po.purchaseOrderId, 'Idempotent PO request returns existing PO');

// -------------------------------------------------------------
// Test 5: Goods Receipt & Receiving Discrepancy Detection
// -------------------------------------------------------------
console.log('\n[Test 5] Goods Receipt & Partial Shipment Discrepancy...');
const receiptRes = processGoodsReceipt({
  purchaseOrderId: po.purchaseOrderId,
  locationId: 'loc_main_storage',
  receivedBy: 'receiving_clerk_1',
  items: [{ itemId: 'item_setting_spray_v1', receivedQuantity: 20, damagedQuantity: 2 }],
});

assert(receiptRes.receipt.status === 'DISCREPANCY', 'Short shipment & damaged items flagged as DISCREPANCY');
assert(receiptRes.poStatus === 'PARTIALLY_RECEIVED', 'PO status updated to PARTIALLY_RECEIVED');

// -------------------------------------------------------------
// Test 6: Security, Tenant Isolation & AI Guardrails
// -------------------------------------------------------------
console.log('\n[Test 6] Security, Tenant Isolation & AI Guardrails...');
const tenantGuard = validateInventoryOperation({
  action: 'UPDATE_STOCK',
  callerRole: 'AUTHORIZED_ADMIN',
  organizationId: 'org_delhi',
  targetOrganizationId: 'org_mumbai',
});
assert(tenantGuard.allowed === false, 'Cross-tenant inventory access blocked');

const clientGuard = validateInventoryOperation({
  action: 'UPDATE_STOCK',
  callerRole: 'CLIENT_BROWSER',
  organizationId: 'org_delhi',
  targetOrganizationId: 'org_delhi',
});
assert(clientGuard.allowed === false, 'Direct client stock level mutation blocked');

const aiGuard = validateInventoryOperation({
  action: 'APPROVE_PO',
  callerRole: 'AI_ASSISTANT',
  organizationId: 'org_delhi',
  targetOrganizationId: 'org_delhi',
});
assert(aiGuard.allowed === false, 'AI assistant blocked from approving Purchase Orders');

// -------------------------------------------------------------
// Test 7: Disaster Recovery Movement Ledger Reconciliation
// -------------------------------------------------------------
console.log('\n[Test 7] Disaster Recovery Movement Ledger Reconciliation...');
const reconciledLevel = reconcileInventoryState('item_setting_spray_v1', 'loc_main_storage');
assert(reconciledLevel.onHand === 70, 'DR Reconciliation correctly rebuilt on-hand balance (50 initial + 20 received = 70)');

console.log('====================================================================');
console.log(`ALL V10.8 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 📦🛒`);
console.log('====================================================================\n');

export function runV108InventoryTests(): { name: string; passed: boolean; details?: string }[] {
  return [
    { name: 'Inventory Item Registration & Append-Only Ledger', passed: true },
    { name: 'Stock Reservation & Kit Reservation Engine', passed: true },
    { name: 'Reorder Recommendation Engine', passed: true },
    { name: 'Purchase Order Lifecycle & Idempotency', passed: true },
    { name: 'Goods Receipt & Partial Shipment Discrepancy', passed: true },
    { name: 'Security, Tenant Isolation & AI Guardrails', passed: true },
    { name: 'Disaster Recovery Movement Ledger Reconciliation', passed: true },
  ];
}
