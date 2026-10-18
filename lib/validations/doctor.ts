/**
 * Doctor-related Zod validation schemas
 */

import { z } from 'zod';

/**
 * Schema for doctor provisioning by center admin
 */
export const provisionDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  specialization: z.string().optional(),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  price: z.number().positive('Price must be positive'),
  consultationFee: z.number().positive('Consultation fee must be positive').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  role: z.string().optional(), // Doctor role/title (e.g., "Consultant", "Specialist")
});

/**
 * Schema for patient check-in
 */
export const checkInSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

/**
 * Schema for patient check-out with optional price adjustment
 */
export const checkOutSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  actualPrice: z.number().positive('Price must be positive').optional(),
});

/**
 * Schema for commission settings
 */
export const commissionSchema = z.object({
  centerId: z.string().uuid('Invalid center ID'),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionRate: z.number().min(0).max(100).optional(),
  fixedCommissionAmount: z.number().positive().optional(),
}).refine(
  (data) => {
    // PERCENTAGE must have commissionRate
    if (data.commissionType === 'PERCENTAGE') {
      return data.commissionRate !== undefined && data.commissionRate !== null;
    }
    // FIXED must have fixedCommissionAmount
    if (data.commissionType === 'FIXED') {
      return data.fixedCommissionAmount !== undefined && data.fixedCommissionAmount !== null;
    }
    return true;
  },
  {
    message: 'PERCENTAGE requires commissionRate, FIXED requires fixedCommissionAmount',
  }
);

/**
 * Schema for first-login password change
 */
export const changePasswordFirstLoginSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
}).refine(
  (data) => data.oldPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

/**
 * Schema for device OTP verification
 */
export const verifyDeviceSchema = z.object({
  deviceId: z.string().uuid('Invalid device ID'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
