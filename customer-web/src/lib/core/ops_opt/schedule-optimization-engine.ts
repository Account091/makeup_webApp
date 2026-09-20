/**
 * V10.4 Schedule Optimization & Capacity Bottleneck Engine
 */

import { ResourceCapacityStatus } from './ops-types';

export function calculateCapacityStatus(params: {
  totalCapacitySlots: number;
  bookedSlots: number;
  bufferSlots: number;
}): { status: ResourceCapacityStatus; utilizationPercent: number } {
  const used = params.bookedSlots + params.bufferSlots;
  const utilizationPercent = Math.round((used / params.totalCapacitySlots) * 100);

  let status: ResourceCapacityStatus = 'CAPACITY_AVAILABLE';
  if (utilizationPercent > 100) {
    status = 'CAPACITY_OVERLOADED';
  } else if (utilizationPercent >= 90) {
    status = 'CAPACITY_CONSTRAINED';
  } else if (utilizationPercent >= 75) {
    status = 'CAPACITY_TIGHT';
  }

  return { status, utilizationPercent };
}

export function detectOperationalBottlenecks(params: {
  city: string;
  totalDemand: number;
  availableArtists: number;
  availableStudioStations: number;
}): { hasBottleneck: boolean; bottleneckType?: string; recommendation?: string } {
  const maxArtistCapacity = params.availableArtists * 3; // 3 bookings per artist per day max
  const maxStudioCapacity = params.availableStudioStations * 5; // 5 slots per station per day

  if (params.totalDemand > maxArtistCapacity) {
    return {
      hasBottleneck: true,
      bottleneckType: 'ARTIST_CAPACITY_SHORTAGE',
      recommendation: `Onboard or assign ${Math.ceil((params.totalDemand - maxArtistCapacity) / 3)} additional artist(s) for ${params.city}.`,
    };
  }

  if (params.totalDemand > maxStudioCapacity) {
    return {
      hasBottleneck: true,
      bottleneckType: 'STUDIO_STATION_SHORTAGE',
      recommendation: `Expand studio station capacity by ${Math.ceil((params.totalDemand - maxStudioCapacity) / 5)} station(s) in ${params.city}.`,
    };
  }

  return { hasBottleneck: false };
}
