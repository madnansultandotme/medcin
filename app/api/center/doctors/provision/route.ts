/**
 * Doctor Provisioning API
 * 
 * Allows center admins to create doctor accounts with temporary passwords.
 * POST /api/center/doctors/provision
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';
import { hashPassword } from '@/lib/password';
import { db } from '@/db';
import { users, doctors, accounts, verifications, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendDoctorProvisioningEmail } from '@/lib/email';
import crypto from 'crypto';
import { provisionDoctorSchema } from '@/lib/validations/doctor';

export async function POST(req: NextRequest) {
  try {
    // 1. Require CENTER role
    const authResult = await requireCenter();
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const { user } = context;

    // 2. Get center ID for this user
    const centerId = await getUserCenterId(user.id);
    if (!centerId) {
      return NextResponse.json(
        { error: 'Center not found for this user' },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const parseResult = provisionDoctorSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      category,
      specialization,
      licenseNumber,
      price,
      consultationFee,
      bio,
      imageUrl,
      role: doctorRole,
    } = parseResult.data;

    // 4. Check email uniqueness
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Doctor with this email already exists' },
        { status: 409 }
      );
    }

    // 5. Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString('base64url');
    const tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 6. Hash password using Better Auth's password hash function
    const hashedPassword = await hashPassword(tempPassword);

    // 7. Create user record
    const newUserId = crypto.randomUUID();
    await db.insert(users).values({
      id: newUserId,
      email,
      name,
      phone: phone || null,
      role: 'DOCTOR',
      emailVerified: false,
      passwordResetRequired: true,
      tempPasswordExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Create credential account for password authentication
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: newUserId,
      accountId: newUserId, // For credential provider, accountId = userId
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 9. Create doctor record
    const newDoctorId = crypto.randomUUID();
    await db.insert(doctors).values({
      id: newDoctorId,
      userId: newUserId,
      centerId,
      name,
      role: doctorRole || 'Doctor',
      category,
      specialization: specialization || null,
      licenseNumber,
      price,
      consultationFee: consultationFee || price,
      bio: bio || null,
      imageUrl: imageUrl || null,
      active: true,
      provisioned: true,
      provisionedBy: user.id,
      provisionedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 10. Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('base64url');
    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: `email:${email}`,
      value: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 11. Get center name for email
    const { centers } = await import('@/db/schema');
    const centerRecords = await db
      .select()
      .from(centers)
      .where(eq(centers.id, centerId))
      .limit(1);

    const centerName = centerRecords[0]?.name || 'Your Medical Center';

    // 12. Send provisioning email with temp password
    const emailSent = await sendDoctorProvisioningEmail(
      name,
      email,
      tempPassword,
      centerName
    );

    // 13. If email fails, return error - password should only be transmitted via secure email
    if (!emailSent) {
      console.error(`Failed to send provisioning email to ${email}`);
      
      // Rollback: Delete created records
      await db.delete(doctors).where(eq(doctors.id, newDoctorId));
      await db.delete(accounts).where(eq(accounts.userId, newUserId));
      await db.delete(users).where(eq(users.id, newUserId));
      await db.delete(verifications).where(eq(verifications.identifier, `email:${email}`));
      
      return NextResponse.json(
        { error: 'Failed to send credentials email. Please try again or contact support.' },
        { status: 500 }
      );
    }

    // 14. Return success without exposing password (security: password only transmitted via email)
    return NextResponse.json({
      success: true,
      doctor: {
        id: newDoctorId,
        userId: newUserId,
        name,
        email,
      },
      message: 'Doctor account created successfully. Credentials have been sent to the doctor\'s email.',
    }, { status: 201 });

  } catch (error) {
    console.error('Doctor provisioning error:', error);
    return NextResponse.json(
      { error: 'Failed to provision doctor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
