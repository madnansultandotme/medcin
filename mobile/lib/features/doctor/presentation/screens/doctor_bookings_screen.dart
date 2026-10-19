import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/doctor_bookings_provider.dart';
import '../widgets/booking_card.dart';

class DoctorBookingsScreen extends ConsumerWidget {
  final String? filter; // 'today', 'all', etc.

  const DoctorBookingsScreen({super.key, this.filter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = filter == 'today'
        ? ref.watch(todayBookingsProvider)
        : ref.watch(doctorBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(filter == 'today' ? 'Today\'s Bookings' : 'My Bookings'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          if (filter == 'today') {
            ref.invalidate(todayBookingsProvider);
          } else {
            ref.invalidate(doctorBookingsProvider);
          }
        },
        child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No bookings found',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final booking = bookings[index];
                return BookingCard(
                  booking: booking,
                  onTap: () {
                    Navigator.of(context).pushNamed(
                      '/doctor/checkin/${booking.id}',
                      arguments: booking,
                    );
                  },
                );
              },
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(),
          ),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red[300],
                ),
                const SizedBox(height: 16),
                Text(
                  'Error loading bookings',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    if (filter == 'today') {
                      ref.invalidate(todayBookingsProvider);
                    } else {
                      ref.invalidate(doctorBookingsProvider);
                    }
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
