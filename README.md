# Medcin Platform

> **Cross-border healthcare booking platform connecting patients with medical practitioners across Southeast Asia**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-green)](https://neon.tech/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Overview

Medcin is a healthcare booking platform that enables patients to discover and book appointments with verified medical practitioners across Singapore, Thailand, and Malaysia. The platform features separate dashboards for patients, medical centers, and administrators.

### Key Features

- **Patient Dashboard**: Search doctors, book appointments, manage bookings, download receipts
- **Center Dashboard**: Manage doctors, set availability, accept/decline bookings
- **Admin Dashboard**: Approve centers, monitor bookings, resolve disputes
- **Multi-role Authentication**: Email/Password + Google OAuth via Neon Better Auth
- **Real-time Notifications**: Email notifications for bookings and center approvals
- **Mobile App Support**: Flutter mobile app with subscription-based monetization

---

## 💰 Business Model

### **FREE for Medical Centers**
- No platform fees or commissions
- Centers receive bookings at zero cost
- Focus on patient acquisition, not revenue extraction

### **Subscription-Based Mobile App**
- **Mobile patients**: Pay subscription via Google Play / App Store
  - **BASIC**: Monthly subscription
  - **PREMIUM**: Yearly subscription with benefits
- **Web patients**: FREE (desktop/browser access)

### **Payment Flow**
- **All payments handled ON-SITE** at the clinic
- Patients pay doctors directly (cash/card at clinic)
- No payment processing on the platform

### **Revenue Model**
```
Revenue = Mobile App Subscriptions (Google Play + App Store)
Centers = $0 (completely free)
Bookings = $0 transaction fee
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 16.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React Icons

**Backend**
- Next.js API Routes
- Neon Serverless PostgreSQL
- Drizzle ORM
- Row-Level Security (RLS)

**Authentication**
- Neon Better Auth
- Google OAuth
- Role-based access (ADMIN, CENTER, PATIENT)

**Email Service**
- Nodemailer (SMTP)
- HTML email templates
- Booking confirmations
- Center approval notifications

**Mobile App** (Separate)
- Flutter 3.x
- Riverpod state management
- Google Play Billing
- Firebase Cloud Messaging

### Database Schema

```sql
-- Core Tables
users (id, auth_uid, email, name, role, subscription_status, subscription_tier, ...)
centers (id, user_id, name, category, status, license_number, ...)
doctors (id, center_id, name, specialization, license_number, active, ...)
services (id, doctor_id, name, duration, price, ...)
slots (id, doctor_id, date, time, status, ...)
bookings (id, patient_id, doctor_id, slot_id, date, time, status, ...)
patient_profiles (id, user_id, emergency_contact, medical_notes, ...)
disputes (id, booking_id, description, status, resolution, ...)
reviews (id, booking_id, rating, comment, ...)
notifications (id, user_id, type, message, read, ...)

-- Subscription Fields (for mobile app)
users.subscription_status (FREE, ACTIVE, EXPIRED, CANCELLED)
users.subscription_tier (BASIC, PREMIUM)
users.subscription_platform (GOOGLE_PLAY, APP_STORE)
users.subscription_start_date
users.subscription_expiry_date
```

### Row-Level Security (RLS)

**Patients**
- Read: Own bookings, own profile, all doctors/centers (public)
- Write: Own profile, own bookings

**Centers**
- Read: Own center, own doctors, bookings for their doctors
- Write: Own center, own doctors, own availability

**Admins**
- Read: Everything
- Write: Center approvals, dispute resolutions, platform settings

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Neon PostgreSQL account
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/medcin-dashboard.git
cd medcin-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment:
```env
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Neon Better Auth
NEXT_PUBLIC_NEON_AUTH_URL=https://your-auth-endpoint.neonauth.region.aws.neon.tech/neondb/auth

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

4. **Set up the database**

Run database migrations:
```bash
npm run db:push
```

Seed initial data (optional):
```bash
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### First-Time Setup

1. **Create Admin User**
   - Sign up at `/signup/patient`
   - Manually update user role to `ADMIN` in database:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
   ```

2. **Register a Medical Center**
   - Sign up at `/signup/center`
   - Fill in center details and submit for approval
   - Admin approves the center from admin dashboard

3. **Start Booking**
   - Sign up as patient
   - Search doctors and book appointments

---

## 📱 User Roles & Flows

### Patient Flow
1. Sign up → Verify email
2. Search doctors/centers by specialty, location, price
3. Select doctor → Choose service → Pick time slot
4. Fill patient details → Confirm booking
5. Receive confirmation email with booking reference
6. Pay doctor on-site at appointment time

### Center Flow
1. Sign up with center details → Submit application
2. Admin reviews and approves center
3. Receive approval email
4. Add doctors and services
5. Set availability schedules
6. Receive and manage bookings
7. Accept/decline/reschedule appointments

### Admin Flow
1. Monitor pending center applications
2. Review center documents and licenses
3. Approve or reject centers
4. View platform-wide bookings
5. Resolve patient-center disputes
6. Manage platform settings

---

## 🎨 Design System

### Color Palette
```css
--clay: #1769AA;      /* Primary brand color */
--sage: #2F80B7;      /* Secondary accent */
--amber: #4B91C5;     /* Tertiary accent */
--ink: #102A43;       /* Text primary */
--muted: #5C7185;     /* Text secondary */
--paper: #FFFFFF;     /* Background */
--surface: #F0F7FF;   /* Surface/cards */
--mist: #D7E7F5;      /* Borders */
```

### Typography
- **Primary**: IBM Plex Sans (body text)
- **Monospace**: IBM Plex Mono (labels, badges, references)

### Components
- Rounded corners: 12-24px
- Card-based layouts with subtle shadows
- Badge system for status indicators
- Consistent spacing scale (4px base unit)

---

## 🔐 Security

### Authentication
- Neon Better Auth with built-in session management
- Google OAuth for social login
- Secure password hashing (bcrypt)
- HTTP-only cookies for session tokens

### Authorization
- Row-level security (RLS) policies on all tables
- Role-based access control (RBAC)
- API route protection with middleware
- SQL injection prevention via parameterized queries

### Data Protection
- All database connections use SSL (`sslmode=require`)
- Sensitive fields (passwords, tokens) never exposed in API responses
- Rate limiting on authentication endpoints
- CORS policies for API security

---

## 📧 Email Notifications

### Automated Emails
1. **Center Approval** - Sent when admin approves center
2. **Center Rejection** - Sent when admin rejects center with reason
3. **Booking Confirmation** - Sent to patient after booking creation
4. **Booking Cancellation** - Sent when booking is cancelled

### Email Configuration
Uses nodemailer with SMTP. Supports:
- Gmail (with app password)
- SendGrid
- AWS SES
- Custom SMTP servers

Gracefully handles missing email config (logs warning, continues execution).

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Production Preview
```bash
npm run start
```

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Connect your GitHub repository
- Vercel auto-detects Next.js
- Add environment variables from `.env.local`

3. **Set Environment Variables**
```
DATABASE_URL
NEXT_PUBLIC_NEON_AUTH_URL
NEXT_PUBLIC_APP_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```

4. **Deploy**
- Vercel automatically builds and deploys
- Access at `https://your-project.vercel.app`

### Database Migrations
```bash
# Generate migration files
npm run db:generate

# Push schema changes to Neon
npm run db:push

# Seed production data
npm run db:seed
```

---

## 📁 Project Structure

```
medcin-dashboard/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── bookings/        # Booking CRUD
│   │   ├── centers/         # Center management
│   │   ├── doctors/         # Doctor management
│   │   ├── admin/           # Admin endpoints
│   │   └── ...
│   ├── admin/               # Admin dashboard page
│   ├── center/              # Center dashboard page
│   ├── patient/             # Patient dashboard page
│   ├── auth/                # Auth pages
│   ├── login/               # Login page
│   ├── signup/              # Signup flows
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── admin/              # Admin dashboard components
│   ├── center/             # Center dashboard components
│   ├── patient/            # Patient dashboard components
│   └── ...
├── lib/                     # Utility libraries
│   ├── auth/               # Auth helpers
│   ├── email.ts            # Email service
│   ├── store.tsx           # Client state (demo)
│   ├── branding.ts         # Theme configuration
│   └── middleware/         # API middleware
├── db/                      # Database
│   ├── schema.ts           # Drizzle schema
│   ├── index.ts            # Database client
│   └── auth-db.ts          # Auth DB wrapper
├── public/                  # Static assets
├── mobile/                  # Flutter mobile app
│   └── lib/                # Flutter source code
├── data/                    # Mock data (development only)
└── scripts/                 # Database seed scripts
```

---

## 🔄 API Endpoints

### Authentication
```
POST   /api/auth/register      # Create user account
GET    /api/auth/me            # Get current user
POST   /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Bookings
```
GET    /api/bookings          # List bookings (role-filtered)
POST   /api/bookings          # Create booking
PUT    /api/bookings          # Update booking status
DELETE /api/bookings          # Cancel booking
```

### Centers
```
GET    /api/centers           # List centers (public)
POST   /api/centers           # Create center (authenticated)
PUT    /api/centers           # Update center
```

### Doctors
```
GET    /api/doctors           # List doctors (public)
POST   /api/doctors           # Create doctor (center only)
PUT    /api/doctors           # Update doctor
```

### Admin
```
POST   /api/admin/centers/approve  # Approve/reject center
GET    /api/admin/users             # List all users
GET    /api/analytics               # Platform analytics
```

---

## 🚧 Roadmap

### Phase 1: Core Platform ✅
- [x] Multi-role authentication
- [x] Patient booking flow
- [x] Center management dashboard
- [x] Admin approval workflow
- [x] Email notifications
- [x] Database with RLS

### Phase 2: Mobile App (In Progress)
- [ ] Flutter patient app
- [ ] Google Play subscription integration
- [ ] Push notifications (FCM)
- [ ] Offline booking queue
- [ ] Receipt download

### Phase 3: Advanced Features
- [ ] Video consultations
- [ ] Prescription management
- [ ] Lab test booking
- [ ] Insurance integration
- [ ] Multi-language support (TH, MS, CN)

### Phase 4: Scale
- [ ] Analytics dashboard
- [ ] Center performance metrics
- [ ] Patient loyalty program
- [ ] Referral system
- [ ] API for third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure production build passes (`npm run build`)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Documentation**: [docs.medcin.health](https://docs.medcin.health)
- **Email**: support@medcin.health
- **Issues**: [GitHub Issues](https://github.com/yourusername/medcin-dashboard/issues)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

**Built with ❤️ for Southeast Asia's healthcare accessibility**
