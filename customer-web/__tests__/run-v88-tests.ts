import { runV88MarketplaceAnalyticsTests } from "./v88-marketplace-analytics.test";

async function main() {
  try {
    await runV88MarketplaceAnalyticsTests();
    process.exit(0);
  } catch (error) {
    console.error("V8.8 Test execution failed:", error);
    process.exit(1);
  }
}

main();
