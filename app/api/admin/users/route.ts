import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/get-session';
import { getAuthDb } from '@/db/auth-db';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get All Users (Admin Only)
 */
export async function GET(req: NextRequest) {
  try {
    const { user, session } = await getSession();

    if (!user || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
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
    const { user, session } = await getSession();

    if (!user || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { authUid, email, name } = body;

    if (!authUid || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: authUid, email, name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create new admin user
    const newAdmin = await db
      .insert(users)
      .values({
        authUid,
        email,
        name,
        role: 'ADMIN',
      })
      .returning();

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
    const { user, session } = await getSession();

    if (!user || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
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
    const { user, session } = await getSession();

    if (!user || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userRecord[0].id === userId) {
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
