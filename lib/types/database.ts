/**
 * Database Types - Matches Drizzle Schema Exactly
 * These types should be kept in sync with db/schema.ts
 */

// Enums matching database
export type UserRole = 'ADMIN' | 'CENTER' | 'PATIENT';
export type CenterStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
export type DisputeStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';
export type NotificationType = 'BOOKING' | 'SYSTEM' | 'PROMOTION';

// Database Tables

export interface User {
  id: string;
  authUid: string;
  email: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Center {
  id: string;
  userId: string;
  name: string;
  category: string;
  address: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: CenterStatus;
  logoUrl: string | null;
  coverImageUrl: string | null;
  operatingHours: string | null;
  amenities: string[];
  submittedTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  centerId: string;
  name: string;
  role: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  licenseNumber: string;
  bio: string | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  doctorId: string;
  name: string;
  duration: string;
  price: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  location: string | null;
  photoUrl: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
  medicalNotes: string | null;
  insuranceProvider: string | null;
  insurancePolicy: string | null;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  reference: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  serviceId: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: BookingStatus;
  price: number;
  patientNotes: string | null;
  paymentMethod: string;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Slot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string;
  title: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  clinicStatement: string | null;
  resolutionNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  doctorId: string;
  patientId: string;
  rating: number; // 1-5
  comment: string | null;
  response: string | null; // Doctor/Center response
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

// Extended types with relations for frontend use
export interface DoctorWithRelations extends Doctor {
  center?: Center;
  services?: Service[];
  // UI-specific fields
  clinic?: string; // center.name
  location?: string; // center.address
  initials?: string;
  image?: string; // alias for imageUrl
}

export interface BookingWithRelations extends Booking {
  patient?: PatientProfile;
  doctor?: DoctorWithRelations;
  service?: Service;
  slot?: Slot;
  // UI-specific computed fields
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName?: string;
  doctorRole?: string;
  clinicName?: string;
  clinicAddress?: string;
  serviceName?: string;
  duration?: string;
}

export interface CenterWithRelations extends Center {
  user?: User;
  doctors?: Doctor[];
  // UI-specific computed fields
  doctorCount?: number;
  logo?: string; // alias for logoUrl
  coverImage?: string; // alias for coverImageUrl
}

export interface ReviewWithRelations extends Review {
  patient?: PatientProfile;
  doctor?: Doctor;
  booking?: Booking;
  // Computed fields
  patientName?: string;
  patientPhoto?: string;
  verified?: boolean; // If booking is completed
}

// API Request/Response types
export interface CreateDoctorRequest {
  name: string;
  specialty: string;
  licenseNumber: string;
  consultationFee: number;
  bio?: string;
  imageUrl?: string;
}

export interface UpdateDoctorRequest {
  specialty?: string;
  licenseNumber?: string;
  bio?: string;
  imageUrl?: string;
  consultationFee?: number;
  active?: boolean;
}

export interface CreateServiceRequest {
  doctorId: string;
  name: string;
  duration: string;
  price: number;
  description?: string;
}

export interface CreateBookingRequest {
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  paymentMethod?: string;
}

export interface UpdateBookingRequest {
  id: string;
  status?: BookingStatus;
  date?: string;
  time?: string;
  notes?: string;
}

export interface CreateSlotRequest {
  doctorId: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
    status?: SlotStatus;
  }[];
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  response?: string; // For center/doctor response
}

// Search/Filter types
export interface DoctorSearchFilters {
  category?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  availableToday?: boolean;
  sortBy?: 'rating' | 'price-asc' | 'price-desc' | 'reviews';
  search?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Analytics types
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface DoctorStats {
  totalDoctors: number;
  activeDoctors: number;
  averageRating: number;
  totalBookings: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalCenters: number;
  totalDoctors: number;
  totalBookings: number;
  totalRevenue: number;
  bookingStats: BookingStats;
  recentBookings: BookingWithRelations[];
  topDoctors: DoctorWithRelations[];
}
