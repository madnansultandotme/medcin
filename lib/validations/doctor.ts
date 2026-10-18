/**
 * Doctor Validation Schemas
 * 
 * Zod schemas for doctor-related operations
 */

import { z } from 'zod';

export const provisionDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  role: z.string().min(1, 'Role is required'),
  specialization: z.string().optional(),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  price: z.number().positive('Price must be positive'),
  consultationFee: z.number().positive('Consultation fee must be positive').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

export const checkInSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

export const checkOutSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  actualPrice: z.number().positive('Actual price must be positive').optional(),
});

export const commissionSchema = z.object({
  centerId: z.string().uuid('Invalid center ID'),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionRate: z.number().min(0).max(100).optional(),
  fixedCommissionAmount: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.commissionType === 'PERCENTAGE') {
      return data.commissionRate !== undefined;
    }
    if (data.commissionType === 'FIXED') {
      return data.fixedCommissionAmount !== undefined;
    }
    return false;
  },
  {
    message: 'PERCENTAGE type requires commissionRate, FIXED type requires fixedCommissionAmount',
  }
);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
