import { runV85RankingDiscoveryTests } from "./v85-ranking-discovery.test";

async function main() {
  try {
    await runV85RankingDiscoveryTests();
    process.exit(0);
  } catch (error) {
    console.error("V8.5 Test execution failed:", error);
    process.exit(1);
  }
}

main();
