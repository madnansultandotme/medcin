/**
 * Independent Doctor Registration API
 * 
 * Allows doctors to self-register (without center affiliation)
 * Requires admin approval before account activation
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { db } from '@/db';
import { users, doctors, accounts, verifications, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      category,
      specialization,
      licenseNumber,
      consultationFee,
      price,
      bio,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !category || !licenseNumber || !consultationFee || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check license number uniqueness
    const existingLicense = await db
      .select()
      .from(doctors)
      .where(eq(doctors.licenseNumber, licenseNumber))
      .limit(1);

    if (existingLicense.length > 0) {
      return NextResponse.json(
        { error: 'License number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user account
    const newUserId = crypto.randomUUID();
    await db.insert(users).values({
      id: newUserId,
      email,
      name,
      phone: phone || null,
      role: 'DOCTOR',
      emailVerified: false,
      passwordResetRequired: false, // They set their own password
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create credential account
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: newUserId,
      accountId: newUserId,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create doctor profile (inactive, pending approval)
    const newDoctorId = crypto.randomUUID();
    await db.insert(doctors).values({
      id: newDoctorId,
      userId: newUserId,
      centerId: null, // Independent doctor
      name,
      role: 'Doctor',
      category,
      specialization: specialization || null,
      licenseNumber,
      price,
      consultationFee,
      bio: bio || null,
      imageUrl: null,
      isIndependent: true,
      active: false, // Requires admin approval
      provisioned: false, // Self-registered
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('base64url');
    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: `email:${email}`,
      value: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify your Medcin account',
      text: `
Hello Dr. ${name},

Thank you for registering with Medcin!

Please verify your email address by clicking the link below:
${verificationLink}

Your account is pending approval by our admin team. You'll receive another email once approved.

If you didn't create this account, please ignore this email.

Best regards,
The Medcin Team
      `.trim(),
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1769AA;">Welcome to Medcin, Dr. ${name}!</h2>
  <p>Thank you for registering as an independent doctor.</p>
  
  <div style="background-color: #F0F7FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Next Steps:</strong></p>
    <ol style="margin: 10px 0;">
      <li>Verify your email address</li>
      <li>Wait for admin approval (1-2 business days)</li>
      <li>Login and start accepting patients</li>
    </ol>
  </div>
  
  <p>
    <a href="${verificationLink}" style="display: inline-block; background-color: #1769AA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
      Verify Email Address
    </a>
  </p>
  
  <p style="color: #666; font-size: 14px;">
    If the button doesn't work, copy and paste this link:<br>
    ${verificationLink}
  </p>
  
  <p style="color: #666; font-size: 14px;">
    If you didn't create this account, please ignore this email.
  </p>
  
  <p>Best regards,<br>The Medcin Team</p>
</div>
      `.trim(),
    });

    // Create notification for all admins
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'ADMIN'));

    for (const admin of adminUsers) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: admin.id,
        type: 'info',
        title: 'New Doctor Registration',
        message: `Dr. ${name} has registered as an independent doctor. License: ${licenseNumber}. Please review and approve.`,
        link: '/admin/doctors',
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      doctor: {
        id: newDoctorId,
        name,
        email,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    }, { status: 201 });

  } catch (error) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
