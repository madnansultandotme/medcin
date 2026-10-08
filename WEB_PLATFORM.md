# Medcin Web Platform Documentation

> **Cross-Border Healthcare Booking System**  
> Next.js 16 · TypeScript · Neon PostgreSQL · Drizzle ORM · Gmail SMTP

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Authentication Flow](#authentication-flow)
8. [User Roles](#user-roles)
9. [Business Model](#business-model)
10. [Environment Setup](#environment-setup)
11. [Development](#development)
12. [Deployment](#deployment)
13. [Project Structure](#project-structure)

---

## Overview

**Medcin Web Platform** is a FREE cross-border healthcare booking system connecting patients with medical centers across Singapore, Thailand, and Malaysia. The platform facilitates appointment booking, center management, and administrative oversight.

### Key Characteristics

- ✅ **FREE for all users** (Centers & Patients)
- ✅ **No payment processing** (Patients pay on-site at clinics)
- ✅ **No commissions** (Centers keep 100% of fees)
- ✅ **Real-time bookings** with email notifications
- ✅ **Multi-role system** (Admin, Center, Patient)
- ✅ **Production-ready** with 0 build errors

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  Next.js 16 (App Router) + React + TypeScript       │
│  ├─ Admin Dashboard                                  │
│  ├─ Center Dashboard                                 │
│  └─ Patient Dashboard                                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Backend API                        │
│  Next.js API Routes (/app/api/*)                    │
│  ├─ Authentication (Neon Auth)                       │
│  ├─ CRUD Operations (Drizzle ORM)                   │
│  └─ Email Notifications (Nodemailer)                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    Database                          │
│  Neon PostgreSQL (Serverless)                       │
│  ├─ Row-Level Security (RLS)                        │
│  ├─ Drizzle ORM Schema                              │
│  └─ Authenticated Queries                            │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Frontend)
    ↓
useState + useEffect
    ↓
fetch('/api/*')
    ↓
API Route Handler
    ↓
Drizzle ORM Query
    ↓
Neon PostgreSQL
    ↓
Response → Update State
```

---

## Features

### Admin Dashboard
- ✅ Approve/reject center registrations
- ✅ View all centers, doctors, and bookings
- ✅ Manage disputes and claims
- ✅ Platform analytics and metrics
- ✅ User management
- ✅ Email notifications (approval/rejection)

### Center Dashboard
- ✅ Register and manage clinic profile
- ✅ Add doctors and services
- ✅ Confirm/decline booking requests
- ✅ View appointment inbox
- ✅ Manage operating hours and amenities
- ✅ Real-time booking notifications

### Patient Dashboard
- ✅ Browse doctors by specialty/location
- ✅ View doctor profiles and services
- ✅ Book appointments instantly
- ✅ Manage upcoming appointments
- ✅ View booking history
- ✅ Update profile and emergency contacts

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.3.6 (App Router, Turbopack)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: Next.js App Router

### Backend
- **API**: Next.js API Routes (serverless)
- **ORM**: Drizzle ORM
- **Database**: Neon PostgreSQL (Serverless)
- **Auth**: Neon Auth (JWT-based)
- **Email**: Nodemailer (Gmail SMTP)

### Development
- **Package Manager**: npm
- **Build Tool**: Turbopack
- **Linting**: ESLint
- **Type Checking**: TypeScript

---

## Database Schema

### Users Table
```typescript
users {
  id: string (PK)
  authUid: string (Neon Auth ID)
  email: string
  name: string
  phone: string
  photoUrl: string
  role: 'ADMIN' | 'CENTER' | 'PATIENT'
  
  // Subscription fields (for mobile app)
  subscriptionStatus: 'FREE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  subscriptionTier: 'BASIC' | 'PREMIUM'
  subscriptionPlatform: 'GOOGLE_PLAY' | 'APP_STORE'
  subscriptionStartDate: timestamp
  subscriptionExpiryDate: timestamp
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Centers Table
```typescript
centers {
  id: string (PK)
  userId: string (FK → users.id)
  name: string
  category: string
  address: string
  email: string
  phone: string
  licenseNumber: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  logoUrl: string
  coverImageUrl: string
  operatingHours: string
  amenities: string[]
  submittedTime: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Doctors Table
```typescript
doctors {
  id: string (PK)
  centerId: string (FK → centers.id)
  name: string
  role: string
  category: string
  price: number
  rating: number
  reviewsCount: number
  licenseNumber: string
  bio: string
  imageUrl: string
  active: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Services Table
```typescript
services {
  id: string (PK)
  doctorId: string (FK → doctors.id)
  name: string
  duration: string
  price: number
  description: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Bookings Table
```typescript
bookings {
  id: string (PK)
  reference: string (Unique)
  patientId: string (FK → patientProfiles.id)
  doctorId: string (FK → doctors.id)
  slotId: string (FK → slots.id)
  serviceId: string (FK → services.id)
  date: string (YYYY-MM-DD)
  time: string (HH:MM)
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  price: number
  patientNotes: string
  paymentMethod: string (default: 'Pay at Clinic')
  cancellationReason: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Patient Profiles Table
```typescript
patientProfiles {
  id: string (PK)
  userId: string (FK → users.id)
  location: string
  photoUrl: string
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  medicalNotes: string
  insuranceProvider: string
  insurancePolicy: string
  preferredLanguage: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Slots Table
```typescript
slots {
  id: string (PK)
  doctorId: string (FK → doctors.id)
  date: string (YYYY-MM-DD)
  startTime: string (HH:MM)
  endTime: string (HH:MM)
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Disputes Table
```typescript
disputes {
  id: string (PK)
  bookingId: string (FK → bookings.id)
  reporterId: string (FK → users.id)
  title: string
  description: string
  amount: number
  status: 'OPEN' | 'RESOLVED' | 'CLOSED'
  clinicStatement: string
  resolutionNote: string
  createdAt: timestamp
  resolvedAt: timestamp
  updatedAt: timestamp
}
```

### Notifications Table
```typescript
notifications {
  id: string (PK)
  userId: string (FK → users.id)
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: timestamp
}
```

---

## API Routes

### Authentication
- `POST /api/auth/register` - Create new user account
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/change-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Centers
- `GET /api/centers` - List all centers (public)
- `POST /api/centers` - Create new center (authenticated)
- `PUT /api/centers` - Update center profile
- `POST /api/admin/centers/approve` - Approve/reject center (admin only)

### Doctors
- `GET /api/doctors` - List all doctors (public, filterable)
- `POST /api/doctors` - Add doctor (center only)
- `PUT /api/doctors` - Update doctor (center/admin)
- `DELETE /api/doctors` - Soft delete doctor

### Services
- `GET /api/services` - List services (filterable by doctorId)
- `POST /api/services` - Add service (center only)
- `PUT /api/services` - Update service
- `DELETE /api/services` - Delete service

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings` - Update booking status
- `DELETE /api/bookings` - Cancel booking

### Slots
- `GET /api/slots` - List available slots
- `POST /api/slots` - Create slot (center only)
- `PUT /api/slots` - Update slot
- `DELETE /api/slots` - Delete slot

### Disputes
- `GET /api/disputes` - List disputes
- `POST /api/disputes` - Create dispute
- `PUT /api/disputes` - Resolve dispute (admin only)

### Notifications
- `GET /api/notifications` - List user notifications
- `PUT /api/notifications/[id]` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Patient Profile
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/analytics` - Platform analytics (admin only)

---

## Authentication Flow

### 1. User Registration

```typescript
// Patient Signup
POST /api/auth/register
{
  email: string
  password: string
  name: string
  role: 'PATIENT'
  phone?: string
}

Response → Auto login → Redirect to /patient
```

```typescript
// Center Signup
POST /api/auth/register
{
  email: string
  password: string
  name: string
  role: 'CENTER'
}

// Then create center profile
POST /api/centers
{
  name: string
  category: string
  address: string
  phone: string
  licenseNumber: string
  // ... other fields
}

Response → Redirect to /center/under-review
```

### 2. User Login

```typescript
// Login flow
/login → signIn(email, password) → /portal

// Portal auto-routes by role
/portal → fetch('/api/auth/me') → {
  ADMIN: redirect('/admin')
  CENTER: redirect('/center')
  PATIENT: redirect('/patient')
}
```

### 3. Protected Routes

```typescript
// All API routes check authentication
const session = await getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 4. Row-Level Security (RLS)

```typescript
// Database queries use authenticated context
const authDb = getAuthDb(session.token);
const data = await authDb.select().from(table); // RLS applied automatically
```

---

## User Roles

### Admin
- **Access**: Full platform oversight
- **Dashboard**: `/admin`
- **Permissions**:
  - Approve/reject center registrations
  - View all users, centers, doctors, bookings
  - Resolve disputes
  - Manage platform settings
  - View analytics

### Center (Healthcare Provider)
- **Access**: Own center management
- **Dashboard**: `/center`
- **Permissions**:
  - Register clinic
  - Add/edit doctors
  - Add/edit services
  - Confirm/decline bookings
  - View appointment inbox
  - Update center profile

### Patient
- **Access**: Personal appointments
- **Dashboard**: `/patient`
- **Permissions**:
  - Browse doctors
  - Book appointments
  - View booking history
  - Cancel appointments
  - Update profile

---

## Business Model

### Web Platform: 100% FREE

```
┌─────────────────────────────────────────┐
│         WEB PLATFORM (FREE)             │
├─────────────────────────────────────────┤
│ Centers:                                 │
│  ✅ FREE registration                    │
│  ✅ FREE listings                        │
│  ✅ FREE bookings                        │
│  ✅ No commissions (keep 100% of fees)  │
│                                          │
│ Patients:                                │
│  ✅ FREE browsing                        │
│  ✅ FREE booking                         │
│  ✅ Pay on-site at clinic               │
│  ✅ No online payment processing        │
└─────────────────────────────────────────┘
```

### Mobile App: Subscription-Based Revenue

```
┌─────────────────────────────────────────┐
│      MOBILE APP (SUBSCRIPTION)          │
├─────────────────────────────────────────┤
│ FREE Tier:                              │
│  - Browse doctors                        │
│  - View centers                          │
│  - Basic search                          │
│                                          │
│ BASIC Tier (Monthly):                   │
│  - Unlimited bookings                    │
│  - Priority support                      │
│  - Booking reminders                     │
│                                          │
│ PREMIUM Tier (Yearly):                  │
│  - All BASIC features                    │
│  - Health records storage                │
│  - Multi-user family account             │
│  - Exclusive discounts                   │
│                                          │
│ Payment: Google Play / App Store        │
└─────────────────────────────────────────┘
```

**Revenue Model:**
- Web Platform: FREE (customer acquisition)
- Mobile App: Subscription-based (monetization)
- Payment Collection: On-site at clinics (no platform fees)

---

## Environment Setup

### Required Environment Variables

Create `.env.local` file:

```bash
# Neon Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXT_PUBLIC_NEON_AUTH_URL="https://your-project.auth.neon.tech"

# Gmail SMTP (for email notifications)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-password"

# Alternative: Generic SMTP (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Gmail App Password Setup

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use the 16-character password in `GMAIL_PASSWORD`

---

## Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Neon PostgreSQL account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd medcin-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output: 37 pages, 0 errors ✅
```

### Database Commands

```bash
# Push schema to database
npm run db:push

# Generate migrations
npm run db:generate

# Open Drizzle Studio
npm run db:studio
```

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Set in Vercel Dashboard → Settings → Environment Variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Checklist

- ✅ `DATABASE_URL` configured
- ✅ `NEXT_PUBLIC_NEON_AUTH_URL` configured
- ✅ `GMAIL_USER` and `GMAIL_PASSWORD` configured
- ✅ Domain configured (if using custom domain)
- ✅ SSL certificates (automatic on Vercel)

---

## Project Structure

```
medcin-dashboard/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── admin/              # Admin-only endpoints
│   │   ├── bookings/           # Booking management
│   │   ├── centers/            # Center management
│   │   ├── doctors/            # Doctor management
│   │   ├── services/           # Service management
│   │   ├── slots/              # Slot management
│   │   ├── disputes/           # Dispute management
│   │   ├── notifications/      # Notification system
│   │   └── patient/            # Patient-specific endpoints
│   ├── admin/                  # Admin dashboard pages
│   ├── center/                 # Center dashboard pages
│   ├── patient/                # Patient dashboard pages
│   ├── doctors/[id]/           # Doctor detail pages
│   ├── centers/[id]/           # Center detail pages
│   ├── login/                  # Login page
│   ├── signup/                 # Signup pages
│   ├── portal/                 # Auth router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
│
├── components/
│   ├── admin/                  # Admin components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsersTab.tsx
│   │   └── AdminProfileTab.tsx
│   ├── center/                 # Center components
│   │   ├── CenterDashboard.tsx
│   │   └── CenterProfileTab.tsx
│   ├── patient/                # Patient components
│   │   ├── PatientDashboard.tsx
│   │   └── PatientProfileTab.tsx
│   ├── Navbar.tsx              # Navigation bar
│   ├── Footer.tsx              # Footer
│   └── MedcinLogo.tsx          # Logo component
│
├── lib/
│   ├── auth/                   # Authentication utilities
│   │   ├── AuthProvider.tsx
│   │   └── get-session.ts
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.ts
│   ├── middleware/             # API middleware
│   │   └── permissions.ts
│   ├── branding.tsx            # Branding context
│   └── email.ts                # Email service
│
├── db/
│   ├── schema.ts               # Drizzle schema
│   ├── index.ts                # Database connection
│   └── auth-db.ts              # Authenticated DB instance
│
├── config/
│   └── branding.json           # Branding configuration
│
├── public/
│   └── images/                 # Static images
│
├── .env.local                  # Environment variables (not in git)
├── .env.example                # Example environment variables
├── drizzle.config.ts           # Drizzle configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## Key Files Explained

### `/app/api/bookings/route.ts`
Handles booking CRUD operations with email notifications:
- GET: List user's bookings
- POST: Create booking + send confirmation email
- PUT: Update booking status
- DELETE: Cancel booking

### `/components/admin/AdminDashboard.tsx`
Admin interface with tabs for:
- Centers Directory (approve/reject)
- Doctors Network
- Global Bookings
- Disputes & Claims
- Platform Settings
- Admin Users
- Profile

### `/components/center/CenterDashboard.tsx`
Center interface with tabs for:
- Appointment Inbox (confirm/decline)
- Medical Team (add doctors/services)
- Practice Profile

### `/components/patient/PatientDashboard.tsx`
Patient interface with tabs for:
- Browse Doctors (search, filter)
- My Appointments (upcoming/past)
- My Profile

### `/lib/email.ts`
Email service using Nodemailer with templates for:
- Center approval/rejection
- Booking confirmation
- Booking cancellation
- Appointment reminders

### `/db/schema.ts`
Complete Drizzle ORM schema with:
- All table definitions
- Relations
- RLS policies
- Enums

---

## API Examples

### Create Booking

```typescript
POST /api/bookings
Content-Type: application/json

{
  "doctorId": "doc-123",
  "serviceId": "svc-456",
  "slotId": "slot-789",
  "date": "2024-06-15",
  "time": "14:30",
  "patientNotes": "First visit"
}

Response:
{
  "booking": {
    "id": "book-abc",
    "reference": "BK-2024-001",
    "status": "PENDING",
    "price": 85.00,
    ...
  },
  "message": "Booking created successfully"
}
```

### Approve Center

```typescript
POST /api/admin/centers/approve
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "centerId": "ctr-123",
  "action": "APPROVE"
}

Response:
{
  "center": {
    "id": "ctr-123",
    "status": "ACTIVE",
    ...
  },
  "message": "Center approved and email sent"
}
```

### List Doctors

```typescript
GET /api/doctors?category=Dental&search=smith

Response:
{
  "doctors": [
    {
      "id": "doc-123",
      "name": "Dr. Jane Smith",
      "role": "Dentist",
      "category": "Dental",
      "price": 85.00,
      "rating": 4.8,
      "reviewsCount": 124,
      ...
    }
  ],
  "count": 1
}
```

---

## Email Notifications

### Supported Events

1. **Center Approved**
   - Recipient: Center owner
   - Template: Approval confirmation
   - Trigger: Admin approves center

2. **Center Rejected**
   - Recipient: Center owner
   - Template: Rejection notice
   - Trigger: Admin rejects center

3. **Booking Confirmed**
   - Recipient: Patient
   - Template: Appointment details
   - Trigger: Center confirms booking

4. **Booking Cancelled**
   - Recipient: Patient
   - Template: Cancellation notice
   - Trigger: Patient or center cancels

### Email Templates

Templates are defined in `/lib/email.ts` with:
- Professional HTML formatting
- Branding colors
- Actionable information
- Contact details

---

## Testing

### Manual Testing Checklist

**Admin Flow:**
- [ ] Login as admin
- [ ] View pending centers
- [ ] Approve/reject center
- [ ] Verify email sent
- [ ] View all bookings
- [ ] Resolve dispute

**Center Flow:**
- [ ] Register center
- [ ] Wait for approval
- [ ] Add doctor
- [ ] Add services
- [ ] Confirm booking
- [ ] Decline booking

**Patient Flow:**
- [ ] Register account
- [ ] Browse doctors
- [ ] View doctor profile
- [ ] Book appointment
- [ ] View booking status
- [ ] Cancel appointment

---

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues

```bash
# Verify DATABASE_URL format
# Should include ?sslmode=require
postgresql://user:password@host/database?sslmode=require
```

### Email Not Sending

```bash
# Check Gmail credentials
# Verify App Password (not regular password)
# Test with: npm run test-email (if you create this script)
```

### Authentication Errors

```bash
# Check NEXT_PUBLIC_NEON_AUTH_URL
# Verify it's publicly accessible
# Format: https://your-project.auth.neon.tech
```

---

## Performance Optimization

### Database
- ✅ Indexed columns (userId, centerId, doctorId)
- ✅ RLS policies for security
- ✅ Connection pooling (Neon serverless)

### Frontend
- ✅ React Server Components where possible
- ✅ Dynamic imports for large components
- ✅ Image optimization with Next.js Image
- ✅ CSS modules and Tailwind JIT

### API
- ✅ Edge runtime for auth routes
- ✅ Response caching where appropriate
- ✅ Efficient database queries
- ✅ Rate limiting (can be added)

---

## Security Considerations

### Authentication
- ✅ JWT-based auth with Neon Auth
- ✅ Secure password hashing
- ✅ Session management
- ✅ CSRF protection

### Database
- ✅ Row-Level Security (RLS)
- ✅ Parameterized queries (SQL injection prevention)
- ✅ User-scoped data access
- ✅ Encrypted connections (SSL)

### API
- ✅ Input validation
- ✅ Rate limiting (recommended)
- ✅ CORS configuration
- ✅ Error handling without leaking details

---

## Support & Maintenance

### Logs
- Check Vercel logs for errors
- Monitor Neon database metrics
- Review email delivery status

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring
- Set up Vercel Analytics
- Monitor Neon database usage
- Track API response times
- Monitor email delivery rates

---

## License

Proprietary - All rights reserved

---

## Contact

For support or questions:
- Email: support@medcin.health
- Platform: Medcin Web Dashboard
- Region: Singapore, Thailand, Malaysia

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
