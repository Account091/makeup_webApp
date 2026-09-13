import { runV86ChatEngineTests } from "./v86-chat-engine.test";

async function main() {
  try {
    await runV86ChatEngineTests();
    process.exit(0);
  } catch (error) {
    console.error("V8.6 Test execution failed:", error);
    process.exit(1);
  }
}

main();
