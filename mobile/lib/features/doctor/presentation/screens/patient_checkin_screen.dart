import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../data/models/booking_model.dart';
import '../providers/doctor_bookings_provider.dart';
import '../widgets/checkin_button.dart';
import '../widgets/commission_display.dart';

class PatientCheckinScreen extends ConsumerWidget {
  final String bookingId;

  const PatientCheckinScreen({
    super.key,
    required this.bookingId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingAsync = ref.watch(bookingDetailProvider(bookingId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Patient Check-In'),
      ),
      body: bookingAsync.when(
        data: (booking) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Patient info card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            child: Text(
                              booking.patientName?.substring(0, 1).toUpperCase() ?? 'P',
                              style: const TextStyle(fontSize: 24),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  booking.patientName ?? 'Unknown Patient',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (booking.patientEmail != null)
                                  Text(
                                    booking.patientEmail!,
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                if (booking.patientPhone != null)
                                  Text(
                                    booking.patientPhone!,
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Booking details card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Booking Details',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _DetailRow(
                        icon: Icons.confirmation_number,
                        label: 'Reference',
                        value: booking.reference,
                      ),
                      _DetailRow(
                        icon: Icons.calendar_today,
                        label: 'Date',
                        value: DateFormat('EEEE, MMMM d, y').format(DateTime.parse(booking.date)),
                      ),
                      _DetailRow(
                        icon: Icons.access_time,
                        label: 'Time',
                        value: booking.time,
                      ),
                      if (booking.serviceName != null)
                        _DetailRow(
                          icon: Icons.medical_services,
                          label: 'Service',
                          value: booking.serviceName!,
                        ),
                      _DetailRow(
                        icon: Icons.attach_money,
                        label: 'Price',
                        value: '\$${booking.price.toStringAsFixed(2)}',
                      ),
                      _DetailRow(
                        icon: Icons.info_outline,
                        label: 'Status',
                        value: booking.status,
                        valueColor: _getStatusColor(booking.status),
                      ),
                      if (booking.patientNotes != null && booking.patientNotes!.isNotEmpty)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 8),
                            const Divider(),
                            const SizedBox(height: 8),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.note, size: 20, color: Colors.grey),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Patient Notes',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(booking.patientNotes!),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Check-in/Check-out status
              if (booking.isCheckedIn)
                Card(
                  color: Colors.green[50],
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green[700]),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Checked In',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green[700],
                                    ),
                                  ),
                                  Text(
                                    'At ${DateFormat('h:mm a').format(booking.checkedInAt!)}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.green[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (booking.isCheckedOut) ...[
                          const SizedBox(height: 12),
                          const Divider(),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(Icons.done_all, color: Colors.green[700]),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Checked Out',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green[700],
                                      ),
                                    ),
                                    Text(
                                      'At ${DateFormat('h:mm a').format(booking.checkedOutAt!)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.green[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),

              // Commission display (shown after checkout)
              if (booking.isCheckedOut && booking.commissionAmount != null)
                CommissionDisplay(
                  commissionAmount: booking.commissionAmount!,
                  centerEarnings: booking.centerEarnings ?? 0,
                  totalPrice: booking.price,
                ),
              const SizedBox(height: 16),

              // Check-in/Check-out buttons
              if (booking.canCheckIn)
                CheckinButton(
                  bookingId: booking.id,
                  label: 'Check In Patient',
                  icon: Icons.login,
                ),
              if (booking.canCheckOut)
                CheckinButton(
                  bookingId: booking.id,
                  label: 'Check Out Patient',
                  icon: Icons.logout,
                  isCheckout: true,
                ),
            ],
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(bookingDetailProvider(bookingId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      case 'COMPLETED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: valueColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
