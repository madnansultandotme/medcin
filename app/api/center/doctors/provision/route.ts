/**
 * POST /api/center/doctors/provision
 * 
 * Center admin endpoint to provision new doctor accounts with temporary passwords
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCenter, getUserCenterId } from '@/lib/middleware/permissions';
import { provisionDoctorSchema } from '@/lib/validations/doctor';
import { db } from '@/db';
import { users, doctors, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendDoctorProvisioningEmail } from '@/lib/email';
import { auth } from '@/lib/auth-config';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Require CENTER role
  const authResult = await requireCenter();
  if ('error' in authResult) {
    return authResult.error;
  }

  const { context } = authResult;
  const centerId = await getUserCenterId(context.user.id);

  if (!centerId) {
    return NextResponse.json(
      { error: 'Center profile not found for this user' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validation = provisionDoctorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const existingDoctor = await db
      .select()
      .from(doctors)
      .where(eq(doctors.licenseNumber, data.licenseNumber))
      .limit(1);

    if (existingDoctor.length > 0) {
      return NextResponse.json(
        { error: 'A doctor with this license number already exists' },
        { status: 409 }
      );
    }

    // Generate temporary password (16 bytes, base64url encoded)
    const tempPassword = crypto.randomBytes(16).toString('base64url');
    
    // Set expiration to 7 days from now
    const tempPasswordExpiresAt = new Date();
    tempPasswordExpiresAt.setDate(tempPasswordExpiresAt.getDate() + 7);

    // Hash the temporary password using Better Auth's default hash function
    const hashedPassword = await auth.api.hashPassword(tempPassword);

    // Create user record
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: 'DOCTOR',
        emailVerified: false,
        passwordResetRequired: true,
        isFirstLogin: true,
        tempPasswordExpiresAt,
      })
      .returning();

    // Create credential account for password authentication
    await db.insert(accounts).values({
      userId: newUser.id,
      accountId: newUser.id,
      providerId: 'credential',
      password: hashedPassword,
    });

    // Create doctor profile
    const [newDoctor] = await db
      .insert(doctors)
      .values({
        userId: newUser.id,
        centerId,
        name: data.name,
        role: data.role,
        category: data.category,
        specialization: data.specialization || null,
        licenseNumber: data.licenseNumber,
        price: data.price,
        consultationFee: data.consultationFee || data.price,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        isIndependent: false,
        active: true,
        provisioned: true,
        provisionedBy: context.user.id,
        provisionedAt: new Date(),
      })
      .returning();

    // Send provisioning email with temporary password
    const centerRecord = await db.query.centers.findFirst({
      where: (centers, { eq }) => eq(centers.id, centerId),
    });

    const emailSent = await sendDoctorProvisioningEmail(
      data.name,
      data.email,
      tempPassword,
      centerRecord?.name || 'Your Medical Center'
    );

    if (!emailSent) {
      console.error('Failed to send provisioning email to:', data.email);
      // Don't fail the request, but log the error
    }

    // Return success without exposing the temporary password in logs
    return NextResponse.json({
      success: true,
      message: 'Doctor account created successfully. Credentials sent to email.',
      doctor: {
        id: newDoctor.id,
        userId: newUser.id,
        name: newDoctor.name,
        email: newUser.email,
        category: newDoctor.category,
        role: newDoctor.role,
        licenseNumber: newDoctor.licenseNumber,
      },
      // Only return temp password if email failed (for manual delivery)
      ...(emailSent ? {} : { tempPassword, warning: 'Email delivery failed - please share credentials securely' }),
    }, { status: 201 });

  } catch (error) {
    console.error('Doctor provisioning error:', error);
    return NextResponse.json(
      { error: 'Failed to provision doctor account' },
      { status: 500 }
    );
  }
}
