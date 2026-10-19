/**
 * Terms of Service Page
 * 
 * Required for Google OAuth consent screen
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              Welcome to Medcin Healthcare Platform. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="mb-3">
              Medcin is a healthcare booking platform that connects patients with doctors and medical centers across Southeast Asia. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Online appointment booking and management</li>
              <li>Doctor and medical center discovery</li>
              <li>Patient check-in and check-out systems</li>
              <li>Secure authentication and account management</li>
              <li>Payment coordination (patients pay on-site at clinics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">3.1 Account Creation</h3>
            <p className="mb-3">To use our platform, you must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">3.2 User Roles</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Patients:</strong> Can browse providers, book appointments, and manage their health records</li>
              <li><strong>Doctors:</strong> Must be provisioned by medical centers or approved by administrators</li>
              <li><strong>Medical Centers:</strong> Subject to approval process and compliance requirements</li>
              <li><strong>Administrators:</strong> Platform management with elevated privileges</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">3.3 OAuth Authentication</h3>
            <p>
              When you sign in with Google, you authorize us to access your email and profile information. Doctor accounts using Google Sign-In must be pre-provisioned by a medical center administrator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Booking and Appointments</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">4.1 Booking Process</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Bookings are confirmed upon successful submission through our platform</li>
              <li>You will receive confirmation via email and platform notifications</li>
              <li>Appointment times are based on the local time zone of the medical center</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">4.2 Cancellation Policy</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Patients may cancel appointments subject to the medical center's cancellation policy</li>
              <li>Late cancellations may result in fees as determined by the provider</li>
              <li>Medical centers and doctors reserve the right to cancel appointments with notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">4.3 Check-In and Check-Out</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Patients must check in on the day of their appointment</li>
              <li>Check-in is only available for appointments scheduled for the current day</li>
              <li>Check-out finalizes the appointment and triggers commission calculation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Payments and Fees</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">5.1 Payment Policy</h3>
            <p className="mb-3">
              <strong>Patients pay doctors directly at the clinic</strong> (cash or card on-site). Medcin does not process patient payments.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">5.2 Commission Structure</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Medical centers pay platform commission on completed bookings</li>
              <li>Commission rates are set by administrators (percentage or fixed amount)</li>
              <li>Commission is calculated automatically upon patient check-out</li>
              <li>Independent doctors may operate without center affiliation (no commission)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">5.3 Price Adjustments</h3>
            <p>
              Doctors may adjust the final price at check-out for additional services. Commission is calculated on the final price.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Medical Disclaimers</h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="font-semibold text-yellow-800">IMPORTANT MEDICAL DISCLAIMER</p>
            </div>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Medcin is a <strong>booking platform only</strong> and does not provide medical advice, diagnosis, or treatment</li>
              <li>We do not verify medical credentials beyond basic license number validation</li>
              <li>Healthcare providers are independent contractors, not employees of Medcin</li>
              <li>Medical decisions and treatment are solely between you and your healthcare provider</li>
              <li>In case of medical emergency, call your local emergency services immediately</li>
              <li>We are not liable for medical outcomes, malpractice, or provider negligence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. User Conduct</h2>
            <p className="mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide false or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Use the platform for illegal purposes</li>
              <li>Interfere with platform security or integrity</li>
              <li>Scrape, harvest, or collect user data</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users or providers</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Healthcare Provider Obligations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">8.1 Medical Centers</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Must maintain valid licenses and comply with local healthcare regulations</li>
              <li>Responsible for provisioning and managing doctor accounts</li>
              <li>Must honor bookings made through the platform</li>
              <li>Subject to approval and ongoing compliance review</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">8.2 Doctors</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Must maintain valid medical licenses</li>
              <li>Responsible for patient care quality and medical decisions</li>
              <li>Must accurately record check-ins and check-outs</li>
              <li>Subject to center policies or platform terms (if independent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Security Features</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Device Tracking:</strong> We monitor login devices for security</li>
              <li><strong>New Device Alerts:</strong> You'll receive email alerts for new device logins</li>
              <li><strong>OTP Verification:</strong> Untrusted devices require one-time password verification</li>
              <li><strong>Password Requirements:</strong> Strong passwords required (8+ characters, uppercase, lowercase, numbers)</li>
              <li><strong>First-Login Reset:</strong> Provisioned doctors must change temporary passwords</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on the Medcin platform are owned by Medcin or licensed to us. You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p className="mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Medcin is provided "AS IS" without warranties of any kind</li>
              <li>We are not liable for medical outcomes, provider negligence, or malpractice</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the fees paid to us in the past 12 months</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Medcin, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Termination</h2>
            <p className="mb-3">We may suspend or terminate your account if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activity</li>
              <li>Your account poses a security risk</li>
              <li>Required by law or regulatory authorities</li>
            </ul>
            <p className="mt-3">
              You may terminate your account at any time by contacting support. Termination does not affect obligations incurred before termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the jurisdiction where Medcin is registered. You waive the right to participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be notified via email or platform notification. Continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">16. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Singapore, without regard to conflict of law principles. You agree to the exclusive jurisdiction of Singapore courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">17. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p><strong>Email:</strong> support@medcin.health</p>
              <p><strong>Support Email:</strong> ats7531331@gmail.com</p>
              <p><strong>Address:</strong> Medcin Healthcare Platform</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">18. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            By using Medcin Healthcare Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
