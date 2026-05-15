"use client";

import { createContext, useContext } from "react";

export interface ConversionSettings {
  live_activity_enabled: boolean;
  live_activity_interval: number;
  live_activity_names: string;
  live_activity_cities: string;
  flash_sale_enabled: boolean;
  flash_sale_ends_at: string;
  flash_sale_label: string;
  scarcity_enabled: boolean;
  scarcity_max: number;
  live_viewers_enabled: boolean;
  live_viewers_min: number;
  live_viewers_max: number;
  sticky_cta_enabled: boolean;
  cart_progress_enabled: boolean;
  cart_progress_target: number;
  cart_progress_reward: string;
  cart_progress_coupon: string;
  guarantee_enabled: boolean;
  guarantee_text: string;
}

const defaults: ConversionSettings = {
  live_activity_enabled: false,
  live_activity_interval: 12,
  live_activity_names: "أحمد,محمد,عبدالله,فيصل,سارة,نورة,ريم,خالد,عمر,يوسف,علي,مريم",
  live_activity_cities: "الرياض,جدة,الدمام,مكة,المدينة,أبوظبي,دبي,الكويت,الدوحة,مسقط",
  flash_sale_enabled: false,
  flash_sale_ends_at: "",
  flash_sale_label: "⚡ ينتهي العرض خلال",
  scarcity_enabled: false,
  scarcity_max: 20,
  live_viewers_enabled: false,
  live_viewers_min: 8,
  live_viewers_max: 34,
  sticky_cta_enabled: true,
  cart_progress_enabled: false,
  cart_progress_target: 200,
  cart_progress_reward: "خصم 10%",
  cart_progress_coupon: "SAVE10",
  guarantee_enabled: true,
  guarantee_text: "🛡 ضمان استرداد خلال 7 أيام إذا لم يعمل",
};

const ConversionContext = createContext<ConversionSettings>(defaults);

export function ConversionProvider({
  settings,
  children,
}: {
  settings: Partial<ConversionSettings>;
  children: React.ReactNode;
}) {
  return (
    <ConversionContext.Provider value={{ ...defaults, ...settings }}>
      {children}
    </ConversionContext.Provider>
  );
}

export function useConversion(): ConversionSettings {
  return useContext(ConversionContext);
}
