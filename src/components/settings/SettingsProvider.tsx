"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_PRICING,
  DEFAULT_SHIPPING,
  DEFAULT_PRODUCTS,
  DEFAULT_PRODUCT_IMAGES,
  mergePricing,
  mergeShipping,
  mergeProducts,
  mergeProductImages,
  type PricingConfig,
  type ShippingConfig,
  type ProductsConfig,
  type ProductImagesConfig,
} from "@/lib/settings";

interface SettingsValue {
  pricing: PricingConfig;
  shipping: ShippingConfig;
  products: ProductsConfig;
  productImages: ProductImagesConfig;
}

// Default = kod-defaults → sajten funkar identiskt innan DB laddats / om det fallerar.
const SettingsContext = createContext<SettingsValue>({
  pricing: DEFAULT_PRICING,
  shipping: DEFAULT_SHIPPING,
  products: DEFAULT_PRODUCTS,
  productImages: DEFAULT_PRODUCT_IMAGES,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [shipping, setShipping] = useState<ShippingConfig>(DEFAULT_SHIPPING);
  const [products, setProducts] = useState<ProductsConfig>(DEFAULT_PRODUCTS);
  const [productImages, setProductImages] = useState<ProductImagesConfig>(DEFAULT_PRODUCT_IMAGES);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("app_settings")
      .select("key,value")
      .in("key", ["pricing", "shipping", "products", "productImages"])
      .then(({ data }) => {
        for (const row of data ?? []) {
          if (row.key === "pricing") setPricing(mergePricing(row.value));
          if (row.key === "shipping") setShipping(mergeShipping(row.value));
          if (row.key === "products") setProducts(mergeProducts(row.value));
          if (row.key === "productImages") setProductImages(mergeProductImages(row.value));
        }
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ pricing, shipping, products, productImages }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
