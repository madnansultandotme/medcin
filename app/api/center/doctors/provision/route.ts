/**
 * Doctor Provisioning API
 * 
 * Allows center admins to create doctor accounts with temporary passwords.
 * POST /api/center/doctors/provision
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';
import { auth } from '@/lib/auth-config';
import { db } from '@/db';
import { users, doctors, accounts, verifications, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendDoctorProvisioningEmail } from '@/lib/email';
import crypto from 'crypto';

// Temporary inline validation until zod is installed
function validateProvisionDoctorRequest(body: any) {
  const errors: string[] = [];
  
  if (!body.name || typeof body.name !== 'string' || body.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!body.category || typeof body.category !== 'string') {
    errors.push('Category is required');
  }
  if (!body.licenseNumber || typeof body.licenseNumber !== 'string' || body.licenseNumber.length < 5) {
    errors.push('License number must be at least 5 characters');
  }
  if (typeof body.price !== 'number' || body.price <= 0) {
    errors.push('Price must be a positive number');
  }
  
  return errors;
}

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
    const validationErrors = validateProvisionDoctorRequest(body);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
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
    } = body;

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
    const hashedPassword = await auth.api.hashPassword({
      password: tempPassword,
    });

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

    // 13. If email fails, create notification for center admin
    if (!emailSent) {
      console.error(`Failed to send provisioning email to ${email}`);
      
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'warning',
        title: 'Doctor Account Created, Email Failed',
        message: `Doctor ${name} (${email}) was created, but the email failed to send. Please manually provide credentials: Temp Password: ${tempPassword}`,
        createdAt: new Date(),
      });
    }

    // 14. Return success with temp password (shown once)
    return NextResponse.json({
      success: true,
      doctor: {
        id: newDoctorId,
        userId: newUserId,
        name,
        email,
        tempPassword, // Only shown once, must be securely shared
      },
      message: 'Doctor account created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Doctor provisioning error:', error);
    return NextResponse.json(
      { error: 'Failed to provision doctor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
