import { calculateMarketingIntelligenceData } from "../src/lib/marketing/marketing-kpi-engine";
import { calculateContentAttribution, parseAndNormalizeUtm } from "../src/lib/marketing/marketing-attribution-engine";
import { generateMarketingAlerts } from "../src/lib/marketing/marketing-alert-engine";

function runV63Tests() {
  console.log("=========================================");
  console.log("📣 Running V6.3 Marketing Intelligence Test Suite");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Top-line Marketing Engine
  console.log("--- 1. Testing Top-line Marketing & Channel Engine ---");
  const mData = calculateMarketingIntelligenceData();
  assert(!!mData.dataAsOf, "dataAsOf timestamp is defined");
  assert(mData.summary.marketingLeads > 0, `Marketing leads = ${mData.summary.marketingLeads} > 0`);
  assert(mData.summary.roas > 0, `ROAS = ${mData.summary.roas}x > 0`);
  assert(mData.summary.cac > 0, `CAC = ₹${mData.summary.cac} > 0`);
  assert(mData.channels.length >= 4, `Channels count = ${mData.channels.length} >= 4`);

  // 2. Content Attribution Engine
  console.log("\n--- 2. Testing Content Attribution Engine ---");
  const content = calculateContentAttribution();
  assert(content.length > 0, `Attributed content items = ${content.length} > 0`);
  assert(content[0].firstTouchLeads > 0, `First-touch leads = ${content[0].firstTouchLeads}`);
  assert(content[0].lastTouchBookings > 0, `Last-touch bookings = ${content[0].lastTouchBookings}`);
  assert(content[0].assistedBookings > 0, `Assisted bookings = ${content[0].assistedBookings}`);
  assert(content[0].contentPerformanceScore > 50, `Top content score = ${content[0].contentPerformanceScore} > 50`);

  // 3. UTM Normalization Engine
  console.log("\n--- 3. Testing UTM Normalization Engine ---");
  const rawUrl = "https://makeoversbyprachi.com/book?utm_source=Instagram&utm_medium=CPC_ad&utm_campaign=Bridal_2026";
  const utm = parseAndNormalizeUtm(rawUrl);
  assert(utm.utmSource === "instagram", `Normalized utm_source is '${utm.utmSource}' (Expected: 'instagram')`);
  assert(utm.utmMedium === "cpc_ad", `Normalized utm_medium is '${utm.utmMedium}' (Expected: 'cpc_ad')`);
  assert(utm.utmCampaign === "bridal_2026", `Normalized utm_campaign is '${utm.utmCampaign}' (Expected: 'bridal_2026')`);

  // 4. Marketing Risk & Anomaly Alerts
  console.log("\n--- 4. Testing Marketing Risk & Alert Engine ---");
  const alerts = generateMarketingAlerts({ roas: 5.5, cac: 2100, coverage: 65.0 });
  assert(alerts.length >= 3, `Alerts generated count = ${alerts.length} >= 3`);
  const roasAlert = alerts.find((a) => a.type === "ROAS_DROP");
  assert(!!roasAlert, "ROAS_DROP alert generated for low ROAS");
  assert(roasAlert?.severity === "HIGH", `ROAS_DROP alert severity is ${roasAlert?.severity} (Expected: HIGH)`);

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV63Tests();
