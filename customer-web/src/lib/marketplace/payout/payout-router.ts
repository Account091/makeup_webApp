import { PayoutProvider } from "./payout-provider-interface";
import { ManualPayoutProvider } from "./manual-payout-provider";

const providerRegistry: Record<string, PayoutProvider> = {
  MANUAL: ManualPayoutProvider.getInstance(),
  MANUAL_PAYOUT_PROVIDER: ManualPayoutProvider.getInstance()
};

export function getPayoutProvider(providerKey: string = "MANUAL"): PayoutProvider {
  const provider = providerRegistry[providerKey.toUpperCase()];
  if (!provider) {
    // Fallback to manual provider
    return ManualPayoutProvider.getInstance();
  }
  return provider;
}

export function registerPayoutProvider(key: string, provider: PayoutProvider): void {
  providerRegistry[key.toUpperCase()] = provider;
}
