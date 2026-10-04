import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_colors.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  int? _expandedFaqIndex;

  final List<_FaqItem> _faqs = [
    _FaqItem(
      question: 'How do I book an appointment?',
      answer: 'To book an appointment:\n1. Browse doctors on the Home or Search screen\n2. Select a doctor you want to consult\n3. Choose an available time slot\n4. Select a service\n5. Fill in your details and confirm',
    ),
    _FaqItem(
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule appointments from the Appointments tab. Please note that cancellations must be made at least 24 hours before your appointment time to avoid cancellation fees.',
    ),
    _FaqItem(
      question: 'How do I pay for my appointment?',
      answer: 'Currently, all payments are made directly at the clinic. We accept cash, credit cards, and most insurance plans. Online payment options are coming soon!',
    ),
    _FaqItem(
      question: 'What should I bring to my appointment?',
      answer: 'Please bring:\n• Valid ID or passport\n• Insurance card (if applicable)\n• Previous medical records (if relevant)\n• List of current medications\n• Your appointment confirmation',
    ),
    _FaqItem(
      question: 'How far in advance can I book?',
      answer: 'You can book appointments up to 3 months in advance. For urgent consultations, same-day appointments may be available depending on doctor availability.',
    ),
    _FaqItem(
      question: 'Can I add family members to my account?',
      answer: 'Family member management is coming soon! This feature will allow you to manage appointments for your entire family from one account.',
    ),
    _FaqItem(
      question: 'Is my medical information secure?',
      answer: 'Yes, we take your privacy seriously. All your personal and medical information is encrypted and stored securely. We comply with healthcare data protection regulations including PDPA and HIPAA.',
    ),
    _FaqItem(
      question: 'What if I\'m running late?',
      answer: 'If you\'re running late, please call the clinic directly to inform them. The phone number is available in your appointment confirmation. Most clinics can accommodate a 15-minute delay.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Contact support cards
          _buildContactCard(
            icon: Icons.email_outlined,
            title: 'Email Support',
            subtitle: 'support@medcin.health',
            onTap: () => _launchEmail('support@medcin.health'),
          ),
          const SizedBox(height: 12),
          
          _buildContactCard(
            icon: Icons.phone_outlined,
            title: 'Call Us',
            subtitle: '+65 6123 4567',
            onTap: () => _launchPhone('+6561234567'),
          ),
          const SizedBox(height: 12),
          
          _buildContactCard(
            icon: Icons.chat_bubble_outline,
            title: 'Live Chat',
            subtitle: 'Available Mon-Fri, 9AM-6PM',
            onTap: () => _showChatComingSoon(),
          ),
          const SizedBox(height: 24),
          
          // FAQ Section
          Row(
            children: [
              const Icon(Icons.help_outline, color: AppColors.clay),
              const SizedBox(width: 8),
              Text(
                'Frequently Asked Questions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // FAQ List
          ...List.generate(_faqs.length, (index) {
            final faq = _faqs[index];
            final isExpanded = _expandedFaqIndex == index;
            
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _expandedFaqIndex = isExpanded ? null : index;
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              faq.question,
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ),
                          Icon(
                            isExpanded ? Icons.expand_less : Icons.expand_more,
                            color: AppColors.clay,
                          ),
                        ],
                      ),
                      if (isExpanded) ...[
                        const SizedBox(height: 12),
                        Text(
                          faq.answer,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                                height: 1.5,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),
          const SizedBox(height: 24),
          
          // Additional resources
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                const Icon(
                  Icons.headset_mic_outlined,
                  color: Colors.white,
                  size: 48,
                ),
                const SizedBox(height: 16),
                Text(
                  'Need More Help?',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Our support team is here to help you with any questions or concerns.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.9),
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => _launchEmail('support@medcin.health'),
                  icon: const Icon(Icons.email),
                  label: const Text('Contact Support'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.clay,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.clay.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppColors.clay),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchEmail(String email) async {
    final Uri emailUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Medcin Support Request',
    );
    
    if (await canLaunchUrl(emailUri)) {
      await launchUrl(emailUri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open email app. Please email us at $email'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _launchPhone(String phone) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phone);
    
    if (await canLaunchUrl(phoneUri)) {
      await launchUrl(phoneUri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open phone app. Please call $phone'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _showChatComingSoon() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.chat_outlined, color: AppColors.clay, size: 48),
        title: const Text('Live Chat Coming Soon'),
        content: const Text(
          'Our live chat feature is under development. For immediate assistance, please email or call us.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

class _FaqItem {
  final String question;
  final String answer;

  _FaqItem({required this.question, required this.answer});
}
