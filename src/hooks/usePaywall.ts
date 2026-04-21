import { useCallback, useState } from "react";
import type { PaywallFeature } from "@/components/paywall/PaywallDialog";

export function usePaywall() {
  const [feature, setFeature] = useState<PaywallFeature | null>(null);

  const open = useCallback((f: PaywallFeature) => setFeature(f), []);
  const close = useCallback(() => setFeature(null), []);

  return {
    feature,
    isOpen: feature !== null,
    open,
    close,
    onOpenChange: (next: boolean) => {
      if (!next) setFeature(null);
    },
  };
}
