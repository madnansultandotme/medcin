'use client';

import { useRouter } from 'next/navigation';
import { XCircle, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RejectedPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
          <div className="inline-flex rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-6">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Application Not Approved
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Unfortunately, your healthcare center application has not been approved at this time.
          </p>

          {/* Info Box */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">
              Possible Reasons
            </h3>
            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li>• Incomplete or invalid license information</li>
              <li>• Documentation does not meet requirements</li>
              <li>• Verification with medical authorities failed</li>
              <li>• Center does not meet platform standards</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  If you believe this is an error or would like to appeal this decision, please contact our support team.
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
