/**
 * Privacy Policy Page
 * 
 * Required for Google OAuth consent screen
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Medcin Healthcare Platform ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare booking platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
              <li><strong>Profile Information:</strong> Medical history, emergency contacts, and preferences</li>
              <li><strong>Booking Information:</strong> Appointment details, doctor selections, and service preferences</li>
              <li><strong>Payment Information:</strong> Payment methods and transaction records (processed securely by third-party providers)</li>
              <li><strong>OAuth Information:</strong> When you sign in with Google, we receive your email, name, and profile picture</li>
              <li><strong>Device Information:</strong> Device ID, browser type, IP address, and usage data for security monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our healthcare booking services</li>
              <li>Process your appointments and facilitate communication with healthcare providers</li>
              <li>Send you booking confirmations, reminders, and important service updates</li>
              <li>Ensure platform security and detect fraudulent activity</li>
              <li>Comply with legal obligations and protect our legal rights</li>
              <li>Provide customer support and respond to your inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
            <p className="mb-3">We share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Healthcare Providers:</strong> We share necessary booking and contact information with doctors and medical centers you book appointments with</li>
              <li><strong>Service Providers:</strong> We use trusted third-party services for email delivery, authentication, and database hosting</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>With Your Consent:</strong> We may share information for other purposes with your explicit consent</li>
            </ul>
            <p className="mt-3">We do NOT sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure password hashing using industry-standard algorithms</li>
              <li>Device tracking and new login alerts for account security</li>
              <li>Regular security audits and monitoring</li>
              <li>Role-based access control for healthcare providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of promotional communications</li>
              <li>Revoke OAuth permissions (e.g., Google Sign-In)</li>
              <li>Request a copy of your data</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. Medical and booking records may be retained longer to comply with legal obligations. You can request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
            <p className="mb-3">Our platform integrates with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Google OAuth:</strong> For secure sign-in (subject to Google's Privacy Policy)</li>
              <li><strong>Neon Database:</strong> For data storage (subject to Neon's Privacy Policy)</li>
              <li><strong>Vercel:</strong> For hosting and deployment (subject to Vercel's Privacy Policy)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and stored in countries outside your jurisdiction. We ensure appropriate safeguards are in place to protect your information in compliance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p><strong>Email:</strong> support@medcin.health</p>
              <p><strong>Support Email:</strong> ats7531331@gmail.com</p>
              <p><strong>Address:</strong> Medcin Healthcare Platform</p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            By using Medcin Healthcare Platform, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
