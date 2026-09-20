/**
 * V10.8 Inventory, Procurement & Vendor Operations Types
 */

export type InventoryLocationType =
  | 'STUDIO'
  | 'STORAGE'
  | 'ARTIST'
  | 'VEHICLE'
  | 'MARKETPLACE_WAREHOUSE'
  | 'OTHER';

export type MovementType =
  | 'RECEIPT'
  | 'SALE'
  | 'CONSUMPTION'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'RETURN'
  | 'DAMAGE'
  | 'EXPIRY'
  | 'ADJUSTMENT'
  | 'RESERVATION'
  | 'RELEASE';

export type ReservationStatus = 'ACTIVE' | 'RELEASED' | 'CONSUMED' | 'EXPIRED' | 'CANCELLED';

export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONVERTED_TO_PO'
  | 'CANCELLED';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'SENT'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CLOSED'
  | 'CANCELLED';

export type GoodsReceiptStatus = 'RECEIVED' | 'PARTIAL' | 'DISCREPANCY' | 'REJECTED';

export type ItemCategoryType = 'REUSABLE_EQUIPMENT' | 'CONSUMABLE';

export interface InventoryItem {
  itemId: string;
  organizationId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  itemType: ItemCategoryType;
  unitOfMeasure: string;
  trackInventory: boolean;
  trackLot: boolean;
  trackExpiry: boolean;
  active: boolean;
  taxClassificationReference?: string;
  hsnReference?: string;
  reorderPolicyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLocation {
  locationId: string;
  organizationId: string;
  name: string;
  type: InventoryLocationType;
  addressReference?: string;
  active: boolean;
}

export interface InventoryLevel {
  levelId: string; // `${itemId}_${locationId}`
  itemId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  quarantined: number;
  available: number; // Derived: onHand - reserved - quarantined
  incoming: number;
  damaged: number;
  expired: number;
  updatedAt: string;
}

export interface InventoryMovement {
  movementId: string;
  organizationId: string;
  itemId: string;
  fromLocationId?: string;
  toLocationId?: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceType?: 'BOOKING' | 'PO' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';
  referenceId?: string;
  lotNumber?: string;
  expiryDate?: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockReservation {
  reservationId: string;
  organizationId: string;
  itemId: string;
  locationId: string;
  quantity: number;
  referenceType: 'BOOKING' | 'MARKETPLACE_ORDER' | 'SERVICE_KIT' | 'CAMPAIGN';
  referenceId: string;
  status: ReservationStatus;
  expiresAt?: string;
  createdAt: string;
}

export interface InventoryKit {
  kitId: string;
  organizationId: string;
  name: string; // e.g. 'Bridal Kit'
  items: Array<{
    itemId: string;
    standardQuantity: number;
    optionalQuantity?: number;
  }>;
  active: boolean;
}

export interface Supplier {
  supplierId: string;
  organizationId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  paymentTerms?: string;
  leadTimeDays: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  supplierProductId: string;
  supplierId: string;
  itemId: string;
  supplierSku: string;
  unitPrice: number;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  active: boolean;
  lastVerifiedAt: string;
}

export interface PurchaseRequest {
  requestId: string;
  organizationId: string;
  requestedBy: string;
  department: string;
  items: Array<{
    itemId: string;
    quantity: number;
    estimatedUnitPrice: number;
  }>;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: PurchaseRequestStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface PurchaseOrder {
  purchaseOrderId: string;
  organizationId: string;
  supplierId: string;
  purchaseRequestId?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  requestedBy: string;
  approvedBy?: string;
  status: PurchaseOrderStatus;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceipt {
  receiptId: string;
  purchaseOrderId: string;
  supplierId: string;
  items: Array<{
    itemId: string;
    receivedQuantity: number;
    damagedQuantity?: number;
    expiredQuantity?: number;
    lotNumber?: string;
    expiryDate?: string;
  }>;
  receivedAt: string;
  receivedBy: string;
  status: GoodsReceiptStatus;
  discrepancyReason?: string;
  createdAt: string;
}

export interface ReorderRule {
  ruleId: string;
  itemId: string;
  locationId: string;
  minimumStock: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  targetStock: number;
  leadTimeDays: number;
  active: boolean;
}

export interface ReorderRecommendation {
  itemId: string;
  locationId: string;
  currentAvailable: number;
  reserved: number;
  incoming: number;
  recommendedQuantity: number;
  suggestedSupplierId?: string;
  reason: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  calculatedAt: string;
}

export interface DestinationManifest {
  manifestId: string;
  organizationId: string;
  bookingId: string;
  travelDate: string;
  destinationLocation: string;
  items: Array<{
    itemId: string;
    quantity: number;
    packed: boolean;
  }>;
  status: 'DRAFT' | 'PACKED' | 'DISPATCHED' | 'RECEIVED_AT_DESTINATION' | 'RETURNED';
  createdAt: string;
}
