import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth/get-session';
import { getAuthDb } from '@/db/auth-db';
import { db } from '@/db';
import { settings, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get Settings
 * 
 * Returns application settings.
 * Public settings are available to all, admin-only settings require auth.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific setting
      const setting = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      if (setting.length === 0) {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ setting: setting[0] });
    } else {
      // Get all settings
      const allSettings = await db
        .select()
        .from(settings)
        .limit(100);

      return NextResponse.json({
        settings: allSettings,
        count: allSettings.length,
      });
    }
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * Create Setting
 * 
 * Creates a new setting (admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, session } = await requireAuth();
    const body = await req.json();

    const { key, value } = body;

    // Validate required fields
    if (!key || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if setting already exists
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Setting with this key already exists' },
        { status: 400 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Create setting
    const newSetting = await authDb
      .insert(settings)
      .values({
        key,
        value,
      })
      .returning();

    return NextResponse.json(
      { setting: newSetting[0], message: 'Setting created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setting creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}

/**
 * Update Setting
 * 
 * Updates an existing setting (admin only).
 */
export async function PUT(req: NextRequest) {
  try {
    const { user, session } = await requireAuth();
    const body = await req.json();

    const { id, key, value } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (key) updateData.key = key;
    if (value) updateData.value = value;

    // Update setting
    const updated = await authDb
      .update(settings)
      .set(updateData)
      .where(eq(settings.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ setting: updated[0] });
  } catch (error) {
    console.error('Setting update error:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

/**
 * Delete Setting
 * 
 * Removes a setting (admin only).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { user, session } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.authUid, user.id))
      .limit(1);

    if (userRecord.length === 0 || userRecord[0].role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get authenticated database instance
    const authDb = getAuthDb(session.token);

    // Delete setting
    const deleted = await authDb
      .delete(settings)
      .where(eq(settings.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Setting deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
