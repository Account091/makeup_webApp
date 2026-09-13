/**
 * System Maintenance & Remote Feature Kill Switches — V9.0
 */

import { FeatureKillSwitches, MaintenanceConfig } from '../system-types';

const maintenanceState: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'System is currently undergoing scheduled maintenance.',
  allowedRoles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
  updatedAt: new Date().toISOString(),
};

const featureSwitches: FeatureKillSwitches = {
  bookingEnabled: true,
  paymentProofEnabled: true,
  aiEnabled: true,
  whatsappEnabled: true,
  marketplaceEnabled: true,
  chatEnabled: true,
  updatedAt: new Date().toISOString(),
};

export function getMaintenanceConfig(): MaintenanceConfig {
  return { ...maintenanceState };
}

export function updateMaintenanceConfig(
  updates: Partial<MaintenanceConfig>
): MaintenanceConfig {
  if (updates.maintenanceMode !== undefined) maintenanceState.maintenanceMode = updates.maintenanceMode;
  if (updates.maintenanceMessage !== undefined) maintenanceState.maintenanceMessage = updates.maintenanceMessage;
  if (updates.allowedRoles !== undefined) maintenanceState.allowedRoles = updates.allowedRoles;
  maintenanceState.updatedAt = new Date().toISOString();
  return { ...maintenanceState };
}

export function getFeatureKillSwitches(): FeatureKillSwitches {
  return { ...featureSwitches };
}

export function updateFeatureKillSwitches(
  updates: Partial<FeatureKillSwitches>
): FeatureKillSwitches {
  Object.assign(featureSwitches, updates, { updatedAt: new Date().toISOString() });
  return { ...featureSwitches };
}

export function isFeatureAllowed(feature: keyof Omit<FeatureKillSwitches, 'updatedAt'>): boolean {
  return Boolean(featureSwitches[feature]);
}
