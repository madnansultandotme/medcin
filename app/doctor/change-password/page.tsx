/**
 * Doctor First-Login Password Change Page
 * 
 * Forces doctor to change their temporary password on first login.
 */

import { requireDoctor } from '@/lib/middleware/permissions';
import ChangePasswordForm from './ChangePasswordForm';

export default async function ChangePasswordPage() {
  const authResult = await requireDoctor();
  if ('error' in authResult) {
    return <div>Unauthorized</div>;
  }

  const { context } = authResult;
  const { user } = context;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Change Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome, Dr. {user.name}! For security, please change your temporary password.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your temporary password expires in 24 hours. Please set a new secure password now.
                </p>
              </div>
            </div>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
