/**
 * Dependency Health & Verification Monitor — V9.0
 */

import { DependencyStatus, IntegrationVerificationLevel } from '../system-types';
import { runRuntimeHealthChecks } from './health-checker';

export function getDependencyStatuses(): DependencyStatus[] {
  const health = runRuntimeHealthChecks();
  return health.dependencies;
}

export function updateDependencyVerificationLevel(
  serviceId: string,
  level: IntegrationVerificationLevel
): DependencyStatus | null {
  const deps = getDependencyStatuses();
  const dep = deps.find((d) => d.serviceId === serviceId);
  if (dep) {
    dep.verificationLevel = level;
    return dep;
  }
  return null;
}
