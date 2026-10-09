import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth/get-session';
import { getAuthenticatedUser } from '@/lib/middleware/permissions';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const sessionCookie = cookieStore.get('better-auth.session_token');
    
    const { user: sessionUser, session } = await getSession();
    const authContext = await getAuthenticatedUser();
    
    return NextResponse.json({
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        hasSessionToken: !!sessionCookie,
        sessionTokenLength: sessionCookie?.value?.length || 0,
      },
      getSession: {
        hasUser: !!sessionUser,
        hasSession: !!session,
        userEmail: sessionUser?.email || null,
      },
      getAuthenticatedUser: {
        hasContext: !!authContext,
        userId: authContext?.user?.id || null,
        userEmail: authContext?.user?.email || null,
        userRole: authContext?.user?.role || null,
      },
      env: {
        hasAuthUrl: !!process.env.NEXT_PUBLIC_NEON_AUTH_URL,
        authUrlLength: process.env.NEXT_PUBLIC_NEON_AUTH_URL?.length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
