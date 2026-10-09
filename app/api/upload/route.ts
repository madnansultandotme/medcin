import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';
import { createNeonClient } from '@neon/sdk';

/**
 * Upload API using Neon Storage
 * 
 * Handles file uploads (profile photos, documents, etc.)
 * Stores files in Neon Object Storage
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];

// Neon project configuration
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'purple-bird-20622592';
const NEON_BRANCH_ID = process.env.NEON_BRANCH_ID || 'br-red-morning-b4lxqc1h';
const NEON_BUCKET_NAME = 'uploads';

// Initialize Neon client
const getNeonClient = () => {
  const apiKey = process.env.NEON_API_KEY;
  if (!apiKey) {
    throw new Error('NEON_API_KEY not configured');
  }
  return createNeonClient({ apiKey });
};

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

    console.log('[Upload API] Request received:', {
      action,
      url: req.url,
      searchParams: Array.from(searchParams.entries()),
    });

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

      try {
        // Get Neon client
        const neon = getNeonClient();

        // Generate presigned URL using Neon SDK
        const result = await neon.storage.objects.presign({
          projectId: NEON_PROJECT_ID,
          branchId: NEON_BRANCH_ID,
          bucketName: NEON_BUCKET_NAME,
          objectKey,
          operation: 'upload',
          content_type: contentType,
          expires_in_seconds: 3600, // 1 hour
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to generate presigned URL');
        }

        const presign = result.data;

        // Return presigned URL info
        const publicUrl = `${presign.url.split('?')[0]}`; // URL without query params

        return NextResponse.json({
          uploadUrl: presign.url,
          method: presign.method || 'PUT',
          uploadHeaders: presign.headers || {},
          publicUrl,
          objectKey,
        });
      } catch (error: any) {
        console.error('Neon presign error:', error);
        return NextResponse.json(
          { 
            error: 'Failed to generate upload URL', 
            details: error.message 
          },
          { status: 500 }
        );
      }
    }

    console.log('[Upload API] No matching action, returning 400. Action was:', action);
    return NextResponse.json(
      { error: 'Invalid action', receivedAction: action },
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

    try {
      // Get Neon client
      const neon = getNeonClient();

      // Delete from Neon Storage
      const result = await neon.storage.objects.delete({
        projectId: NEON_PROJECT_ID,
        branchId: NEON_BRANCH_ID,
        bucketName: NEON_BUCKET_NAME,
        objectKey,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete file');
      }

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Neon delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete file', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
