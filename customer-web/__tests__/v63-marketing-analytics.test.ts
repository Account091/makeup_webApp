import { calculateMarketingIntelligenceData } from "../src/lib/marketing/marketing-kpi-engine";
import { calculateContentAttribution, parseAndNormalizeUtm } from "../src/lib/marketing/marketing-attribution-engine";
import { generateMarketingAlerts } from "../src/lib/marketing/marketing-alert-engine";

describe("V6.3 Marketing & Attribution Intelligence Suite", () => {
  test("📊 Deterministic Marketing Engine calculates ROAS and CAC", () => {
    const mData = calculateMarketingIntelligenceData();

    expect(mData.dataAsOf).toBeDefined();
    expect(mData.summary.marketingLeads).toBeGreaterThan(0);
    expect(mData.summary.roas).toBeGreaterThan(0);
    expect(mData.summary.cac).toBeGreaterThan(0);
    expect(mData.channels.length).toBeGreaterThanOrEqual(4);
  });

  test("🎬 Content Attribution Engine calculates multi-touch metrics", () => {
    const content = calculateContentAttribution();

    expect(content.length).toBeGreaterThan(0);
    expect(content[0].firstTouchLeads).toBeGreaterThan(0);
    expect(content[0].lastTouchBookings).toBeGreaterThan(0);
    expect(content[0].assistedBookings).toBeGreaterThan(0);
    expect(content[0].contentPerformanceScore).toBeGreaterThan(50);
  });

  test("🏷️ UTM Normalization Engine extracts clean params", () => {
    const raw = "https://makeoversbyprachi.com/book?utm_source=Instagram&utm_medium=CPC_ad&utm_campaign=Bridal_2026";
    const utm = parseAndNormalizeUtm(raw);

    expect(utm.utmSource).toBe("instagram");
    expect(utm.utmMedium).toBe("cpc_ad");
    expect(utm.utmCampaign).toBe("bridal_2026");
  });

  test("🚨 Marketing Alert Engine generates CAC & ROAS risk alerts", () => {
    const alerts = generateMarketingAlerts({ roas: 5.5, cac: 2100, coverage: 65.0 });

    expect(alerts.length).toBeGreaterThanOrEqual(3);
    const roasAlert = alerts.find((a) => a.type === "ROAS_DROP");
    expect(roasAlert).toBeDefined();
    expect(roasAlert?.severity).toBe("HIGH");
  });
});
