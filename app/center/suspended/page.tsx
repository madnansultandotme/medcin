'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SuspendedPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Logout Button - Top Right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Icon */}
          <div className="inline-flex rounded-full bg-orange-100 dark:bg-orange-900/30 p-4 mb-6">
            <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Account Suspended
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Your healthcare center account has been temporarily suspended.
          </p>

          {/* Info Box */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
              Common Reasons for Suspension
            </h3>
            <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <li>• Policy violations or terms of service breaches</li>
              <li>• Patient complaints or quality concerns</li>
              <li>• Expired or invalid credentials</li>
              <li>• Payment or billing issues</li>
              <li>• Under investigation by administrators</li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              During the suspension period, you will not be able to:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left max-w-md mx-auto">
              <li>• Access your dashboard</li>
              <li>• Manage appointments or bookings</li>
              <li>• Update services or doctor profiles</li>
              <li>• Receive new patient bookings</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Resolve This Issue
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  To understand the reason for suspension and steps to reinstate your account, please contact our support team immediately.
                </p>
                <a
                  href="mailto:support@medcin.com"
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
