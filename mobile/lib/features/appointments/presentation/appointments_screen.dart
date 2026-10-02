import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Appointments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Completed'),
            Tab(text: 'Cancelled'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildUpcomingAppointments(),
          _buildCompletedAppointments(),
          _buildCancelledAppointments(),
        ],
      ),
    );
  }

  Widget _buildUpcomingAppointments() {
    final upcomingAppointments = _getMockAppointments('upcoming');

    if (upcomingAppointments.isEmpty) {
      return _buildEmptyState(
        icon: Icons.calendar_today,
        title: 'No Upcoming Appointments',
        subtitle: 'Your upcoming appointments will appear here',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: upcomingAppointments.length,
      itemBuilder: (context, index) {
        final appointment = upcomingAppointments[index];
        return _buildAppointmentCard(appointment, 'upcoming');
      },
    );
  }

  Widget _buildCompletedAppointments() {
    final completedAppointments = _getMockAppointments('completed');

    if (completedAppointments.isEmpty) {
      return _buildEmptyState(
        icon: Icons.check_circle_outline,
        title: 'No Completed Appointments',
        subtitle: 'Your appointment history will appear here',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: completedAppointments.length,
      itemBuilder: (context, index) {
        final appointment = completedAppointments[index];
        return _buildAppointmentCard(appointment, 'completed');
      },
    );
  }

  Widget _buildCancelledAppointments() {
    final cancelledAppointments = _getMockAppointments('cancelled');

    if (cancelledAppointments.isEmpty) {
      return _buildEmptyState(
        icon: Icons.cancel_outlined,
        title: 'No Cancelled Appointments',
        subtitle: 'Your cancelled appointments will appear here',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: cancelledAppointments.length,
      itemBuilder: (context, index) {
        final appointment = cancelledAppointments[index];
        return _buildAppointmentCard(appointment, 'cancelled');
      },
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: AppColors.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(Map<String, dynamic> appointment, String status) {
    Color statusColor;
    Color statusBgColor;
    IconData statusIcon;
    
    switch (status) {
      case 'upcoming':
        statusColor = AppColors.clay;
        statusBgColor = AppColors.clay.withOpacity(0.1);
        statusIcon = Icons.schedule;
        break;
      case 'completed':
        statusColor = AppColors.success;
        statusBgColor = AppColors.success.withOpacity(0.1);
        statusIcon = Icons.check_circle;
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusBgColor = AppColors.error.withOpacity(0.1);
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = AppColors.textSecondary;
        statusBgColor = AppColors.surface;
        statusIcon = Icons.info;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.clay.withOpacity(0.1),
                  child: Text(
                    appointment['doctorName'][0].toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.clay,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointment['doctorName'],
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        appointment['specialty'],
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBgColor,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        status[0].toUpperCase() + status.substring(1),
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(
                  appointment['date'],
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 24),
                const Icon(Icons.access_time, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(
                  appointment['time'],
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            if (status == 'upcoming') ...[
              const SizedBox(height: 16),
              LayoutBuilder(
                builder: (context, constraints) {
                  // Stack vertically on narrow screens
                  if (constraints.maxWidth < 320) {
                    return Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: () => _cancelAppointment(appointment),
                            icon: const Icon(Icons.cancel_outlined, size: 18),
                            label: const Text('Cancel'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.error,
                              side: const BorderSide(color: AppColors.error),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: () => _rescheduleAppointment(appointment),
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Reschedule'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.clay,
                            ),
                          ),
                        ),
                      ],
                    );
                  }
                  
                  // Side by side on wider screens
                  return Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _cancelAppointment(appointment),
                          icon: const Icon(Icons.cancel_outlined, size: 18),
                          label: const Text('Cancel'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                            side: const BorderSide(color: AppColors.error),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () => _rescheduleAppointment(appointment),
                          icon: const Icon(Icons.edit_calendar, size: 18),
                          label: const Text('Reschedule'),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.clay,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  List<Map<String, dynamic>> _getMockAppointments(String status) {
    if (status == 'upcoming') {
      return [
        {
          'id': '1',
          'doctorName': 'Dr. Sarah Johnson',
          'specialty': 'Cardiology',
          'date': DateFormat('MMM d, yyyy').format(DateTime.now().add(const Duration(days: 2))),
          'time': '10:00 AM',
        },
        {
          'id': '2',
          'doctorName': 'Dr. Michael Chen',
          'specialty': 'General Practice',
          'date': DateFormat('MMM d, yyyy').format(DateTime.now().add(const Duration(days: 5))),
          'time': '2:30 PM',
        },
      ];
    } else if (status == 'completed') {
      return [
        {
          'id': '3',
          'doctorName': 'Dr. Emily Rodriguez',
          'specialty': 'Pediatrics',
          'date': DateFormat('MMM d, yyyy').format(DateTime.now().subtract(const Duration(days: 10))),
          'time': '11:00 AM',
        },
      ];
    } else {
      return [];
    }
  }

  void _cancelAppointment(Map<String, dynamic> appointment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: Text('Are you sure you want to cancel your appointment with ${appointment['doctorName']}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Appointment cancelled successfully'),
                  backgroundColor: AppColors.error,
                ),
              );
              setState(() {});
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  void _rescheduleAppointment(Map<String, dynamic> appointment) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Reschedule feature - Will be fully implemented in next iteration'),
        backgroundColor: AppColors.clay,
      ),
    );
  }
}
