import { MarketplaceSearchAlert } from "./marketplace-types";

const searchAlertsStore: MarketplaceSearchAlert[] = [
  {
    alertId: "alert-search-01",
    customerId: "cust-101",
    locationId: "jaipur",
    serviceCategory: "bridal",
    eventDate: "2026-10-18",
    active: true,
    createdAt: "2026-09-01T00:00:00Z"
  }
];

export function getSearchAlerts(customerId?: string, locationId?: string): MarketplaceSearchAlert[] {
  let alerts = searchAlertsStore.filter(a => a.active);
  if (customerId) {
    alerts = alerts.filter(a => a.customerId === customerId);
  }
  if (locationId) {
    alerts = alerts.filter(a => a.locationId === locationId);
  }
  return alerts;
}

export function createSearchAlert(payload: {
  customerId?: string;
  userId?: string;
  locationId?: string;
  serviceCategory?: string;
  eventDate?: string;
  maxPrice?: number;
  searchQueryText?: string;
}): MarketplaceSearchAlert {
  const alert: MarketplaceSearchAlert = {
    alertId: `alert_search_${Date.now()}`,
    customerId: payload.customerId || payload.userId || "cust_default",
    locationId: payload.locationId || "all",
    serviceCategory: payload.serviceCategory || "all",
    eventDate: payload.eventDate,
    active: true,
    createdAt: new Date().toISOString()
  };

  searchAlertsStore.push(alert);
  return alert;
}

export const saveSearchAlert = createSearchAlert;

export function updateSearchAlertStatus(alertId: string, active: boolean): MarketplaceSearchAlert | null {
  const alert = searchAlertsStore.find(a => a.alertId === alertId);
  if (alert) {
    alert.active = active;
    return alert;
  }
  return null;
}
