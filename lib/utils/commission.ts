/**
 * Commission Calculation Utilities
 * 
 * Handles commission calculations for patient check-out.
 * Platform takes commission FROM booking price, center receives remainder.
 */

export interface CommissionResult {
  commissionAmount: number;
  centerEarnings: number;
}

export interface CenterCommissionSettings {
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate?: number | null;
  fixedCommissionAmount?: number | null;
}

/**
 * Calculate commission based on center settings
 * 
 * @param price - The booking price
 * @param center - Center commission settings
 * @returns Commission amount and center earnings
 * 
 * @example
 * // Percentage: 15% commission on $100 booking
 * calculateCommission(100, { commissionType: 'PERCENTAGE', commissionRate: 15 })
 * // Returns: { commissionAmount: 15, centerEarnings: 85 }
 * 
 * @example
 * // Fixed: $10 commission on $100 booking
 * calculateCommission(100, { commissionType: 'FIXED', fixedCommissionAmount: 10 })
 * // Returns: { commissionAmount: 10, centerEarnings: 90 }
 */
export function calculateCommission(
  price: number,
  center: CenterCommissionSettings
): CommissionResult {
  let commissionAmount: number;

  if (center.commissionType === 'PERCENTAGE') {
    const rate = center.commissionRate || 0;
    commissionAmount = Math.round((price * rate) / 100 * 100) / 100; // Round to 2 decimals
  } else if (center.commissionType === 'FIXED') {
    commissionAmount = center.fixedCommissionAmount || 0;
  } else {
    // Default: no commission
    commissionAmount = 0;
  }

  // Calculate centerEarnings as difference without additional rounding to prevent discrepancies
  const centerEarnings = price - commissionAmount;

  return {
    commissionAmount,
    centerEarnings,
  };
}
