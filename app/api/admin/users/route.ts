import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { db } from '@/db';
import { users, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * Hash password using the same algorithm as Better Auth (scrypt)
 */
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    
    const N = 16384;
    const r = 16;
    const p = 1;
    const maxmem = 128 * N * r * 2;
    
    crypto.scrypt(
      password.normalize('NFKC'), 
      saltHex, 
      64, 
      { N, r, p, maxmem }, 
      (err, derivedKey) => {
        if (err) reject(err);
        const hash = `${saltHex}:${derivedKey.toString('hex')}`;
        resolve(hash);
      }
    );
  });
}

/**
 * Generate a random ID (Better Auth format)
 */
function generateId(): string {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Get All Users (Admin Only)
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await db.select().from(users).orderBy(users.createdAt);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * Create New Admin (Admin Only)
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, phone, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Generate user ID
    const userId = generateId();

    // Create user record
    const newAdmin = await db
      .insert(users)
      .values({
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'ADMIN',
        emailVerified: true, // Auto-verify admin users
        authUid: null,
      })
      .returning();

    // Create account record with password
    const accountId = generateId();
    const hashedPassword = await hashPassword(password);

    await db
      .insert(accounts)
      .values({
        id: accountId,
        accountId: userId,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
      });

    return NextResponse.json(
      { user: newAdmin[0], message: 'Admin user created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

/**
 * Update User Role (Admin Only)
 */
export async function PUT(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'CENTER', 'PATIENT'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, CENTER, or PATIENT' },
        { status: 400 }
      );
    }

    // Update user role
    const updated = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: updated[0],
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

/**
 * Delete User (Admin Only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authContext;

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Prevent self-deletion
    if (user.id === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user
    const deleted = await db.delete(users).where(eq(users.id, userId)).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
