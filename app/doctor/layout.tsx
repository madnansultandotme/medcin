/**
 * Doctor Layout
 * 
 * Layout for doctor dashboard routes.
 * Enforces first-login password reset before allowing access.
 */

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { checkFirstLogin } from '@/lib/middleware/first-login-check';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { requiresReset, user } = await checkFirstLogin();
  
  // Get current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Allow access to these paths even if password reset is required
  const allowedPaths = [
    '/doctor/change-password',
    '/api/auth/change-password-first-login',
    '/auth/signout',
    '/api/auth/signout',
  ];
  
  const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));

  // Redirect to password change if required and not on an allowed path
  if (requiresReset && !isAllowedPath) {
    redirect('/doctor/change-password');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Medcin</span>
                <span className="ml-2 text-sm text-gray-500">Doctor</span>
              </div>
              {!requiresReset && (
                <div className="ml-10 flex items-center space-x-4">
                  <a
                    href="/doctor"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/doctor/bookings"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Bookings
                  </a>
                  <a
                    href="/doctor/profile"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </a>
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Dr. {user.name}
                </span>
                <a
                  href="/api/auth/signout"
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
