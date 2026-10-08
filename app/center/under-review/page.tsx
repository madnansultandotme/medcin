'use client';

import Link from 'next/link';
import { Clock, CheckCircle, Mail, Shield } from 'lucide-react';

export default function UnderReviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex rounded-full bg-amber-100 dark:bg-amber-900/30 p-4 mb-6">
            <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">
            Your Application is Under Review
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Thank you for registering your healthcare center with Medcin. Our team is currently reviewing your application to ensure quality and compliance.
          </p>

          {/* Status Cards */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Application Received
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We have successfully received your center registration details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Verification in Progress
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Our team is verifying your credentials and license information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  We'll Contact You
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll receive an email notification once your center is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4">What Happens Next?</h3>
            <div className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-3">
                <span className="font-bold text-purple-600 dark:text-purple-400">1.</span>
                <p>Our team reviews your license number and center information</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-purple-600 dark:text-purple-400">2.</span>
                <p>We verify your credentials with relevant medical authorities</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-purple-600 dark:text-purple-400">3.</span>
                <p>You receive approval notification (typically within 1-2 business days)</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-purple-600 dark:text-purple-400">4.</span>
                <p>Access your center dashboard and start managing appointments</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Have questions about your application?{' '}
            <a
              href="mailto:support@medcin.com"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              Contact our support team
            </a>
          </p>

          {/* Action */}
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
