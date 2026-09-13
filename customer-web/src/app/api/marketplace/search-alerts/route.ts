import { NextRequest, NextResponse } from "next/server";
import {
  getSearchAlerts,
  saveSearchAlert,
  updateSearchAlertStatus,
} from "../../../../lib/marketplace/search-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;

    const alerts = getSearchAlerts(userId, locationId);
    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alert = saveSearchAlert(body);
    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, active } = body;
    if (!alertId || active === undefined) {
      return NextResponse.json({ success: false, error: "alertId and active required" }, { status: 400 });
    }
    const alert = updateSearchAlertStatus(alertId, active);
    if (!alert) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, alert });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
