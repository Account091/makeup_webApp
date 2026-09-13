import { runV83SettlementsEngineTests } from './v83-settlements-engine.test';

async function main() {
  try {
    await runV83SettlementsEngineTests();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

main();
