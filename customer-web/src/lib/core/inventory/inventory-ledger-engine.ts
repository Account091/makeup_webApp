/**
 * V10.8 Append-Only Inventory Ledger & Movement Engine
 * 
 * CORE RULE: Stock levels are updated strictly via append-only inventoryMovements.
 * Derived available stock = onHand - reserved - quarantined.
 */

import {
  InventoryItem,
  InventoryLocation,
  InventoryLevel,
  InventoryMovement,
  StockReservation,
  InventoryKit,
  DestinationManifest,
  MovementType,
} from './inventory-types';

const itemsStore = new Map<string, InventoryItem>();
const locationsStore = new Map<string, InventoryLocation>();
const levelsStore = new Map<string, InventoryLevel>(); // key: `${itemId}_${locationId}`
const movementsStore: InventoryMovement[] = [];
const reservationsStore = new Map<string, StockReservation>();
const kitsStore = new Map<string, InventoryKit>();
const manifestsStore = new Map<string, DestinationManifest>();

export function registerInventoryItem(item: InventoryItem): InventoryItem {
  itemsStore.set(item.itemId, item);
  return item;
}

export function registerInventoryLocation(loc: InventoryLocation): InventoryLocation {
  locationsStore.set(loc.locationId, loc);
  return loc;
}

export function getInventoryLevel(itemId: string, locationId: string): InventoryLevel {
  const key = `${itemId}_${locationId}`;
  let level = levelsStore.get(key);
  if (!level) {
    level = {
      levelId: key,
      itemId,
      locationId,
      onHand: 0,
      reserved: 0,
      quarantined: 0,
      available: 0,
      incoming: 0,
      damaged: 0,
      expired: 0,
      updatedAt: new Date().toISOString(),
    };
    levelsStore.set(key, level);
  }
  return level;
}

function updateLevelDerivedAvailable(level: InventoryLevel): void {
  level.available = Math.max(0, level.onHand - level.reserved - level.quarantined);
  level.updatedAt = new Date().toISOString();
}

/**
 * Record an append-only inventory movement and update local inventory levels.
 */
export function recordInventoryMovement(params: Omit<InventoryMovement, 'movementId' | 'createdAt'>): InventoryMovement {
  const movementId = `mov_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const movement: InventoryMovement = {
    ...params,
    movementId,
    createdAt: new Date().toISOString(),
  };

  movementsStore.push(movement);

  // Apply to location stock levels
  if (movement.toLocationId) {
    const level = getInventoryLevel(movement.itemId, movement.toLocationId);
    if (movement.movementType === 'RECEIPT' || movement.movementType === 'TRANSFER_IN' || movement.movementType === 'RETURN') {
      level.onHand += movement.quantity;
    } else if (movement.movementType === 'ADJUSTMENT' && movement.quantity > 0) {
      level.onHand += movement.quantity;
    }
    updateLevelDerivedAvailable(level);
  }

  if (movement.fromLocationId) {
    const level = getInventoryLevel(movement.itemId, movement.fromLocationId);
    if (movement.movementType === 'SALE' || movement.movementType === 'CONSUMPTION' || movement.movementType === 'TRANSFER_OUT' || movement.movementType === 'DAMAGE' || movement.movementType === 'EXPIRY') {
      level.onHand = Math.max(0, level.onHand - movement.quantity);
    } else if (movement.movementType === 'ADJUSTMENT' && movement.quantity < 0) {
      level.onHand = Math.max(0, level.onHand - Math.abs(movement.quantity));
    }
    updateLevelDerivedAvailable(level);
  }

  return movement;
}

/**
 * Safely reserve stock for a booking, kit, or order.
 */
export function reserveStock(params: {
  organizationId: string;
  itemId: string;
  locationId: string;
  quantity: number;
  referenceType: StockReservation['referenceType'];
  referenceId: string;
  allowBackorder?: boolean;
}): { success: boolean; reservation?: StockReservation; error?: string } {
  const level = getInventoryLevel(params.itemId, params.locationId);

  if (!params.allowBackorder && level.available < params.quantity) {
    return {
      success: false,
      error: `INSUFFICIENT_STOCK: Requested ${params.quantity}, available ${level.available}`,
    };
  }

  level.reserved += params.quantity;
  updateLevelDerivedAvailable(level);

  const reservationId = `res_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const reservation: StockReservation = {
    reservationId,
    organizationId: params.organizationId,
    itemId: params.itemId,
    locationId: params.locationId,
    quantity: params.quantity,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  reservationsStore.set(reservationId, reservation);

  recordInventoryMovement({
    organizationId: params.organizationId,
    itemId: params.itemId,
    fromLocationId: params.locationId,
    movementType: 'RESERVATION',
    quantity: params.quantity,
    unitCost: 0,
    totalCost: 0,
    referenceType: 'BOOKING',
    referenceId: params.referenceId,
    createdBy: 'RESERVATION_ENGINE',
  });

  return { success: true, reservation };
}

/**
 * Release active reservation.
 */
export function releaseReservation(reservationId: string, createdBy: string = 'SYSTEM'): boolean {
  const res = reservationsStore.get(reservationId);
  if (!res || res.status !== 'ACTIVE') return false;

  const level = getInventoryLevel(res.itemId, res.locationId);
  level.reserved = Math.max(0, level.reserved - res.quantity);
  updateLevelDerivedAvailable(level);

  res.status = 'RELEASED';

  recordInventoryMovement({
    organizationId: res.organizationId,
    itemId: res.itemId,
    toLocationId: res.locationId,
    movementType: 'RELEASE',
    quantity: res.quantity,
    unitCost: 0,
    totalCost: 0,
    referenceId: res.referenceId,
    createdBy,
  });

  return true;
}

/**
 * Register and reserve an Inventory Kit for a booking.
 */
export function registerInventoryKit(kit: InventoryKit): InventoryKit {
  kitsStore.set(kit.kitId, kit);
  return kit;
}

export function reserveKitForBooking(params: {
  kitId: string;
  organizationId: string;
  locationId: string;
  bookingId: string;
}): { success: boolean; reservedItems: string[]; errors: string[] } {
  const kit = kitsStore.get(params.kitId);
  if (!kit || !kit.active) {
    return { success: false, reservedItems: [], errors: ['Kit not found or inactive'] };
  }

  const reservedItems: string[] = [];
  const errors: string[] = [];

  for (const itemSpec of kit.items) {
    const res = reserveStock({
      organizationId: params.organizationId,
      itemId: itemSpec.itemId,
      locationId: params.locationId,
      quantity: itemSpec.standardQuantity,
      referenceType: 'SERVICE_KIT',
      referenceId: params.bookingId,
    });

    if (res.success) {
      reservedItems.push(itemSpec.itemId);
    } else {
      errors.push(`Failed to reserve item ${itemSpec.itemId}: ${res.error}`);
    }
  }

  return {
    success: errors.length === 0,
    reservedItems,
    errors,
  };
}

/**
 * Destination Manifest Management
 */
export function createDestinationManifest(manifest: DestinationManifest): DestinationManifest {
  manifestsStore.set(manifest.manifestId, manifest);
  return manifest;
}

export function getAllMovements(): InventoryMovement[] {
  return [...movementsStore];
}

export function getMovementsByItem(itemId: string): InventoryMovement[] {
  return movementsStore.filter(m => m.itemId === itemId);
}
