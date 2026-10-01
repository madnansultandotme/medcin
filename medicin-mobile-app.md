# Medcin Patient Mobile App - Implementation Plan

> **Current Phase**: Building complete UI with demo/mock data. Backend integration will be implemented in future phases.
> 
> **Platform Target**: Android only (iOS support in future)
> 
> **Key Approach**: Use `flutter pub add` for dependencies, not hardcoded pubspec.yaml entries

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Requirements](#requirements)
3. [Background](#background)
4. [Proposed Solution](#proposed-solution)
5. [Architecture Overview](#architecture-overview)
6. [Task Breakdown](#task-breakdown)
7. [Appendix](#appendix)

---

## Problem Statement

Build a Flutter mobile application for the patient role in the Medcin healthcare booking platform. The app should mirror the web dashboard's functionality with a mobile-optimized UI, using the same color theme (clay/sage blues). The app will use local mock data initially but be structured for easy API integration later, support multiple authentication methods (Email/Password, Google, Apple), and include push notifications for appointment management.

---

## Requirements

### Core Features
- **Extended patient flow**: Search doctors/centers → View details → Book appointments → Manage bookings → Profile management → Reschedule/cancel → Download receipts
- **Multiple authentication**: Email/Password, Google Sign-In, Apple Sign-In
- **Push notifications**: Appointment reminders and confirmations
- **Navigation skeleton approach**: All screens with basic layouts first, then detailed implementation
- **Riverpod state management**: Modern reactive state management
- **English language only**: i18n-ready structure for future expansion
- **Hybrid data approach**: Local mock data with clean architecture for API migration

### Design Requirements

**Color Palette** (matching web dashboard):
- **Primary (Clay)**: `#1769AA`
- **Secondary (Sage)**: `#2F80B7`
- **Accent (Amber)**: `#4B91C5`
- **Text (Ink)**: `#102A43`
- **Background (Paper)**: `#FFFFFF`
- **Border (Mist)**: `#D7E7F5`
- **Muted text**: `#5C7185`

**Typography**:
- IBM Plex Sans for body text
- IBM Plex Mono for labels/badges

**UI Elements**:
- Rounded corners (12-24px) similar to web version
- Badge system for statuses (confirmed, pending, cancelled)
- Consistent card-based layouts
- Bottom sheet modals for filters and actions

### Technical Requirements

**Core Technologies**:
- Flutter 3.x with Dart 3.x
- Riverpod for state management
- Go Router for navigation
- Hive for local storage
- Firebase Cloud Messaging for notifications
- Firebase Authentication for auth providers
- Google Sign-In & Sign in with Apple packages

**Development Principles**:
- Clean architecture (presentation, domain, data layers)
- Repository pattern for data access
- Feature-based folder structure
- Structured for future REST API integration

---

## Background

### Web Dashboard Context

The existing Next.js web dashboard includes:
- Local JSON state management (`local-state.json`)
- Three user roles: Admin, Center, Patient
- CSS variable-based theming
- Patient features:
  - Doctor/center search with filters (specialty, location, price)
  - Multi-step booking flow (service → slot → details → confirmation)
  - Booking management (view, reschedule, cancel)
  - Receipt generation
  - Profile management

### Data Models

**Key entities from web dashboard**:
- `Doctor`: id, name, role, category, clinic, location, price, rating, services[], licenseNumber, bio, image
- `Center`: id, name, category, address, email, phone, licenseNumber, status, logo, doctorCount, amenities[], operatingHours
- `Booking`: id, reference, patientInfo, doctorInfo, clinicInfo, serviceInfo, date, time, price, status, paymentMethod
- `Service`: id, name, duration, price, description
- `PatientProfile`: id, name, email, phone, location, photo, emergencyContact, medicalNotes
- `Slot`: doctorId-day-time, status (available/booked/blocked)

### Mobile App Focus

The mobile app will:
- Focus solely on patient role
- Provide streamlined mobile UX
- Maintain visual consistency with web
- Add mobile-specific features (push notifications)
- Prepare for future API integration

---

## Proposed Solution

### Architecture Approach

Create a Flutter mobile application with **clean architecture** that separates concerns into three layers:

1. **Presentation Layer** (UI)
   - Screens/Pages
   - Widgets
   - Riverpod providers for UI state

2. **Domain Layer** (Business Logic)
   - Use cases
   - Repository interfaces
   - Entity models

3. **Data Layer** (Data Sources)
   - Repository implementations
   - Local data source (Hive)
   - API data source (future)
   - Data models with serialization

### Key Technical Decisions

**State Management**: Riverpod
- Type-safe and compile-time safe
- Great for dependency injection
- Easy testing and debugging
- Modern alternative to Provider

**Navigation**: Go Router
- Declarative routing
- Deep linking support
- Type-safe navigation
- Auth guards built-in

**Local Storage**: Hive
- Fast NoSQL database
- Type-safe
- No native dependencies
- Easy to use with models

**Authentication**: Firebase Auth
- Supports multiple providers (email, Google, Apple)
- Secure token management
- Well-documented
- Easy to integrate with FCM

**Notifications**: Firebase Cloud Messaging
- Cross-platform push notifications
- Reliable delivery
- Topic-based messaging
- Integrates with local notifications

### Design System

**Component Library**:
- `MedcinButton`: Primary, secondary, text variants
- `MedcinCard`: Elevation and border variants
- `MedcinBadge`: Status badges with colors
- `MedcinTextField`: Form inputs with validation
- `RatingStars`: 5-star rating display
- `DoctorCard`: Reusable doctor list item
- `AppointmentCard`: Booking list item
- `FilterChip`: Selectable filter chips

**Theme Configuration**:
```dart
ThemeData(
  primaryColor: Color(0xFF1769AA), // Clay
  colorScheme: ColorScheme.light(
    primary: Color(0xFF1769AA),
    secondary: Color(0xFF2F80B7),
    tertiary: Color(0xFF4B91C5),
  ),
  scaffoldBackgroundColor: Color(0xFFFFFFFF),
  fontFamily: 'IBM Plex Sans',
)
```

---

## Architecture Overview

### Folder Structure

```
medcin-dashboard/
└── mobile/
    ├── android/              # Android native configuration
    ├── ios/                  # iOS native configuration
    ├── lib/
    │   ├── core/
    │   │   ├── constants/    # App constants, API endpoints
    │   │   ├── theme/        # Theme configuration, colors, text styles
    │   │   ├── utils/        # Helper functions, extensions
    │   │   └── error/        # Error handling, exceptions
    │   │
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── data/           # Auth repository implementation
    │   │   │   ├── domain/         # Auth use cases, entities
    │   │   │   ├── presentation/   # Login, signup screens
    │   │   │   └── providers/      # Auth state providers
    │   │   │
    │   │   ├── home/
    │   │   │   ├── presentation/   # Dashboard screen
    │   │   │   └── widgets/        # Dashboard widgets
    │   │   │
    │   │   ├── search/
    │   │   │   ├── data/           # Search repository
    │   │   │   ├── domain/         # Search use cases
    │   │   │   ├── presentation/   # Search screen, filters
    │   │   │   └── providers/      # Search state
    │   │   │
    │   │   ├── booking/
    │   │   │   ├── data/           # Booking repository
    │   │   │   ├── domain/         # Booking use cases
    │   │   │   ├── presentation/   # Booking flow screens
    │   │   │   └── providers/      # Booking state
    │   │   │
    │   │   ├── appointments/
    │   │   │   ├── data/           # Appointments repository
    │   │   │   ├── domain/         # Appointment use cases
    │   │   │   ├── presentation/   # My appointments screen
    │   │   │   └── providers/      # Appointments state
    │   │   │
    │   │   └── profile/
    │   │       ├── data/           # Profile repository
    │   │       ├── domain/         # Profile use cases
    │   │       ├── presentation/   # Profile, settings screens
    │   │       └── providers/      # Profile state
    │   │
    │   ├── shared/
    │   │   ├── models/       # Shared data models (Doctor, Booking, etc.)
    │   │   ├── widgets/      # Reusable widgets (buttons, cards, etc.)
    │   │   └── providers/    # Global providers
    │   │
    │   └── main.dart         # App entry point
    │
    ├── assets/
    │   ├── fonts/            # IBM Plex Sans, IBM Plex Mono
    │   ├── images/           # App icons, illustrations
    │   └── data/             # Mock JSON data
    │
    ├── pubspec.yaml          # Dependencies
    └── README.md             # Project documentation
```

### Navigation Structure

```
/ (Root)
├── /splash           # Splash screen
├── /auth
│   ├── /login        # Login screen
│   ├── /signup       # Signup screen
│   └── /forgot       # Forgot password
│
└── /main (Shell with bottom nav)
    ├── /home         # Dashboard
    ├── /search       # Doctor/Center search
    │   ├── /doctor/:id         # Doctor detail
    │   └── /center/:id         # Center detail
    ├── /booking      # Booking flow
    │   ├── /service            # Step 1: Service selection
    │   ├── /slot               # Step 2: Slot selection
    │   ├── /details            # Step 3: Patient details
    │   └── /confirmation       # Step 4: Confirmation
    ├── /appointments # My appointments
    │   └── /appointment/:id    # Appointment detail
    └── /profile      # Profile & settings
        ├── /edit               # Edit profile
        └── /settings           # Settings
```

---

## Task Breakdown

### Task 1: Project Setup and Architecture Foundation

**Objective**: Initialize the Flutter project with proper configuration, dependencies, and folder structure.

**Implementation Steps**:
1. Create new Flutter project: `flutter create medcin_mobile` in `medcin-dashboard/mobile/`
2. Update `pubspec.yaml` with dependencies:
   ```yaml
   dependencies:
     flutter_riverpod: ^2.4.0
     go_router: ^12.0.0
     hive: ^2.2.3
     hive_flutter: ^1.1.0
     firebase_core: ^2.20.0
     firebase_auth: ^4.12.0
     firebase_messaging: ^14.7.0
     google_sign_in: ^6.1.5
     sign_in_with_apple: ^5.0.0
     google_fonts: ^6.1.0
     flutter_secure_storage: ^9.0.0
     json_annotation: ^4.8.1
     freezed_annotation: ^2.4.1
     dio: ^5.3.3
     shared_preferences: ^2.2.2
     intl: ^0.18.1
   
   dev_dependencies:
     build_runner: ^2.4.6
     json_serializable: ^6.7.1
     freezed: ^2.4.5
     hive_generator: ^2.0.1
   ```
3. Create folder structure as per architecture overview
4. Configure Android (`build.gradle`, `AndroidManifest.xml`) for min SDK 21
5. Configure iOS (`Info.plist`) for iOS 12+, camera/location permissions placeholders
6. Create `lib/core/theme/app_theme.dart` with Medcin color palette:
   ```dart
   class AppColors {
     static const clay = Color(0xFF1769AA);
     static const sage = Color(0xFF2F80B7);
     static const amber = Color(0xFF4B91C5);
     static const ink = Color(0xFF102A43);
     static const paper = Color(0xFFFFFFFF);
     static const mist = Color(0xFFD7E7F5);
     static const muted = Color(0xFF5C7185);
   }
   ```
7. Configure Google Fonts for IBM Plex Sans and IBM Plex Mono
8. Create `ProviderScope` wrapper in `main.dart`
9. Add basic error boundary and logging

**Demo**: Empty app launches with Medcin colors on splash screen, IBM Plex fonts load correctly, no console errors, clean build on both iOS and Android.

---

### Task 2: Core Models and Local Data Layer

**Objective**: Create all data models and set up local storage infrastructure with mock data.

**Implementation Steps**:
1. Create model classes in `lib/shared/models/`:
   - `doctor.dart`: Doctor entity with freezed/json_serializable
   - `center.dart`: Medical center entity
   - `service.dart`: Medical service/procedure entity
   - `booking.dart`: Appointment booking entity
   - `patient_profile.dart`: Patient profile entity
   - `slot.dart`: Availability slot entity
2. Add JSON serialization code generation annotations
3. Run `flutter pub run build_runner build` to generate `.g.dart` files
4. Create Hive type adapters for each model
5. Copy `local-state.json` to `assets/data/mock_data.json`
6. Create `lib/core/data/local_database.dart` with Hive initialization
7. Create repository interfaces in each feature's `domain/` folder:
   - `IDoctorRepository`
   - `IBookingRepository`
   - `IProfileRepository`
8. Implement local repositories in `data/` folders:
   - `LocalDoctorRepository` (reads from Hive, fallback to JSON)
   - `LocalBookingRepository` (CRUD operations in Hive)
   - `LocalProfileRepository` (stores patient profile)
9. Create Riverpod providers for repositories
10. Seed initial mock data on first app launch

**Demo**: App initializes with mock data loaded into Hive, can query doctors/centers/bookings from local storage, data persists across app restarts.

---

### Task 3: Authentication Infrastructure

**Objective**: Set up Firebase Authentication with email/password, Google, and Apple sign-in providers.

**Implementation Steps**:
1. Create Firebase project at console.firebase.google.com
2. Add iOS and Android apps to Firebase project
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Configure Firebase in Android `build.gradle` and iOS `Podfile`
5. Create `lib/features/auth/data/auth_repository.dart` with methods:
   - `signInWithEmail(email, password)`
   - `signUpWithEmail(email, password)`
   - `signInWithGoogle()`
   - `signInWithApple()`
   - `signOut()`
   - `resetPassword(email)`
   - `getCurrentUser()`
6. Implement Firebase Auth wrappers for each provider
7. Configure Google Sign-In (get OAuth client IDs)
8. Configure Apple Sign-In (enable in Apple Developer portal)
9. Create `lib/features/auth/providers/auth_provider.dart` with `StateNotifierProvider`
10. Implement secure token storage with `flutter_secure_storage`
11. Create auth state stream provider for reactive auth state
12. Add error handling for auth failures (wrong password, user not found, etc.)

**Demo**: Can sign in with email/password (mock user), Google sign-in flow works, Apple sign-in flow works, auth state persists across app restarts, sign out clears session.

---

### Task 4: Navigation and Routing Setup

**Objective**: Configure declarative routing with Go Router and implement authentication guards.

**Implementation Steps**:
1. Create `lib/core/router/app_router.dart`
2. Define all route paths as constants:
   ```dart
   class AppRoutes {
     static const splash = '/';
     static const login = '/login';
     static const signup = '/signup';
     static const home = '/home';
     static const search = '/search';
     // ... etc
   }
   ```
3. Configure `GoRouter` with routes:
   - Public routes: splash, login, signup, forgot password
   - Protected routes: home, search, booking, appointments, profile
4. Implement redirect logic based on auth state
5. Create `ShellRoute` for main app with bottom navigation:
   - Home tab
   - Search tab
   - Appointments tab
   - Profile tab
6. Create `lib/shared/widgets/app_bottom_nav.dart` with 4 navigation items
7. Configure page transitions (fade for bottom nav, slide for push)
8. Set up deep linking configuration for Android and iOS
9. Add hero animations for doctor images between screens
10. Handle back button navigation correctly (Android back, iOS swipe)

**Demo**: Navigate through all screens using bottom nav, tap icons to switch tabs, push to detail screens and back, deep links open correct screens, auth redirects work (logged out → login, logged in → home).

---

### Task 5: Authentication Screens UI

**Objective**: Build complete authentication flow UI matching Medcin design system.

**Implementation Steps**:
1. **Splash Screen** (`lib/features/auth/presentation/splash_screen.dart`):
   - Medcin logo centered
   - Clay background gradient
   - Fade animation
   - Check auth state and navigate after 2 seconds
2. **Login Screen** (`lib/features/auth/presentation/login_screen.dart`):
   - Email text field with validation
   - Password text field with show/hide toggle
   - "Forgot Password?" link
   - Primary "Sign In" button
   - Divider with "or continue with"
   - Google sign-in button with logo
   - Apple sign-in button with logo
   - "Don't have an account? Sign up" link
   - Form validation error messages
   - Loading state overlay
3. **Signup Screen** (`lib/features/auth/presentation/signup_screen.dart`):
   - Name text field
   - Email text field
   - Phone text field
   - Password text field with strength indicator
   - Confirm password field
   - Terms & conditions checkbox
   - "Create Account" button
   - Social sign-up buttons
   - "Already have an account? Login" link
4. **Forgot Password Screen** (`lib/features/auth/presentation/forgot_password_screen.dart`):
   - Email text field
   - "Send Reset Link" button
   - Success message state
   - Back to login link
5. Style all screens with Medcin colors, IBM Plex fonts, rounded buttons
6. Add keyboard handling and focus management
7. Implement haptic feedback on button taps
8. Add loading spinners and error snackbars

**Demo**: Complete authentication journey: splash → login (with validation) → signup → forgot password. Social login buttons show proper UI. All forms validate correctly. Loading states appear during auth. Error messages display for invalid credentials.

---

### Task 6: Home/Dashboard Screen

**Objective**: Build the patient dashboard as the main landing screen after login.

**Implementation Steps**:
1. Create `lib/features/home/presentation/home_screen.dart`
2. **Header Section**:
   - Patient profile photo (circular avatar) or initials
   - Greeting text "Good morning, Marcus"
   - Location with map pin icon "Novena, Singapore"
   - Notification bell icon with badge
3. **Quick Action Cards** (horizontal scrollable):
   - "Find Care" card with search icon
   - "Book Appointment" card with calendar icon
   - "My Appointments" card with list icon
   - Each card has icon, title, subtitle, navigation
4. **Upcoming Appointments Widget**:
   - Section title "Upcoming Appointments"
   - List of next 2-3 appointments
   - Mini appointment cards: doctor photo, name, date/time, clinic
   - "View All" button
   - Empty state if no appointments
5. **Stats Overview** (optional):
   - Total consultations count
   - Upcoming appointments count
   - Card-based layout
6. **Featured Doctors Carousel** (optional):
   - Horizontal scrolling doctor cards
   - Top-rated or recently viewed doctors
7. Implement pull-to-refresh to reload data
8. Add skeleton loading states while data loads
9. Style with clay primary color, sage accents, paper background

**Demo**: Dashboard shows patient profile, quick action cards are tappable and navigate correctly, upcoming appointments display with real mock data, pull-to-refresh works, stats show correct counts, smooth scrolling throughout.

---

### Task 7: Doctor/Center Search and Filtering

**Objective**: Build the search and discovery screen with filtering capabilities.

**Implementation Steps**:
1. Create `lib/features/search/presentation/search_screen.dart`
2. **Top Section**:
   - Tab toggle: "Doctors" / "Centers" (similar to web)
   - Search bar with search icon and clear button
   - Filter button (opens bottom sheet)
3. **Filter Bottom Sheet** (`lib/features/search/widgets/filter_bottom_sheet.dart`):
   - **Specialty Section**: Radio buttons or chips
     - All Specialties
     - Dental
     - Massage
     - Physio
     - Dermatology
   - **Location Section**: Checkboxes or chips
     - All ASEAN Hubs
     - Singapore (Novena) 🇸🇬
     - Bangkok (Sukhumvit) 🇹🇭
     - Kuala Lumpur (KLCC) 🇲🇾
     - Phuket (Laguna) 🇹🇭
     - Penang (George Town) 🇲🇾
   - **Sort By**: Dropdown
     - Top Rated Practitioners
     - Price: Lowest First
     - Price: Highest First
   - "Reset" and "Apply" buttons
4. **Doctor Card** (`lib/features/search/widgets/doctor_card.dart`):
   - Doctor photo or initials circle
   - Name and verified badge
   - Specialty/role text
   - Star rating and review count
   - Clinic name and location with pin icon
   - Starting price "from SGD 85"
   - Tap navigates to doctor detail
5. **Center Card** (`lib/features/search/widgets/center_card.dart`):
   - Center logo or building icon
   - Name and category badge
   - Address with location icon
   - Doctor count
   - Status badge (active/pending)
   - Tap navigates to center detail
6. Implement search functionality with text input filtering
7. Implement filter logic (combine specialty + location + sort)
8. Add empty state "No practitioners found" with illustration
9. Add loading shimmer for cards while searching
10. Implement list scroll performance optimization

**Demo**: Toggle between doctors and centers view, search by name filters results in real-time, open filter sheet and apply filters (specialty + location + sort), see filtered results, tap doctor card to navigate to detail, empty state shows when no results.

---

### Task 8: Doctor/Center Detail Screen

**Objective**: Display complete doctor or center profile information.

**Implementation Steps**:
1. **Doctor Detail Screen** (`lib/features/search/presentation/doctor_detail_screen.dart`):
   - **Hero Header**:
     - Large doctor photo with hero animation
     - Name and verified badge
     - Specialty and role
     - Star rating (larger) and review count
     - License number in smaller text
   - **About Section**:
     - Bio text
     - Years of experience
     - Education/credentials
   - **Clinic Information Card**:
     - Clinic name with building icon
     - Full address with map pin icon
     - Map placeholder (Google Maps integration placeholder)
     - "Get Directions" button
   - **Services & Procedures Section**:
     - Grid or list of service cards
     - Each card: service name, duration, price
     - Tap service to pre-select for booking
   - **Reviews Section** (optional):
     - Star rating breakdown
     - Recent reviews list (mock data)
     - "See All Reviews" button
   - **Floating CTA Button**:
     - "Book Appointment" button fixed at bottom
     - Clay background, white text
     - Navigates to booking flow with doctor pre-selected
2. **Center Detail Screen** (`lib/features/search/presentation/center_detail_screen.dart`):
   - Hero cover image or logo
   - Center name, category badge, status badge
   - Full address and contact info
   - Operating hours
   - Amenities list with checkmark icons
   - **Doctors at this Center**:
     - List of doctor cards (reuse component)
     - Tap to view doctor detail
   - "Contact Center" button
3. Implement back button navigation
4. Add share button to share doctor/center profile
5. Style consistently with Medcin design system

**Demo**: Navigate from search results to doctor detail, see all information displayed beautifully, hero animation works smoothly, tap service card shows visual feedback, tap "Book Appointment" navigates to booking flow, view center detail with doctors list, back navigation works correctly.

---

### Task 9: Booking Flow - Service Selection & Slot Selection

**Objective**: Build the first two steps of the booking wizard.

**Implementation Steps**:
1. **Booking Flow Container** (`lib/features/booking/presentation/booking_flow_screen.dart`):
   - Step indicator at top (4 dots/steps)
   - Current step highlighted in clay color
   - Progress bar connecting steps
   - Back button to exit flow (with confirmation dialog)
2. **Step 1: Service Selection** (`lib/features/booking/presentation/service_selection_screen.dart`):
   - Doctor info card at top (photo, name, clinic)
   - "Select a Service" title
   - List of service cards with radio selection:
     - Service name
     - Duration with clock icon
     - Price with currency formatting
     - Description in smaller text
     - Selected state with checkmark and border
   - "Next" button at bottom (enabled when service selected)
   - Back button
3. **Step 2: Slot Selection** (`lib/features/booking/presentation/slot_selection_screen.dart`):
   - Selected service summary card at top
   - Calendar date picker:
     - Month/year header with navigation arrows
     - Calendar grid with available/unavailable days
     - Available days in clay color
     - Unavailable days grayed out
     - Selected day highlighted with background
   - Time slot grid (once date selected):
     - Grouped by Morning / Afternoon / Evening
     - Each slot as a chip/button
     - Available slots: white with clay border
     - Booked slots: muted background, strikethrough
     - Blocked slots: hidden or disabled
     - Selected slot: clay background, white text
   - "Next" button (enabled when both date and time selected)
   - "Back" button to return to service selection
4. Create booking state provider with Riverpod to store:
   - Selected doctor
   - Selected service
   - Selected date
   - Selected time
   - Patient details (next step)
5. Load slot availability from mock data
6. Add smooth transitions between steps

**Demo**: Start booking flow from doctor detail, see step indicator showing step 1/4, select a service (visual feedback), tap Next, see step 2/4, select date from calendar (available dates are highlighted), see time slots appear, select a time slot, tap Next to proceed to step 3.

---

### Task 10: Booking Flow - Patient Details & Confirmation

**Objective**: Complete the booking wizard with patient information and confirmation.

**Implementation Steps**:
1. **Step 3: Patient Details** (`lib/features/booking/presentation/patient_details_screen.dart`):
   - "Your Information" title
   - Form fields (pre-filled from profile):
     - Full name text field
     - Email text field
     - Phone text field
   - "Special Requests or Notes" text area:
     - Multi-line input
     - Character counter (max 500)
     - Placeholder text
   - Insurance information section (optional):
     - Insurance provider
     - Policy number
   - "Review Booking" button at bottom
   - "Back" button to return to slot selection
   - Form validation on submission
2. **Step 4: Review & Confirm** (`lib/features/booking/presentation/booking_confirmation_screen.dart`):
   - "Review Your Appointment" title
   - Summary cards:
     - **Doctor & Service Card**:
       - Doctor photo, name
       - Service name, duration
     - **Date & Time Card**:
       - Date with calendar icon
       - Time with clock icon
     - **Clinic Card**:
       - Clinic name
       - Full address
       - Get directions link
     - **Patient Info Card**:
       - Name, email, phone
       - Special notes
     - **Payment Card**:
       - Total price (large, bold)
       - Payment method: "Pay at Clinic"
   - Terms & conditions checkbox
   - "Confirm Appointment" button (clay, large)
   - "Edit" links on each card to go back and modify
3. **Booking Success Screen** (`lib/features/booking/presentation/booking_success_screen.dart`):
   - Large checkmark icon with animation
   - "Appointment Confirmed!" title
   - Booking reference number (e.g., "MED-SG-92841")
   - Appointment summary
   - Action buttons:
     - "Download Receipt" button
     - "Add to Calendar" button
     - "View My Appointments" button
     - "Back to Home" button
4. Implement booking creation logic:
   - Generate unique booking reference
   - Save booking to Hive
   - Update local state
5. Implement receipt generation (plain text format like web)
6. Implement calendar event creation (device calendar)
7. Show success snackbar on booking confirmation

**Demo**: Continue from step 2, see patient details pre-filled, add special notes, tap Review, see complete booking summary with all information, tap Confirm (after accepting terms), see success screen with animation, booking reference displays, download receipt file, add to device calendar, navigate to appointments to see new booking.

---

### Task 11: My Appointments Screen

**Objective**: Display and manage all patient bookings.

**Implementation Steps**:
1. Create `lib/features/appointments/presentation/appointments_screen.dart`
2. **Tab Bar**:
   - Three tabs: "Upcoming", "Past", "Cancelled"
   - Clay underline indicator for active tab
   - Badge counts on tabs (e.g., "Upcoming (3)")
3. **Appointment Card** (`lib/features/appointments/widgets/appointment_card.dart`):
   - Status badge at top right (confirmed/pending/cancelled)
   - Doctor photo and name
   - Service name
   - Date and time with icons
   - Clinic name and location
   - Price
   - Action buttons:
     - "View Details" button
     - "Reschedule" button (only for upcoming)
     - "Cancel" button (only for upcoming/pending)
4. **Appointment Detail Bottom Sheet** (`lib/features/appointments/widgets/appointment_detail_sheet.dart`):
   - Full booking information display
   - Booking reference number
   - Complete summary (same as booking confirmation)
   - "Download Receipt" button for completed appointments
   - "Get Directions" button for clinic
   - Close button
5. **Reschedule Dialog** (`lib/features/appointments/widgets/reschedule_dialog.dart`):
   - Current appointment date/time display
   - New date picker (reuse slot selection calendar)
   - New time slot selection (reuse slot grid)
   - Reason dropdown (optional)
   - "Confirm Reschedule" button
   - Cancel button
6. **Cancel Dialog** (`lib/features/appointments/widgets/cancel_dialog.dart`):
   - Warning text about cancellation
   - Reason dropdown:
     - Schedule conflict
     - Found another provider
     - Feeling better
     - Other (with text field)
   - "Confirm Cancellation" button (red/destructive)
   - "Keep Appointment" button
7. Implement reschedule logic (update booking in Hive)
8. Implement cancel logic (update status to cancelled)
9. Add empty states for each tab with illustrations
10. Implement pull-to-refresh
11. Add search/filter functionality (optional)

**Demo**: View appointments screen with tabs, see upcoming appointments list, tap appointment card to view details sheet, tap Reschedule to open dialog, select new date/time, confirm reschedule and see updated appointment, tap Cancel on another appointment, select reason, confirm cancellation and see it move to Cancelled tab, download receipt for a past appointment.

---

### Task 12: Profile and Settings Screen

**Objective**: Build user profile management and app settings.

**Implementation Steps**:
1. **Profile Screen** (`lib/features/profile/presentation/profile_screen.dart`):
   - **Header Section**:
     - Large profile photo or initials circle
     - Camera icon to change photo
     - Name and email
     - "Patient ID" badge
   - **Personal Information Section**:
     - Name with edit icon
     - Email with edit icon
     - Phone with edit icon
     - Location with edit icon
     - Date of birth
     - Blood type (optional)
     - Tap any field to edit
   - **Emergency Contact Section**:
     - Contact name
     - Relationship
     - Phone number
     - Edit button
   - **Settings List**:
     - Notifications (chevron → settings)
     - Privacy Policy (chevron → web view)
     - Terms of Service (chevron → web view)
     - About Medcin (chevron → about screen)
     - Help & Support (chevron → support screen)
     - App Version at bottom
   - **Logout Button** (destructive color)
   - **Delete Account** link at bottom (subtle, red text)
2. **Edit Profile Screen** (`lib/features/profile/presentation/edit_profile_screen.dart`):
   - Form with all editable fields
   - Photo upload/change (camera or gallery)
   - "Save Changes" button
   - "Cancel" button
   - Form validation
3. **Notification Settings Screen** (`lib/features/profile/presentation/notification_settings_screen.dart`):
   - Toggle switches:
     - Appointment reminders
     - Promotional offers
     - Health tips
     - Email notifications
     - Push notifications
   - Each with description text
4. **Emergency Contact Edit Screen**:
   - Form with name, relationship, phone
   - Save/cancel buttons
5. **About Screen**:
   - Medcin logo
   - App version
   - "Connecting ASEAN to quality healthcare" tagline
   - Links to website, social media
6. **Support Screen**:
   - Support email
   - Support phone
   - FAQ section (expandable)
   - "Send Feedback" button
7. Implement logout with confirmation dialog:
   - "Are you sure you want to logout?"
   - Clears auth state and Hive data
   - Navigates to login screen
8. Implement delete account with double confirmation:
   - Warning about data deletion
   - Password confirmation
   - "This action cannot be undone" warning
9. Implement profile update logic (save to Hive and update providers)
10. Add image picker for profile photo

**Demo**: View profile screen with all information, tap edit icon to modify name/email/phone, save changes and see updated profile, edit emergency contact, toggle notification settings and see them persist, view About and Support screens, tap Logout with confirmation and return to login screen, login again to verify changes persisted.

---

### Task 13: Push Notifications Setup

**Objective**: Implement push notifications for appointment reminders and confirmations.

**Implementation Steps**:
1. **Firebase Configuration**:
   - Enable Firebase Cloud Messaging in Firebase console
   - Configure iOS push notification certificates and keys
   - Configure Android FCM settings
2. **Notification Permission** (`lib/features/notifications/data/notification_service.dart`):
   - Request permission on first app launch (after login)
   - Show explanation dialog before requesting
   - Handle permission granted/denied states
   - Store permission state in preferences
3. **FCM Integration**:
   - Initialize FCM in `main.dart`
   - Get FCM token and store it
   - Listen to token refresh events
   - Send token to backend (placeholder for API)
4. **Notification Handlers**:
   - **Foreground**: Show in-app banner notification
   - **Background**: Show system notification
   - **Terminated**: App opens to notification screen
5. **Notification Tap Handlers** (`lib/features/notifications/data/notification_handlers.dart`):
   - Parse notification payload
   - Navigate to appropriate screen:
     - Appointment reminder → appointment detail
     - Booking confirmed → appointment detail
     - Reschedule approved → appointment detail
     - General notification → notification center
6. **Local Notifications** (`flutter_local_notifications`):
   - Schedule appointment reminders:
     - 24 hours before appointment
     - 1 hour before appointment
   - Cancel notifications when appointment is cancelled/rescheduled
7. **Notification Center** (`lib/features/notifications/presentation/notifications_screen.dart`):
   - List all received notifications
   - Group by date (Today, Yesterday, This Week, Earlier)
   - Notification card:
     - Icon based on type
     - Title and message
     - Timestamp
     - Unread badge
   - Mark as read when tapped
   - "Clear All" button
   - Empty state when no notifications
8. **Notification Badge**:
   - Show badge on Appointments bottom nav tab
   - Count of unread notifications
   - Update when notifications marked as read
9. Test notifications:
   - Send test notification from Firebase console
   - Verify foreground, background, and terminated scenarios
   - Verify navigation works correctly

**Demo**: Login to app and see permission request dialog, grant notification permission, receive test push notification from Firebase console (app in foreground shows banner, background shows system notification), tap notification to open appointment detail, view notification center showing notification history, see badge on Appointments tab with unread count, book an appointment and verify local reminder is scheduled, tap notification to navigate to appointment.

---

### Task 14: Shared Components and Polish

**Objective**: Build reusable component library and polish the entire app UX.

**Implementation Steps**:
1. **Component Library** (`lib/shared/widgets/`):
   - **MedcinButton** (`medcin_button.dart`):
     - Variants: primary, secondary, outlined, text
     - Sizes: small, medium, large
     - Loading state with spinner
     - Disabled state
     - Icon support (leading/trailing)
     - Haptic feedback on tap
   - **MedcinBadge** (`medcin_badge.dart`):
     - Status variants: confirmed (sage), pending (amber), cancelled (muted)
     - Custom colors and labels
     - Rounded corners
     - Monospace font
   - **MedcinCard** (`medcin_card.dart`):
     - Elevation and border variants
     - Padding options
     - Rounded corners (12px, 16px, 24px)
     - Tap ripple effect
     - Shadow styles
   - **MedcinTextField** (`medcin_text_field.dart`):
     - Label and hint text
     - Validation states (error, success)
     - Character counter
     - Prefix/suffix icons
     - Password visibility toggle
     - IBM Plex Sans font
   - **RatingStars** (`rating_stars.dart`):
     - Configurable size
     - Read-only or interactive
     - Partial star support (4.5 stars)
     - Amber color
   - **LoadingShimmer** (`loading_shimmer.dart`):
     - Shimmer effect for loading states
     - Card shimmer, list shimmer, text shimmer
     - Mist color base
   - **EmptyState** (`empty_state.dart`):
     - Illustration/icon
     - Title and message
     - Optional action button
     - Consistent spacing
   - **ErrorState** (`error_state.dart`):
     - Error icon
     - Error message
     - Retry button
     - Consistent styling
2. **Loading States**:
   - Replace all CircularProgressIndicator with shimmer effects
   - Add shimmer to doctor cards while loading
   - Add skeleton screens for detail pages
   - Smooth transition from shimmer to content
3. **Error Handling**:
   - Global error boundary
   - Network error handling
   - Form validation errors
   - Auth errors with user-friendly messages
   - Retry mechanisms for failed requests
4. **Animations and Transitions**:
   - Hero animations for doctor images
   - Fade transitions for bottom nav
   - Slide transitions for screen pushes
   - Subtle button press animations (scale down)
   - Success checkmark animation (Lottie or custom)
   - Loading spinners with clay color
5. **Micro-interactions**:
   - Haptic feedback on button taps (light, medium, heavy)
   - Haptic on successful booking
   - Haptic on errors
   - Smooth scroll physics
   - Pull-to-refresh with custom indicator (clay color)
   - Snackbar/toast for success/error messages
6. **App Icons and Splash**:
   - Design app icon with Medcin branding
   - Generate all icon sizes for iOS and Android
   - Create adaptive icon for Android
   - Design splash screen with logo and clay background
   - Configure splash screen for iOS and Android
7. **Accessibility**:
   - Semantic labels for screen readers
   - Sufficient color contrast
   - Touch target sizes (min 44x44 pt)
   - Support for system font scaling
8. **Performance**:
   - Image caching
   - List view optimization with const constructors
   - Lazy loading for large lists
   - Debounce search input
9. **Final Polish**:
   - Consistent spacing throughout (8, 12, 16, 24, 32 px)
   - Consistent border radius (12, 16, 24 px)
   - Consistent shadow styles
   - Consistent color usage
   - Remove all debug prints
   - Add meaningful error logging

**Demo**: Navigate through entire app showing polished UI: smooth hero animations between screens, shimmer loading states, consistent button and card styles, haptic feedback on interactions, pull-to-refresh on lists, success/error toasts, app icon and splash screen on fresh install, no visual glitches or performance issues.

---

### Task 15: API Integration Preparation and Documentation

**Objective**: Structure the codebase for easy migration from local to API data sources.

**Implementation Steps**:
1. **API Client Setup** (`lib/core/network/api_client.dart`):
   - Configure Dio HTTP client
   - Base URL configuration from environment variables
   - Request interceptors (add auth token)
   - Response interceptors (handle errors)
   - Retry logic for failed requests
   - Timeout configuration
2. **Environment Configuration** (`lib/core/config/environment.dart`):
   - Create `.env` file for environment variables:
     ```
     API_BASE_URL=https://api.medcin.health
     API_VERSION=v1
     GOOGLE_CLIENT_ID=...
     APPLE_CLIENT_ID=...
     ```
   - Use `flutter_dotenv` package
   - Load environment variables in `main.dart`
   - Different configs for dev/staging/prod
3. **API Repository Implementations** (parallel to local repositories):
   - `ApiDoctorRepository` in `lib/features/search/data/api_doctor_repository.dart`
   - `ApiBookingRepository` in `lib/features/booking/data/api_booking_repository.dart`
   - `ApiProfileRepository` in `lib/features/profile/data/api_profile_repository.dart`
   - Each implements the same interface as local repository
4. **Repository Provider Toggle** (`lib/core/config/feature_flags.dart`):
   - Feature flag: `USE_API_DATA` (bool)
   - Riverpod provider that returns correct repository based on flag:
     ```dart
     final doctorRepositoryProvider = Provider<IDoctorRepository>((ref) {
       if (FeatureFlags.useApiData) {
         return ApiDoctorRepository();
       }
       return LocalDoctorRepository();
     });
     ```
   - Add settings toggle in app to switch data sources (for testing)
5. **API Endpoint Documentation** (`docs/API_ENDPOINTS.md`):
   - Document all required endpoints:
     ```markdown
     ## Authentication
     - POST /auth/login
     - POST /auth/register
     - POST /auth/logout
     
     ## Doctors
     - GET /doctors (with filters: specialty, location, sort)
     - GET /doctors/:id
     
     ## Centers
     - GET /centers (with filters)
     - GET /centers/:id
     
     ## Bookings
     - GET /bookings (patient's bookings)
     - POST /bookings (create booking)
     - PATCH /bookings/:id (reschedule)
     - DELETE /bookings/:id (cancel)
     
     ## Profile
     - GET /profile
     - PATCH /profile
     
     ## Slots
     - GET /doctors/:id/slots?date=YYYY-MM-DD
     ```
   - Include request/response examples for each endpoint
   - Document authentication headers
   - Document error responses
6. **Migration Guide** (`docs/API_MIGRATION_GUIDE.md`):
   - Step-by-step guide to switch from local to API data
   - Environment setup instructions
   - Testing checklist
   - Rollback procedures
7. **Code Documentation**:
   - Add dartdoc comments to all public classes and methods
   - Document complex logic
   - Add examples for custom widgets
   - Generate documentation with `dartdoc`
8. **README Update** (`mobile/README.md`):
   - Project overview
   - Setup instructions
   - Running the app
   - Building for release
   - Environment variables
   - Feature flags
   - Architecture overview
   - Contributing guidelines

**Demo**: Show settings screen with "Data Source" toggle (Local/API), switch to API mode (shows appropriate UI feedback that API is not configured yet), view documented API endpoints in markdown files, demonstrate feature flag pattern by toggling repositories, show how to add new API endpoints following the pattern.

---

## Appendix

### Dependencies Summary

```yaml
dependencies:
  # Core
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  
  # Navigation
  go_router: ^12.0.0
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # Firebase
  firebase_core: ^2.20.0
  firebase_auth: ^4.12.0
  firebase_messaging: ^14.7.0
  
  # Authentication
  google_sign_in: ^6.1.5
  sign_in_with_apple: ^5.0.0
  
  # Networking
  dio: ^5.3.3
  
  # UI
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  
  # Utilities
  intl: ^0.18.1
  url_launcher: ^6.2.1
  image_picker: ^1.0.4
  share_plus: ^7.2.1
  
  # Serialization
  json_annotation: ^4.8.1
  freezed_annotation: ^2.4.1
  
  # Environment
  flutter_dotenv: ^5.1.0
  
  # Notifications
  flutter_local_notifications: ^16.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  
  # Code Generation
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
  freezed: ^2.4.5
  hive_generator: ^2.0.1
```

### Color Reference

```dart
// lib/core/theme/app_colors.dart
class AppColors {
  // Primary Colors
  static const Color clay = Color(0xFF1769AA);
  static const Color sage = Color(0xFF2F80B7);
  static const Color amber = Color(0xFF4B91C5);
  
  // Text Colors
  static const Color ink = Color(0xFF102A43);
  static const Color muted = Color(0xFF5C7185);
  
  // Background Colors
  static const Color paper = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color mist = Color(0xFFD7E7F5);
  
  // Status Colors
  static const Color success = sage;
  static const Color warning = amber;
  static const Color error = Color(0xFFD32F2F);
}
```

### Screen Flow Diagram

```
Splash
  ↓
Login/Signup ←→ Forgot Password
  ↓
Home Dashboard
  ├─→ Search Doctors/Centers
  │     ↓
  │   Doctor Detail
  │     ↓
  │   Booking Flow
  │     ├─→ Service Selection
  │     ├─→ Slot Selection
  │     ├─→ Patient Details
  │     └─→ Confirmation
  │
  ├─→ My Appointments
  │     ├─→ Appointment Detail
  │     ├─→ Reschedule
  │     └─→ Cancel
  │
  └─→ Profile & Settings
        ├─→ Edit Profile
        ├─→ Notification Settings
        └─→ Logout
```


