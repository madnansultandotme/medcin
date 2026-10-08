// Medcin Database Schema - Drizzle ORM with RLS Policies
import { pgTable, text, timestamp, real, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { authenticatedRole, anonymousRole, crudPolicy, authUid } from 'drizzle-orm/neon';

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'CENTER', 'PATIENT']);
export const centerStatusEnum = pgEnum('center_status', ['PENDING', 'ACTIVE', 'SUSPENDED']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const slotStatusEnum = pgEnum('slot_status', ['AVAILABLE', 'BOOKED', 'BLOCKED']);
export const disputeStatusEnum = pgEnum('dispute_status', ['OPEN', 'RESOLVED', 'CLOSED']);

// Lookup/Reference Tables for Normalization
export const centerCategories = pgTable('center_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctorCategories = pgTable('doctor_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctorSpecializations = pgTable('doctor_specializations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users table - Maps Neon Auth UID to our user data
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  authUid: text('auth_uid').notNull().unique(), // Neon Auth user ID from auth.user_id()
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  photoUrl: text('photo_url'),
  role: userRoleEnum('role').notNull().default('PATIENT'),
  // Subscription fields for mobile app monetization
  subscriptionStatus: text('subscription_status').default('FREE'), // FREE, ACTIVE, EXPIRED, CANCELLED
  subscriptionTier: text('subscription_tier'), // BASIC (monthly), PREMIUM (yearly)
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionExpiryDate: timestamp('subscription_expiry_date'),
  subscriptionPlatform: text('subscription_platform'), // GOOGLE_PLAY, APP_STORE
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Authenticated users can read all users and modify their own
  crudPolicy({
    role: authenticatedRole,
    read: true,
    modify: authUid(table.authUid),
  }),
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  center: one(centers, {
    fields: [users.id],
    references: [centers.userId],
  }),
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  disputes: many(disputes),
}));

// Centers table - Public read, owners can modify their own
export const centers = pgTable('centers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  address: text('address').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  licenseNumber: text('license_number').notNull(),
  status: centerStatusEnum('status').default('PENDING').notNull(),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  operatingHours: text('operating_hours'),
  amenities: text('amenities').array().default([]),
  submittedTime: timestamp('submitted_time').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Anyone (anonymous) can read all centers
  crudPolicy({
    role: anonymousRole,
    read: true,
    modify: null,
  }),
  // Authenticated users can read all centers, but only modify their own
  crudPolicy({
    role: authenticatedRole,
    read: true,
    modify: authUid(table.userId),
  }),
]);

export const centersRelations = relations(centers, ({ one, many }) => ({
  user: one(users, {
    fields: [centers.userId],
    references: [users.id],
  }),
  doctors: many(doctors),
}));

// Doctors table - Public read for active doctors
export const doctors = pgTable('doctors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  centerId: text('center_id').notNull().references(() => centers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  rating: real('rating').default(0).notNull(),
  reviewsCount: integer('reviews_count').default(0).notNull(),
  licenseNumber: text('license_number').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Anyone can read doctors
  crudPolicy({
    role: anonymousRole,
    read: true,
    modify: null,
  }),
  // Authenticated users can read, modify handled in application logic
  crudPolicy({
    role: authenticatedRole,
    read: true,
    modify: false, // Center ownership checked in API routes
  }),
]);

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  center: one(centers, {
    fields: [doctors.centerId],
    references: [centers.id],
  }),
  services: many(services),
  bookings: many(bookings),
  slots: many(slots),
}));

// Services table
export const services = pgTable('services', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  duration: text('duration').notNull(),
  price: real('price').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [services.doctorId],
    references: [doctors.id],
  }),
  bookings: many(bookings),
}));

// Patient Profiles table - Users can only access their own
export const patientProfiles = pgTable('patient_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  location: text('location'),
  photoUrl: text('photo_url'),
  emergencyName: text('emergency_name'),
  emergencyRelation: text('emergency_relation'),
  emergencyPhone: text('emergency_phone'),
  medicalNotes: text('medical_notes'),
  insuranceProvider: text('insurance_provider'),
  insurancePolicy: text('insurance_policy'),
  preferredLanguage: text('preferred_language').default('English').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Authenticated users can only read/modify their own profile
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.userId),
    modify: authUid(table.userId),
  }),
]);

export const patientProfilesRelations = relations(patientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

// Bookings table - Users can only access their own bookings
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reference: text('reference').notNull().unique(),
  patientId: text('patient_id').notNull().references(() => patientProfiles.id, { onDelete: 'cascade' }),
  doctorId: text('doctor_id').notNull().references(() => doctors.id, { onDelete: 'restrict' }),
  slotId: text('slot_id').notNull().references(() => slots.id, { onDelete: 'restrict' }),
  serviceId: text('service_id').references(() => services.id, { onDelete: 'restrict' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  time: text('time').notNull(), // HH:MM format
  status: bookingStatusEnum('status').default('PENDING').notNull(),
  price: real('price').notNull(),
  patientNotes: text('patient_notes'),
  paymentMethod: text('payment_method').default('Pay at Clinic').notNull(),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Users can only access their own bookings
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.patientId),
    modify: authUid(table.patientId),
  }),
]);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  patient: one(patientProfiles, {
    fields: [bookings.patientId],
    references: [patientProfiles.id],
  }),
  doctor: one(doctors, {
    fields: [bookings.doctorId],
    references: [doctors.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  disputes: many(disputes),
}));

// Slots table
export const slots = pgTable('slots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  status: slotStatusEnum('status').default('AVAILABLE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const slotsRelations = relations(slots, ({ one }) => ({
  doctor: one(doctors, {
    fields: [slots.doctorId],
    references: [doctors.id],
  }),
}));

// Disputes table
export const disputes = pgTable('disputes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  status: disputeStatusEnum('status').default('OPEN').notNull(),
  clinicStatement: text('clinic_statement'),
  resolutionNote: text('resolution_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const disputesRelations = relations(disputes, ({ one }) => ({
  booking: one(bookings, {
    fields: [disputes.bookingId],
    references: [bookings.id],
  }),
  reporter: one(users, {
    fields: [disputes.reporterId],
    references: [users.id],
  }),
}));

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'info', 'success', 'warning', 'error'
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // Users can only access their own notifications
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.userId),
    modify: authUid(table.userId),
  }),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Reviews table - Patient reviews for doctors after completed bookings
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('booking_id').notNull().unique().references(() => bookings.id, { onDelete: 'cascade' }),
  doctorId: text('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  patientId: text('patient_id').notNull().references(() => patientProfiles.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  response: text('response'), // Doctor/Center response to review
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Anyone can read reviews (public)
  crudPolicy({
    role: anonymousRole,
    read: true,
    modify: null,
  }),
  // Patients can only modify their own reviews
  crudPolicy({
    role: authenticatedRole,
    read: true,
    modify: authUid(table.patientId),
  }),
]);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  doctor: one(doctors, {
    fields: [reviews.doctorId],
    references: [doctors.id],
  }),
  patient: one(patientProfiles, {
    fields: [reviews.patientId],
    references: [patientProfiles.id],
  }),
}));

// Settings table
export const settings = pgTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
