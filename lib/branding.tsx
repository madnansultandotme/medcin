"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import rawBranding from "@/config/branding.json";

export interface ColorPalette {
  ink: string;
  paper: string;
  surface: string;
  mist: string;
  clay: string;
  sage: string;
  amber: string;
  muted: string;
}

export interface BrandingConfig {
  client: {
    id: string;
    name: string;
    legalName: string;
    tagline: string;
    description: string;
    mission: string;
  };
  assets: {
    logoText: string;
    logoMark: string;
    favicon: string;
    heroImages?: string[];
  };
  theme: {
    colors: {
      light: ColorPalette;
      dark: ColorPalette;
    };
    typography: {
      sansFontFamily: string;
      monoFontFamily: string;
    };
    borderRadius: {
      card: string;
      button: string;
      badge: string;
    };
  };
  localization: {
    targetRegion?: string;
    country: string;
    countryCode: string;
    defaultCity: string;
    supportedCities: string[];
    countries?: Array<{ name: string; code: string; currency: string; currencyCode: string }>;
    currency: {
      code: string;
      symbol: string;
      position: "prefix" | "suffix";
    };
    locale: string;
  };
  compliance: {
    regulatoryBody: string;
    healthProtocol: string;
    dataProtection: string;
    guarantee: string;
  };
  navigation: {
    links: Array<{ label: string; href: string }>;
    ctaLabel: string;
  };
  contact: {
    email: string;
    supportPhone: string;
    address: string;
    operatingHours: string;
  };
  features: {
    enableRatings: boolean;
    enableDisputes: boolean;
    enableCalendarExport: boolean;
    enableDarkMode: boolean;
  };
}

export const defaultBranding = rawBranding as BrandingConfig;

interface BrandingContextType {
  branding: BrandingConfig;
  formatCurrency: (amount: number) => string;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  formatCurrency: (amount: number) => `€${amount}`,
});

export function BrandingProvider({
  children,
  customConfig,
}: {
  children: React.ReactNode;
  customConfig?: Partial<BrandingConfig>;
}) {
  const branding = useMemo(() => {
    if (!customConfig) return defaultBranding;
    return {
      ...defaultBranding,
      ...customConfig,
      client: { ...defaultBranding.client, ...customConfig.client },
      assets: { ...defaultBranding.assets, ...customConfig.assets },
      theme: { ...defaultBranding.theme, ...customConfig.theme },
      localization: { ...defaultBranding.localization, ...customConfig.localization },
      compliance: { ...defaultBranding.compliance, ...customConfig.compliance },
      navigation: { ...defaultBranding.navigation, ...customConfig.navigation },
      contact: { ...defaultBranding.contact, ...customConfig.contact },
      features: { ...defaultBranding.features, ...customConfig.features },
    };
  }, [customConfig]);

  // Inject CSS variables into :root based on JSON branding config
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const light = branding.theme.colors.light;
    const dark = branding.theme.colors.dark;

    // Set base variables
    root.style.setProperty("--clay", light.clay);
    root.style.setProperty("--sage", light.sage);
    root.style.setProperty("--amber", light.amber);

    // Dynamic style block for theme modes
    const styleId = "medcin-client-branding-vars";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --ink: ${light.ink};
        --paper: ${light.paper};
        --surface: ${light.surface};
        --mist: ${light.mist};
        --clay: ${light.clay};
        --sage: ${light.sage};
        --amber: ${light.amber};
        --muted: ${light.muted};
        --font-d: ${branding.theme.typography.sansFontFamily};
        --font-m: ${branding.theme.typography.monoFontFamily};
      }
      :root[data-theme="dark"], .dark {
        --ink: ${dark.ink};
        --paper: ${dark.paper};
        --surface: ${dark.surface};
        --mist: ${dark.mist};
        --clay: ${dark.clay};
        --sage: ${dark.sage};
        --amber: ${dark.amber};
        --muted: ${dark.muted};
      }
    `;
  }, [branding]);

  const formatCurrency = (amount: number): string => {
    const { symbol, position } = branding.localization.currency;
    return position === "suffix" ? `${amount} ${symbol}` : `${symbol}${amount}`;
  };

  return (
    <BrandingContext.Provider value={{ branding, formatCurrency }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: defaultBranding,
      formatCurrency: (amount: number) => `€${amount}`,
    };
  }
  return context;
}
