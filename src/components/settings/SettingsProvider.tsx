"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_PRICING,
  DEFAULT_SHIPPING,
  mergePricing,
  mergeShipping,
  type PricingConfig,
  type ShippingConfig,
} from "@/lib/settings";

interface SettingsValue {
  pricing: PricingConfig;
  shipping: ShippingConfig;
}

// Default = kod-defaults → sajten funkar identiskt innan DB laddats / om det fallerar.
const SettingsContext = createContext<SettingsValue>({
  pricing: DEFAULT_PRICING,
  shipping: DEFAULT_SHIPPING,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [shipping, setShipping] = useState<ShippingConfig>(DEFAULT_SHIPPING);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("app_settings")
      .select("key,value")
      .in("key", ["pricing", "shipping"])
      .then(({ data }) => {
        for (const row of data ?? []) {
          if (row.key === "pricing") setPricing(mergePricing(row.value));
          if (row.key === "shipping") setShipping(mergeShipping(row.value));
        }
      });
  }, []);

  return <SettingsContext.Provider value={{ pricing, shipping }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
