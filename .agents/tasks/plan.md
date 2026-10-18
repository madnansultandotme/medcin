# Implementation Plan: Doctor Role, Commission System, and Check-in/Check-out

## Overview
This plan adds three interconnected features to the Medcin healthcare booking platform:
1. **Independent Doctor Role** - Doctors can exist independently or be affiliated with centers
2. **Commission System** - Admins can set commission rates for centers, automatically calculated on booking completion
3. **Check-in/Check-out System** - Centers can check patients in/out, triggering automatic commission calculations

## Project Context (from exploration)

### Build & Test Setup
- **Build system**: Next.js 16.3 with TypeScript, Drizzle ORM
- **Database**: Neon PostgreSQL with serverless driver (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM with schema in `db/schema.ts`
- **Migration command**: `npm run db:push` (drizzle-kit push)
- **Auth**: Better Auth with session management
- **Test command**: `npm run build` (no test framework detected)
- **Verification**: Run `npm run build` after changes, test API routes manually

### Key Patterns Found
- **Enum definitions**: Using `pgEnum()` for type-safe enums (e.g., `userRoleEnum`, `bookingStatusEnum`)
- **RLS policies**: Using `crudPolicy()` with `authenticatedRole` and `anonymousRole`
- **API structure**: Next.js App Router with `/app/api/[resource]/route.ts` pattern
- **Permission middleware**: `lib/middleware/permissions.ts` with role-based helpers (`requireAdmin`, `requireCenter`, `getAuthenticatedUser`)
- **Database client**: Imported from `@/db` (server-side only)
- **UI pattern**: Client-side React components with `"use client"` directive, fetching from API routes

### Existing Schema Insights
- **users.role**: Currently enum with ['ADMIN', 'CENTER', 'PATIENT']
- **doctors.center_id**: Currently NOT NULL with CASCADE delete
- **bookings.status**: Enum with ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
- **centers**: Has user_id foreign key (one-to-one with users)

## Implementation Plan

### Phase 1: Database Schema Changes

#### 1.1 Add DOCTOR role to user_role enum
**What**: Add 'DOCTOR' to the existing user_role enum in the database
**Files**: 
- `db/schema.ts` - Update `userRoleEnum` definition
**Details**:
```typescript
// Change from:
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'CENTER', 'PATIENT']);
// To:
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'CENTER', 'PATIENT', 'DOCTOR']);
```
**Verify**: Run `npm run db:push` and check for errors. Query the enum: `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;`

---

#### 1.2 Create commission-related enums
**What**: Add new enums for commission type and status
**Files**: 
- `db/schema.ts` - Add after existing enum definitions
**Details**:
```typescript
export const commissionTypeEnum = pgEnum('commission_type', ['PERCENTAGE', 'FIXED']);
export const commissionStatusEnum = pgEnum('commission_status', ['PENDING', 'CALCULATED', 'PAID']);
```
**Verify**: Run `npm run db:push` and check console output for successful enum creation

---

#### 1.3 Add commission fields to centers table
**What**: Add commission configuration fields to the centers table
**Files**: 
- `db/schema.ts` - Modify `centers` table definition
**Details**:
Add these fields to the centers table object:
```typescript
commissionRate: real('commission_rate').default(0).notNull(), // e.g., 15.0 for 15%
commissionType: commissionTypeEnum('commission_type').default('PERCENTAGE').notNull(),
fixedCommissionAmount: real('fixed_commission_amount'), // nullable, used when type=FIXED
```
**Verify**: Run `npm run db:push`. Query: `SELECT commission_rate, commission_type, fixed_commission_amount FROM centers LIMIT 1;`

---

#### 1.4 Add check-in/check-out and commission fields to bookings table
**What**: Extend bookings table with check-in/check-out timestamps and commission calculation fields
**Files**: 
- `db/schema.ts` - Modify `bookings` table definition
**Details**:
Add these fields to the bookings table object:
```typescript
checkedInAt: timestamp('checked_in_at'),
checkedOutAt: timestamp('checked_out_at'),
checkedInBy: text('checked_in_by').references(() => users.id),
checkedOutBy: text('checked_out_by').references(() => users.id),
commissionAmount: real('commission_amount'), // calculated commission for platform
centerEarnings: real('center_earnings'), // booking price minus commission
commissionStatus: commissionStatusEnum('commission_status').default('PENDING').notNull(),
```
**Verify**: Run `npm run db:push`. Query: `SELECT checked_in_at, checked_out_at, commission_amount, commission_status FROM bookings LIMIT 1;`

---

#### 1.5 Make doctors.center_id nullable and add doctor profile fields
**What**: Allow doctors to exist without a center (independent doctors), add profile fields
**Files**: 
- `db/schema.ts` - Modify `doctors` table definition
**Details**:
Change the centerId field and add new fields:
```typescript
// Change from:
centerId: text('center_id').notNull().references(() => centers.id, { onDelete: 'cascade' }),
// To:
centerId: text('center_id').references(() => centers.id, { onDelete: 'cascade' }),

// Add these new fields:
userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // for independent doctors
specialization: text('specialization'), // from doctor_specializations
consultationFee: real('consultation_fee'), // for independent doctors
isIndependent: boolean('is_independent').default(false).notNull(),
```
**Rationale**: Making centerId nullable allows doctors to exist independently. The userId field links independent doctors to their user account. The isIndependent flag helps quickly identify doctor type without checking for null centerId.

**Backward compatibility**: Existing doctors have centerId populated, so they remain center-affiliated. New constraint ensures either centerId OR userId is set (not both for independent, or centerId for center doctors).

**Verify**: Run `npm run db:push`. Query: `SELECT id, center_id, user_id, is_independent FROM doctors LIMIT 5;` Confirm existing doctors still have center_id populated.

---

#### 1.6 Update doctors relations and RLS policies
**What**: Update Drizzle relations for the nullable centerId and add userId relation
**Files**: 
- `db/schema.ts` - Update `doctorsRelations` definition
**Details**:
```typescript
export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  center: one(centers, {
    fields: [doctors.centerId],
    references: [centers.id],
  }),
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  services: many(services),
  bookings: many(bookings),
  slots: many(slots),
}));
```
**Verify**: Run `npm run db:push` and `npm run build`. No TypeScript errors should appear related to doctor relations.

---

### Phase 2: Backend API Routes

#### 2.1 Create admin commission management API
**What**: Admin-only endpoint to set/update commission settings for a center
**Files**: 
- `app/api/admin/centers/commission/route.ts` (new file)
**Details**:
Create POST endpoint that:
- Requires admin role (use `requireAdmin()` from permissions middleware)
- Accepts: `{ centerId, commissionRate?, commissionType?, fixedCommissionAmount? }`
- Validates: commissionRate between 0-100 if type is PERCENTAGE
- Updates the centers table with new commission settings
- Returns updated center data

**Example request**:
```json
{
  "centerId": "center-uuid",
  "commissionRate": 15.0,
  "commissionType": "PERCENTAGE"
}
```

**Example response**:
```json
{
  "center": {
    "id": "center-uuid",
    "name": "Test Clinic",
    "commissionRate": 15.0,
    "commissionType": "PERCENTAGE"
  },
  "message": "Commission settings updated successfully"
}
```
**Verify**: Use Thunder Client or curl to POST to `/api/admin/centers/commission` as admin user. Check centers table for updated commission fields.

---

#### 2.2 Create check-in API endpoint
**What**: Center-only endpoint to check in a patient for their booking
**Files**: 
- `app/api/center/checkin/route.ts` (new file)
**Details**:
Create POST endpoint that:
- Requires center role (use `requireCenter()`)
- Accepts: `{ bookingId }`
- Validates: 
  - Booking exists and belongs to a doctor in the center
  - Booking status is CONFIRMED
  - Not already checked in
- Updates booking: sets `checkedInAt` to current timestamp, `checkedInBy` to current user ID
- Returns updated booking

**Example request**:
```json
{
  "bookingId": "booking-uuid"
}
```

**Example response**:
```json
{
  "booking": {
    "id": "booking-uuid",
    "reference": "BK-12345",
    "checkedInAt": "2026-10-17T15:30:00Z",
    "checkedInBy": "user-uuid"
  },
  "message": "Patient checked in successfully"
}
```
**Verify**: Create a CONFIRMED booking, POST to `/api/center/checkin` as center user. Query bookings table to confirm checked_in_at is set.

---

#### 2.3 Create check-out API endpoint with commission calculation
**What**: Center-only endpoint to check out a patient and automatically calculate commission
**Files**: 
- `app/api/center/checkout/route.ts` (new file)
- `lib/commission.ts` (new file - commission calculation logic)
**Details**:

**lib/commission.ts**:
```typescript
export function calculateCommission(
  bookingPrice: number,
  commissionRate: number,
  commissionType: 'PERCENTAGE' | 'FIXED',
  fixedAmount?: number | null
): { commissionAmount: number; centerEarnings: number } {
  let commissionAmount = 0;
  
  if (commissionType === 'PERCENTAGE') {
    commissionAmount = (bookingPrice * commissionRate) / 100;
  } else if (commissionType === 'FIXED') {
    commissionAmount = fixedAmount || 0;
  }
  
  const centerEarnings = bookingPrice - commissionAmount;
  
  return {
    commissionAmount: Math.round(commissionAmount * 100) / 100, // round to 2 decimals
    centerEarnings: Math.round(centerEarnings * 100) / 100,
  };
}
```

**app/api/center/checkout/route.ts**:
Create POST endpoint that:
- Requires center role
- Accepts: `{ bookingId }`
- Validates:
  - Booking exists and belongs to center's doctor
  - Booking is checked in (checkedInAt is not null)
  - Not already checked out
- Fetches center's commission settings from database
- Calculates commission using `calculateCommission()` helper
- Updates booking atomically:
  - Sets `checkedOutAt` to current timestamp
  - Sets `checkedOutBy` to current user ID
  - Sets `status` to 'COMPLETED'
  - Sets `commissionAmount` to calculated value
  - Sets `centerEarnings` to calculated value
  - Sets `commissionStatus` to 'CALCULATED'
- Returns updated booking with commission details

**Example response**:
```json
{
  "booking": {
    "id": "booking-uuid",
    "reference": "BK-12345",
    "price": 100,
    "checkedOutAt": "2026-10-17T16:30:00Z",
    "status": "COMPLETED",
    "commissionAmount": 15,
    "centerEarnings": 85,
    "commissionStatus": "CALCULATED"
  },
  "message": "Patient checked out successfully. Commission calculated."
}
```
**Verify**: Check in a booking, then POST to `/api/center/checkout`. Query bookings table to confirm commission_amount, center_earnings, and commission_status are set correctly. Verify calculation: if center has 15% rate and booking is $100, commission should be $15, earnings $85.

---

#### 2.4 Update bookings GET API to include commission data
**What**: Extend existing bookings GET endpoint to return commission fields (for admins and centers)
**Files**: 
- `app/api/bookings/route.ts` (modify existing GET handler)
**Details**:
- No schema changes needed (fields already exist)
- Admin users should see all commission fields
- Center users should see commission fields for their bookings
- Patient users should NOT see commission fields (filter them out in response)

**Verification queries**: The existing SELECT queries already return all fields. Add projection logic to filter commission fields for patient role:
```typescript
if (user.role === 'PATIENT') {
  // Remove commission fields from response
  userBookings = userBookings.map(({ commissionAmount, centerEarnings, commissionStatus, ...rest }) => rest);
}
```
**Verify**: GET `/api/bookings` as admin, center, and patient. Confirm patients don't see commission fields, admins and centers do.

---

#### 2.5 Create independent doctor registration API
**What**: Allow users with DOCTOR role to register as independent practitioners
**Files**: 
- `app/api/doctors/register/route.ts` (new file)
**Details**:
Create POST endpoint that:
- Requires authenticated user with DOCTOR role
- Accepts: `{ name, specialization, licenseNumber, consultationFee, bio?, imageUrl? }`
- Validates:
  - User doesn't already have a doctor profile (check userId in doctors table)
  - License number format
  - Consultation fee is positive
- Creates doctor record with:
  - `userId` = authenticated user ID
  - `centerId` = null
  - `isIndependent` = true
  - `active` = false (requires admin approval, or true if auto-approve)
  - Other fields from request body
- Returns created doctor profile

**Example request**:
```json
{
  "name": "Dr. Sarah Johnson",
  "specialization": "Cardiology",
  "licenseNumber": "MD-123456",
  "consultationFee": 150,
  "bio": "Board-certified cardiologist with 10 years experience"
}
```

**Example response**:
```json
{
  "doctor": {
    "id": "doctor-uuid",
    "userId": "user-uuid",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology",
    "isIndependent": true,
    "active": false
  },
  "message": "Doctor profile created successfully. Pending admin approval."
}
```
**Verify**: Create user with DOCTOR role, POST to `/api/doctors/register`. Query doctors table to confirm userId is set, center_id is null, is_independent is true.

---

#### 2.6 Update doctors GET API to include independent doctors
**What**: Modify existing doctors GET endpoint to return independent doctors alongside center doctors
**Files**: 
- `app/api/doctors/route.ts` (modify existing GET handler)
**Details**:
Current query filters by centerId. Update to:
- If `centerId` query param provided: return doctors for that center (existing behavior)
- If no `centerId`: return all active doctors (both center-affiliated and independent)
- For public/patient users: only return active doctors
- For center users: return their own doctors
- For admin users: return all doctors

Update the WHERE clause to handle nullable centerId:
```typescript
// Example query adjustment
const doctors = await db
  .select()
  .from(doctors)
  .where(
    and(
      centerId ? eq(doctors.centerId, centerId) : undefined,
      publicAccess ? eq(doctors.active, true) : undefined
    )
  );
```
**Verify**: GET `/api/doctors` without centerId param. Confirm both center-affiliated and independent doctors are returned. GET `/api/doctors?centerId=xxx` confirms filtering works.

---

### Phase 3: Frontend UI Components

#### 3.1 Create admin commission settings component
**What**: Add commission configuration UI to admin center management
**Files**: 
- `app/admin/centers/[id]/page.tsx` (new file - center detail page)
- OR modify `app/admin/centers/page.tsx` to add detail view inline
**Details**:
Create a center detail page at `/admin/centers/[id]` that displays:
- Center basic info (name, category, status)
- Commission settings section with form:
  - Radio buttons for commission type (PERCENTAGE | FIXED)
  - Number input for commission rate (if PERCENTAGE, show %, validate 0-100)
  - Number input for fixed amount (if FIXED)
  - Save button that calls POST `/api/admin/centers/commission`
- List of center's doctors
- Recent bookings for the center

**Commission form component**:
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
  <h2 className="text-lg font-semibold mb-4">Commission Settings</h2>
  
  <div className="space-y-4">
    <div>
      <label>Commission Type</label>
      <select value={commissionType} onChange={...}>
        <option value="PERCENTAGE">Percentage</option>
        <option value="FIXED">Fixed Amount</option>
      </select>
    </div>
    
    {commissionType === 'PERCENTAGE' && (
      <div>
        <label>Commission Rate (%)</label>
        <input type="number" min="0" max="100" step="0.1" />
      </div>
    )}
    
    {commissionType === 'FIXED' && (
      <div>
        <label>Fixed Commission Amount ($)</label>
        <input type="number" min="0" step="0.01" />
      </div>
    )}
    
    <button onClick={handleSaveCommission}>Save Commission Settings</button>
  </div>
</div>
```
**Verify**: Navigate to `/admin/centers/[id]` as admin. Change commission settings, save. Refresh page and confirm settings persist. Check network tab for successful API call.

---

#### 3.2 Add check-in/check-out buttons to center bookings page
**What**: Add action buttons to center bookings list for check-in/check-out workflow
**Files**: 
- `app/center/bookings/page.tsx` (modify existing)
**Details**:
Extend the existing bookings table/cards to show check-in/check-out actions:

**For CONFIRMED bookings (not checked in)**:
- Show "Check In" button (green)
- On click: POST to `/api/center/checkin` with bookingId
- Update local state to reflect checked-in status

**For checked-in bookings (checkedInAt exists, no checkedOutAt)**:
- Show "Check Out" button (blue)
- Show badge "Checked In" with timestamp
- On click: POST to `/api/center/checkout` with bookingId
- Show success message with commission details
- Update booking status to COMPLETED

**For checked-out bookings (COMPLETED)**:
- Show "Completed" badge
- Display commission amount if user is admin or center owner
- Show checked-in and checked-out timestamps

**Example card structure**:
```tsx
<div className="booking-card">
  <div className="booking-header">
    <span>{booking.reference}</span>
    <span className="status-badge">{booking.status}</span>
  </div>
  
  <div className="booking-details">
    <p>{booking.date} at {booking.time}</p>
    <p>${booking.price}</p>
  </div>
  
  {booking.checkedInAt && (
    <p className="text-sm">Checked in: {formatDate(booking.checkedInAt)}</p>
  )}
  
  {booking.checkedOutAt && (
    <p className="text-sm">Checked out: {formatDate(booking.checkedOutAt)}</p>
  )}
  
  <div className="actions">
    {booking.status === 'CONFIRMED' && !booking.checkedInAt && (
      <button onClick={() => handleCheckin(booking.id)}>
        Check In
      </button>
    )}
    
    {booking.checkedInAt && !booking.checkedOutAt && (
      <button onClick={() => handleCheckout(booking.id)}>
        Check Out & Complete
      </button>
    )}
  </div>
  
  {booking.commissionAmount && (
    <div className="commission-info text-sm">
      <p>Commission: ${booking.commissionAmount}</p>
      <p>Center Earnings: ${booking.centerEarnings}</p>
    </div>
  )}
</div>
```
**Verify**: Navigate to `/center/bookings`. Confirm a booking, click "Check In", verify button changes to "Check Out". Click "Check Out", verify status changes to COMPLETED and commission displays. Check database for correct timestamps and commission values.

---

#### 3.3 Create independent doctor registration flow
**What**: New signup flow for users registering as independent doctors
**Files**: 
- `app/signup/doctor/page.tsx` (new file)
**Details**:
Create a signup page at `/signup/doctor` with:
- User account creation (email, password, name, phone)
- Doctor profile fields:
  - Specialization (dropdown from doctor_specializations table)
  - License number
  - Consultation fee
  - Bio (textarea)
  - Profile image upload (optional)
- Two-step process:
  1. Create user account with role='DOCTOR'
  2. Create doctor profile via POST `/api/doctors/register`
- Success message: "Registration submitted. Your profile is pending admin approval."
- Redirect to doctor dashboard (or pending approval page)

**Form structure**:
```tsx
<form onSubmit={handleSubmit}>
  <h1>Register as Independent Doctor</h1>
  
  <section>
    <h2>Account Details</h2>
    <input name="email" type="email" required />
    <input name="password" type="password" required />
    <input name="name" required />
    <input name="phone" />
  </section>
  
  <section>
    <h2>Professional Details</h2>
    <select name="specialization" required>
      <option>Select specialization...</option>
      {/* Fetch from doctor_specializations */}
    </select>
    <input name="licenseNumber" required />
    <input name="consultationFee" type="number" required />
    <textarea name="bio" rows={4} />
  </section>
  
  <button type="submit">Register</button>
</form>
```
**Verify**: Navigate to `/signup/doctor`. Fill form and submit. Check users table for new user with role='DOCTOR'. Check doctors table for new record with user_id set, center_id null, is_independent true. Confirm active=false (pending approval).

---

#### 3.4 Update center doctors page to show independent doctors (for linking)
**What**: Admin/center can view and optionally "link" independent doctors to their center
**Files**: 
- `app/center/doctors/page.tsx` (optional enhancement)
- `app/admin/doctors/page.tsx` (new admin page to manage all doctors)
**Details**:
This is an optional feature for Phase 3. If a center wants to "recruit" an independent doctor:
- Admin page shows all doctors (independent and center-affiliated)
- Can filter by `isIndependent` flag
- Can update a doctor's `centerId` to link them to a center (converts independent to affiliated)

**For now, skip this feature**. Independent doctors remain separate. This can be a future enhancement.

**Verify**: Not applicable for initial implementation.

---

### Phase 4: Permission & Middleware Updates

#### 4.1 Add DOCTOR role to permission helpers
**What**: Update permission middleware to recognize DOCTOR role
**Files**: 
- `lib/middleware/permissions.ts` (modify existing)
**Details**:
Update type definition:
```typescript
export type UserRole = 'ADMIN' | 'CENTER' | 'PATIENT' | 'DOCTOR';
```

Add helper function:
```typescript
export async function requireDoctor(): Promise<
  { context: AuthContext } | { error: NextResponse }
> {
  return requireRole('DOCTOR');
}

export async function getUserDoctorId(userId: string): Promise<string | null> {
  try {
    const { doctors } = await import('@/db/schema');
    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId))
      .limit(1);

    return doctorRecord.length > 0 ? doctorRecord[0].id : null;
  } catch (error) {
    console.error('Get user doctor ID error:', error);
    return null;
  }
}
```
**Verify**: Import `requireDoctor` in a test route, call it with a DOCTOR user token. Confirm it returns success. Call with PATIENT user, confirm it returns 403 error.

---

#### 4.2 Update booking access control for independent doctors
**What**: Allow doctors to view/manage their own bookings
**Files**: 
- `app/api/bookings/route.ts` (modify GET handler)
**Details**:
In the GET endpoint, add DOCTOR role handling:
```typescript
if (user.role === 'DOCTOR') {
  // Doctor can see bookings for their appointments
  const doctorId = await getUserDoctorId(user.id);
  
  if (!doctorId) {
    return NextResponse.json({
      bookings: [],
      count: 0,
    });
  }

  userBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.doctorId, doctorId))
    .limit(100);
}
```
**Verify**: Create booking for an independent doctor. GET `/api/bookings` as that doctor user. Confirm their bookings are returned. GET as different doctor, confirm no bookings shown.

---

### Phase 5: Testing & Verification

#### 5.1 Database migration verification
**What**: Confirm all schema changes are applied correctly
**Commands**:
```bash
npm run db:push
```
**Manual SQL verification** (run in Neon console or via API):
```sql
-- Check enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder;
-- Should return: ADMIN, CENTER, PATIENT, DOCTOR

-- Check commission enums
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'commission_type'::regtype ORDER BY enumsortorder;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'commission_status'::regtype ORDER BY enumsortorder;

-- Check centers table has commission columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'centers' 
  AND column_name IN ('commission_rate', 'commission_type', 'fixed_commission_amount');

-- Check bookings table has check-in/out columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name IN ('checked_in_at', 'checked_out_at', 'checked_in_by', 'checked_out_by', 'commission_amount', 'center_earnings', 'commission_status');

-- Check doctors table has nullable center_id and new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
  AND column_name IN ('center_id', 'user_id', 'specialization', 'consultation_fee', 'is_independent');

-- Verify existing doctors still have center_id
SELECT id, center_id, user_id, is_independent FROM doctors LIMIT 5;
```
**Verify**: All queries return expected results. No existing doctors lost their center association.

---

#### 5.2 Commission calculation testing
**What**: Test commission calculation with different scenarios
**Test cases**:
1. **Percentage commission (15%)**:
   - Center has commissionRate=15, commissionType='PERCENTAGE'
   - Booking price = $100
   - Expected: commissionAmount=$15, centerEarnings=$85

2. **Fixed commission ($20)**:
   - Center has commissionType='FIXED', fixedCommissionAmount=$20
   - Booking price = $100
   - Expected: commissionAmount=$20, centerEarnings=$80

3. **Zero commission**:
   - Center has commissionRate=0, commissionType='PERCENTAGE'
   - Booking price = $100
   - Expected: commissionAmount=$0, centerEarnings=$100

4. **High percentage (50%)**:
   - Center has commissionRate=50, commissionType='PERCENTAGE'
   - Booking price = $200
   - Expected: commissionAmount=$100, centerEarnings=$100

**Manual testing flow**:
1. Set commission via admin UI for a test center
2. Create a booking for that center
3. Check in the booking
4. Check out the booking
5. Query the database to verify commission_amount and center_earnings
6. Compare with manual calculation

**Verify**: All test cases produce correct commission amounts with proper rounding (2 decimal places).

---

#### 5.3 Check-in/check-out workflow testing
**What**: End-to-end test of the booking lifecycle with commission
**Test flow**:
1. **Setup**: Create test center with 15% commission rate
2. **Create booking**: Patient creates booking, status=PENDING
3. **Center confirms**: Center changes status to CONFIRMED
4. **Check-in**: Center clicks "Check In"
   - Verify: `checkedInAt` timestamp set, `checkedInBy` = center user ID
5. **Check-out**: Center clicks "Check Out"
   - Verify: `checkedOutAt` timestamp set, `checkedOutBy` = center user ID
   - Verify: `status` changed to COMPLETED
   - Verify: `commissionAmount` = 15% of price
   - Verify: `centerEarnings` = price - commission
   - Verify: `commissionStatus` = CALCULATED
6. **View bookings**: Admin views booking, sees commission data

**Verify**: Each step updates the database correctly. UI reflects changes immediately. No errors in console.

---

#### 5.4 Independent doctor registration testing
**What**: Test full independent doctor signup and approval flow
**Test flow**:
1. **Register**: User signs up at `/signup/doctor`
   - Fill all required fields
   - Submit form
2. **Verify user created**: Check users table for role='DOCTOR'
3. **Verify doctor profile**: Check doctors table for:
   - user_id matches user.id
   - center_id is null
   - is_independent is true
   - active is false (pending approval)
4. **Admin approval** (manual DB update for now):
   ```sql
   UPDATE doctors SET active = true WHERE user_id = 'test-doctor-user-id';
   ```
5. **Verify public visibility**: GET `/api/doctors` should now include the independent doctor
6. **Booking test**: Patient creates booking with independent doctor
7. **Doctor dashboard**: Doctor logs in, sees their bookings

**Verify**: Independent doctors appear in search results once approved. They can manage their availability and bookings independently of centers.

---

#### 5.5 API endpoint testing matrix
**What**: Comprehensive API testing for all new/modified endpoints

| Endpoint | Method | Role | Test Case | Expected Result |
|----------|--------|------|-----------|----------------|
| `/api/admin/centers/commission` | POST | ADMIN | Set 15% commission | Success, center updated |
| `/api/admin/centers/commission` | POST | CENTER | Attempt to set commission | 403 Forbidden |
| `/api/center/checkin` | POST | CENTER | Check in own booking | Success, timestamp set |
| `/api/center/checkin` | POST | PATIENT | Attempt check-in | 403 Forbidden |
| `/api/center/checkout` | POST | CENTER | Check out after check-in | Success, commission calculated |
| `/api/center/checkout` | POST | CENTER | Check out without check-in | 400 Bad Request |
| `/api/doctors/register` | POST | DOCTOR | Create profile | Success, profile created |
| `/api/doctors/register` | POST | PATIENT | Attempt doctor registration | 403 Forbidden |
| `/api/doctors` | GET | PUBLIC | List all doctors | Success, includes independent doctors |
| `/api/bookings` | GET | DOCTOR | View own bookings | Success, shows doctor's bookings |
| `/api/bookings` | GET | PATIENT | View bookings | Success, no commission fields |
| `/api/bookings` | GET | CENTER | View bookings | Success, includes commission fields |

**Verify**: Use Thunder Client, Postman, or curl to test each endpoint. All tests pass with expected status codes and response data.

---

### Phase 6: Data Migration & Seeding

#### 6.1 Update existing centers with default commission
**What**: Set default commission values for existing centers
**SQL**:
```sql
UPDATE centers 
SET 
  commission_rate = 0,
  commission_type = 'PERCENTAGE',
  fixed_commission_amount = NULL
WHERE commission_rate IS NULL;
```
**Rationale**: Existing centers should have zero commission by default (FREE model from README). Admins can then configure on a per-center basis.

**Verify**: Query `SELECT id, name, commission_rate FROM centers;` All centers have commission_rate = 0.

---

#### 6.2 Seed doctor specializations
**What**: Populate doctor_specializations table with common specializations
**SQL**:
```sql
INSERT INTO doctor_specializations (id, name, description) VALUES
  (gen_random_uuid(), 'Cardiology', 'Heart and cardiovascular system'),
  (gen_random_uuid(), 'Dermatology', 'Skin, hair, and nails'),
  (gen_random_uuid(), 'Pediatrics', 'Children and adolescent health'),
  (gen_random_uuid(), 'Orthopedics', 'Bones, joints, and muscles'),
  (gen_random_uuid(), 'General Practice', 'Primary care and general medicine'),
  (gen_random_uuid(), 'Dentistry', 'Oral health and dental care'),
  (gen_random_uuid(), 'Ophthalmology', 'Eye care and vision'),
  (gen_random_uuid(), 'Psychiatry', 'Mental health'),
  (gen_random_uuid(), 'Neurology', 'Nervous system disorders'),
  (gen_random_uuid(), 'Oncology', 'Cancer treatment')
ON CONFLICT (name) DO NOTHING;
```
**Verify**: Query `SELECT name FROM doctor_specializations ORDER BY name;` Should return 10+ specializations.

---

### Order of Implementation (Dependency-Based)

**Critical path** (must be done in order):

1. **Phase 1.1-1.6**: All database schema changes (single migration push)
2. **Phase 4.1**: Update permission middleware (required by API routes)
3. **Phase 2.1**: Admin commission API (standalone)
4. **Phase 2.2-2.3**: Check-in/out APIs with commission calculation (depends on schema + middleware)
5. **Phase 2.4**: Update bookings GET API (depends on schema)
6. **Phase 2.5-2.6**: Doctor registration and GET updates (depends on schema + middleware)
7. **Phase 3.1-3.3**: UI components (depends on APIs)
8. **Phase 4.2**: Booking access control for doctors (depends on middleware update)
9. **Phase 5**: Testing (depends on everything)
10. **Phase 6**: Data migration (can be done anytime after Phase 1)

**Can be done in parallel** (after Phase 1 & 4.1):
- Phase 2.1 (commission API) + Phase 2.5 (doctor registration API)
- Phase 3.1 (admin UI) + Phase 3.3 (doctor signup UI)

---

### Migration Strategy

**Approach**: Single migration push with backward-compatible changes

**Commands**:
```bash
# 1. Backup existing data (optional but recommended)
# Use Neon console or pg_dump if available

# 2. Update schema.ts with all changes from Phase 1
# 3. Push changes to database
npm run db:push

# 4. Verify migration success
npm run build

# 5. Run data migration queries (Phase 6.1-6.2)
# Use Neon SQL Editor or run via API
```

**Rollback plan**:
If migration fails:
1. Neon has automatic point-in-time recovery (use Neon console to restore)
2. Revert `db/schema.ts` to previous commit
3. Run `npm run db:push` to sync schema back

**Breaking change mitigation**:
- Making `doctors.center_id` nullable is backward compatible (existing data keeps values)
- Adding new fields with defaults doesn't break existing queries
- New enums are additive only
- RLS policies remain unchanged for existing tables

---

### Commission Calculation Logic (Detailed)

**Function**: `calculateCommission(bookingPrice, commissionRate, commissionType, fixedAmount)`

**Algorithm**:
```
IF commissionType == 'PERCENTAGE':
  commissionAmount = (bookingPrice × commissionRate) ÷ 100
ELSE IF commissionType == 'FIXED':
  commissionAmount = fixedAmount
ELSE:
  commissionAmount = 0

centerEarnings = bookingPrice - commissionAmount

RETURN {
  commissionAmount: round(commissionAmount, 2),
  centerEarnings: round(centerEarnings, 2)
}
```

**Edge cases**:
- **Fixed amount > booking price**: Allow it (center loses money). Or add validation to prevent.
- **Null/undefined commission settings**: Default to 0% commission.
- **Negative prices**: Validate at booking creation (already handled).
- **Rounding**: Always round to 2 decimal places for currency.

**Example calculations**:
```
Booking: $100, Commission: 15% PERCENTAGE
→ Commission: $15.00, Earnings: $85.00

Booking: $100, Commission: $20 FIXED
→ Commission: $20.00, Earnings: $80.00

Booking: $75.50, Commission: 12.5% PERCENTAGE
→ Commission: $9.44, Earnings: $66.06

Booking: $100, Commission: 0% PERCENTAGE
→ Commission: $0.00, Earnings: $100.00
```

---

### Security Considerations

1. **Role-based access control**: All commission and check-in/out endpoints require proper role checks
2. **Data isolation**: Centers can only check-in/out bookings for their own doctors
3. **Audit trail**: `checkedInBy` and `checkedOutBy` fields track who performed actions
4. **Commission tampering**: Only admins can set commission rates; centers cannot modify
5. **Input validation**: 
   - Commission rate: 0-100 for percentage
   - Fixed amount: positive numbers only
   - Booking price: validated at creation
6. **SQL injection**: Using Drizzle ORM with parameterized queries (already secure)
7. **RLS policies**: Existing policies prevent unauthorized data access

---

## Summary

This plan implements three major features with minimal breaking changes:

1. **Independent Doctor Role**: Doctors can register and operate without center affiliation
2. **Commission System**: Admins configure per-center commission (percentage or fixed), automatically calculated on checkout
3. **Check-in/Check-out**: Centers track patient visits, trigger completion and commission calculation

**Total new files**: 8
- 1 commission calculation utility
- 4 new API routes (admin commission, center checkin, center checkout, doctor register)
- 3 new UI pages (admin center detail, doctor signup, optional doctor dashboard)

**Modified files**: 6
- `db/schema.ts` (all schema changes)
- `lib/middleware/permissions.ts` (DOCTOR role support)
- `app/api/bookings/route.ts` (GET handler for doctor bookings)
- `app/api/doctors/route.ts` (GET handler for independent doctors)
- `app/center/bookings/page.tsx` (check-in/out buttons)

**Database changes**: 
- 3 new enums (DOCTOR role, commission_type, commission_status)
- 3 fields added to centers table
- 7 fields added to bookings table
- 5 fields added to doctors table (1 modified to nullable)

**Verification approach**: 
- After each phase: run `npm run build`, test API endpoints manually
- Phase 5: comprehensive testing matrix
- Phase 6: data migration with rollback plan

**Estimated implementation time**: 8-12 hours for experienced developer
