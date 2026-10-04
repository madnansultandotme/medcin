import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Last updated
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.clay.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.update, color: AppColors.clay, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Last Updated: October 2026',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.clay,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          _buildSection(
            context,
            title: 'Introduction',
            content: 'Medcin ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.\n\nBy using Medcin, you agree to the collection and use of information in accordance with this policy.',
          ),
          
          _buildSection(
            context,
            title: '1. Information We Collect',
            content: 'We collect several types of information for various purposes to provide and improve our service to you:',
            subsections: [
              _SubSection(
                title: 'Personal Information',
                content: '• Full name and contact details\n• Email address and phone number\n• Date of birth and gender\n• Medical information (blood type, allergies)\n• Emergency contact information',
              ),
              _SubSection(
                title: 'Health Information',
                content: '• Appointment history\n• Medical records and prescriptions\n• Doctor consultations\n• Treatment plans',
              ),
              _SubSection(
                title: 'Usage Data',
                content: '• App usage statistics\n• Device information\n• Log data and analytics\n• Location data (with permission)',
              ),
            ],
          ),
          
          _buildSection(
            context,
            title: '2. How We Use Your Information',
            content: 'We use the collected data for various purposes:\n\n• To provide and maintain our service\n• To notify you about changes to our service\n• To provide customer support\n• To gather analysis or valuable information to improve our service\n• To monitor the usage of our service\n• To detect, prevent and address technical issues\n• To send you appointment reminders and health tips',
          ),
          
          _buildSection(
            context,
            title: '3. Data Security',
            content: 'The security of your data is important to us. We use commercially acceptable means to protect your Personal Information, including:\n\n• Encryption of data in transit and at rest\n• Secure authentication methods\n• Regular security audits\n• Limited access to authorized personnel only\n\nHowever, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.',
          ),
          
          _buildSection(
            context,
            title: '4. Data Sharing and Disclosure',
            content: 'We do not sell your personal information. We may share your information only in the following circumstances:',
            subsections: [
              _SubSection(
                title: 'Healthcare Providers',
                content: 'We share necessary medical information with doctors and clinics you book appointments with to facilitate your healthcare services.',
              ),
              _SubSection(
                title: 'Legal Requirements',
                content: 'We may disclose your information if required by law or in response to valid legal requests.',
              ),
              _SubSection(
                title: 'Service Providers',
                content: 'We may employ third-party companies to facilitate our service, and they may have access to your information only to perform tasks on our behalf.',
              ),
            ],
          ),
          
          _buildSection(
            context,
            title: '5. Your Rights',
            content: 'You have the right to:\n\n• Access your personal data\n• Correct inaccurate data\n• Request deletion of your data\n• Object to processing of your data\n• Request restriction of processing\n• Data portability\n• Withdraw consent at any time',
          ),
          
          _buildSection(
            context,
            title: '6. Data Retention',
            content: 'We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to comply with our legal obligations, resolve disputes, and enforce our policies.',
          ),
          
          _buildSection(
            context,
            title: '7. Children\'s Privacy',
            content: 'Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware that a child has provided us with personal information, please contact us.',
          ),
          
          _buildSection(
            context,
            title: '8. Changes to This Privacy Policy',
            content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.\n\nYou are advised to review this Privacy Policy periodically for any changes.',
          ),
          
          _buildSection(
            context,
            title: '9. Contact Us',
            content: 'If you have any questions about this Privacy Policy, please contact us:\n\n• Email: privacy@medcin.health\n• Phone: +65 6123 4567\n• Address: 123 Healthcare St, Singapore',
          ),
          
          const SizedBox(height: 24),
          
          // Compliance badges
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.verified_user,
                  color: Colors.white,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  'PDPA & HIPAA Compliant',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'We comply with Singapore\'s Personal Data Protection Act (PDPA) and international healthcare data standards including HIPAA.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required String content,
    List<_SubSection>? subsections,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.clay,
              ),
        ),
        const SizedBox(height: 12),
        Text(
          content,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
                height: 1.6,
              ),
        ),
        if (subsections != null) ...[
          const SizedBox(height: 12),
          ...subsections.map((subsection) => Padding(
                padding: const EdgeInsets.only(left: 16, top: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subsection.title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subsection.content,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.6,
                          ),
                    ),
                  ],
                ),
              )),
        ],
        const SizedBox(height: 24),
      ],
    );
  }
}

class _SubSection {
  final String title;
  final String content;

  _SubSection({required this.title, required this.content});
}
