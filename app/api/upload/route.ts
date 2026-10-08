import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

/**
 * Upload API using Neon Storage
 * 
 * Handles file uploads (profile photos, documents, etc.)
 * Stores files in Neon Storage bucket
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];

// Neon project configuration
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'purple-bird-20622592';
const NEON_BRANCH_ID = process.env.NEON_BRANCH_ID || 'br-red-morning-b4lxqc1h';
const NEON_BUCKET_NAME = 'uploads';

/**
 * Step 1: Get presigned upload URL
 * POST /api/upload?action=get-upload-url
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'get-upload-url') {
      // Get presigned upload URL
      const body = await req.json();
      const { filename, contentType, folder } = body;

      if (!filename || !contentType) {
        return NextResponse.json(
          { error: 'Missing filename or contentType' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(contentType)) {
        return NextResponse.json(
          {
            error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF',
            allowedTypes: ALLOWED_TYPES,
          },
          { status: 400 }
        );
      }

      // Generate unique object key
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const extension = filename.split('.').pop();
      const objectKey = `${folder || 'profiles'}/${user.id}_${timestamp}_${randomString}.${extension}`;

      // Get presigned URL from Neon
      const neonApiKey = process.env.NEON_API_KEY;
      
      if (!neonApiKey) {
        return NextResponse.json(
          { error: 'Neon API key not configured' },
          { status: 500 }
        );
      }

      const presignResponse = await fetch('https://console.neon.tech/api/v2/storage/presign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${neonApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: NEON_PROJECT_ID,
          branch_id: NEON_BRANCH_ID,
          bucket_name: NEON_BUCKET_NAME,
          object_key: objectKey,
          operation: 'upload',
          content_type: contentType,
          expires_in_seconds: 3600, // 1 hour
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        console.error('Neon presign error:', errorData);
        return NextResponse.json(
          { error: 'Failed to generate upload URL' },
          { status: 500 }
        );
      }

      const { presigned_url } = await presignResponse.json();

      // Return presigned URL and public URL
      const publicUrl = `https://storage.neon.tech/${NEON_BUCKET_NAME}/${objectKey}`;

      return NextResponse.json({
        uploadUrl: presigned_url,
        publicUrl,
        objectKey,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

/**
 * Delete uploaded file from Neon Storage
 */
export async function DELETE(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedUser();

    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = authContext;
    const { searchParams } = new URL(req.url);
    const objectKey = searchParams.get('objectKey');

    if (!objectKey) {
      return NextResponse.json(
        { error: 'No object key provided' },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user (check objectKey contains user ID)
    if (!objectKey.includes(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own files' },
        { status: 403 }
      );
    }

    const neonApiKey = process.env.NEON_API_KEY;
    
    if (!neonApiKey) {
      return NextResponse.json(
        { error: 'Neon API key not configured' },
        { status: 500 }
      );
    }

    // Delete from Neon Storage
    const deleteResponse = await fetch(
      `https://console.neon.tech/api/v2/storage/objects?project_id=${NEON_PROJECT_ID}&branch_id=${NEON_BRANCH_ID}&bucket_name=${NEON_BUCKET_NAME}&object_key=${encodeURIComponent(objectKey)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${neonApiKey}`,
        },
      }
    );

    if (!deleteResponse.ok && deleteResponse.status !== 404) {
      const errorData = await deleteResponse.json();
      console.error('Neon delete error:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
