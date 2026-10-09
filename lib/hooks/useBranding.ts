import brandingConfig from '@/config/branding.json';

export interface Currency {
  code: string;
  symbol: string;
  position: 'prefix' | 'suffix';
}

export interface BrandingConfig {
  localization: {
    currency: Currency;
  };
}

export function useBranding() {
  const config = brandingConfig as BrandingConfig;
  const currency = config.localization.currency;

  const formatCurrency = (amount: number): string => {
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return currency.position === 'prefix'
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount}${currency.symbol}`;
  };

  return {
    currency,
    formatCurrency,
  };
}
