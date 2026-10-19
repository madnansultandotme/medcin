/**
 * Doctor Signup Success Page
 * 
 * Confirmation page after successful doctor registration
 */

import Link from 'next/link';
import { CheckCircle, Mail, Clock } from 'lucide-react';

export default function DoctorSignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Registration Successful!
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Thank you for registering with Medcin. Your doctor account has been created and is pending approval.
          </p>

          {/* Info Boxes */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 text-left bg-blue-50 p-4 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Email Verification</p>
                <p className="text-sm text-blue-700 mt-1">
                  We've sent a verification email to your inbox. Please verify your email address.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left bg-yellow-50 p-4 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Pending Approval</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Our admin team will review your application. You'll receive an email once approved (usually within 1-2 business days).
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-gray-600 text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-semibold">1.</span>
                <span>Verify your email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">2.</span>
                <span>Admin reviews your credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">3.</span>
                <span>You receive approval notification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">4.</span>
                <span>Login and start accepting patients</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Questions?{' '}
          <a href="mailto:support@medcin.health" className="text-blue-600 hover:text-blue-700">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
