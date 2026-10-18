/**
 * Commission Calculation Utilities
 * 
 * Handles commission calculations for bookings based on center commission settings.
 * Commission is deducted FROM the booking price, with the remainder going to the center.
 */

export interface CommissionResult {
  commissionAmount: number;
  centerEarnings: number;
}

export interface CenterCommissionSettings {
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate: number | null;
  fixedCommissionAmount: number | null;
}

/**
 * Calculate commission based on center settings
 * 
 * @param price - Total booking price
 * @param center - Center with commission settings
 * @returns Commission amount and center earnings
 */
export function calculateCommission(
  price: number,
  center: CenterCommissionSettings
): CommissionResult {
  let commissionAmount = 0;

  if (center.commissionType === 'PERCENTAGE' && center.commissionRate !== null) {
    // Calculate percentage-based commission
    commissionAmount = Math.round((price * center.commissionRate / 100) * 100) / 100;
  } else if (center.commissionType === 'FIXED' && center.fixedCommissionAmount !== null) {
    // Use fixed commission amount
    commissionAmount = center.fixedCommissionAmount;
  }

  // Center earnings = booking price minus commission
  const centerEarnings = Math.round((price - commissionAmount) * 100) / 100;

  return {
    commissionAmount,
    centerEarnings,
  };
}
