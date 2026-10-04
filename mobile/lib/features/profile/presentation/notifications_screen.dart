import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  // Notification preferences
  bool _appointmentReminders = true;
  bool _appointmentUpdates = true;
  bool _promotionalOffers = false;
  bool _healthTips = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _pushNotifications = true;
  
  int _reminderTime = 24; // hours before appointment
  final List<int> _reminderOptions = [1, 6, 12, 24, 48];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Appointment Notifications
          _buildSectionHeader('Appointment Notifications'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Appointment Reminders'),
                  subtitle: const Text('Get reminded before appointments'),
                  value: _appointmentReminders,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _appointmentReminders = value);
                    _showSavedMessage();
                  },
                ),
                if (_appointmentReminders) ...[
                  const Divider(height: 1),
                  ListTile(
                    title: const Text('Reminder Time'),
                    subtitle: Text('$_reminderTime hours before appointment'),
                    trailing: DropdownButton<int>(
                      value: _reminderTime,
                      underline: const SizedBox(),
                      items: _reminderOptions.map((hours) {
                        return DropdownMenuItem(
                          value: hours,
                          child: Text('$hours hours'),
                        );
                      }).toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _reminderTime = value);
                          _showSavedMessage();
                        }
                      },
                    ),
                  ),
                ],
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Appointment Updates'),
                  subtitle: const Text('Receive updates on booking status'),
                  value: _appointmentUpdates,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _appointmentUpdates = value);
                    _showSavedMessage();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // General Notifications
          _buildSectionHeader('General'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Health Tips'),
                  subtitle: const Text('Receive health and wellness tips'),
                  value: _healthTips,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _healthTips = value);
                    _showSavedMessage();
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Promotional Offers'),
                  subtitle: const Text('Get notified about special offers'),
                  value: _promotionalOffers,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _promotionalOffers = value);
                    _showSavedMessage();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Notification Channels
          _buildSectionHeader('Notification Channels'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Push Notifications'),
                  subtitle: const Text('In-app notifications'),
                  secondary: const Icon(Icons.notifications_outlined),
                  value: _pushNotifications,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _pushNotifications = value);
                    _showSavedMessage();
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Email Notifications'),
                  subtitle: const Text('Receive updates via email'),
                  secondary: const Icon(Icons.email_outlined),
                  value: _emailNotifications,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _emailNotifications = value);
                    _showSavedMessage();
                  },
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('SMS Notifications'),
                  subtitle: const Text('Get text message alerts'),
                  secondary: const Icon(Icons.sms_outlined),
                  value: _smsNotifications,
                  activeColor: AppColors.clay,
                  onChanged: (value) {
                    setState(() => _smsNotifications = value);
                    _showSavedMessage();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Info card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.clay.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.clay.withOpacity(0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.info_outline,
                  color: AppColors.clay,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notification Preferences',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.clay,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Your preferences are saved automatically. You can change them anytime.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Test notification button
          OutlinedButton.icon(
            onPressed: _sendTestNotification,
            icon: const Icon(Icons.send_outlined),
            label: const Text('Send Test Notification'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              foregroundColor: AppColors.clay,
              side: const BorderSide(color: AppColors.clay),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
      ),
    );
  }

  void _showSavedMessage() {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Preference saved'),
        duration: Duration(milliseconds: 500),
        backgroundColor: AppColors.sage,
      ),
    );
  }

  void _sendTestNotification() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(
          Icons.notifications_active,
          color: AppColors.clay,
          size: 48,
        ),
        title: const Text('Test Notification'),
        content: const Text(
          'This is a test notification! You would receive appointment reminders and updates like this.',
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.clay,
            ),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }
}
