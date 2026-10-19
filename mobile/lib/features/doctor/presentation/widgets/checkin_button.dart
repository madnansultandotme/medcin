import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/doctor_bookings_provider.dart';

class CheckinButton extends ConsumerWidget {
  final String bookingId;
  final String label;
  final IconData icon;
  final bool isCheckout;

  const CheckinButton({
    super.key,
    required this.bookingId,
    required this.label,
    required this.icon,
    this.isCheckout = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final operationState = ref.watch(bookingOperationsProvider);

    return operationState.when(
      data: (_) => ElevatedButton.icon(
        onPressed: () async {
          // Show confirmation dialog
          final confirmed = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: Text(isCheckout ? 'Check Out Patient' : 'Check In Patient'),
              content: Text(
                isCheckout
                    ? 'Are you sure you want to check out this patient? Commission will be calculated automatically.'
                    : 'Are you sure you want to check in this patient?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Confirm'),
                ),
              ],
            ),
          );

          if (confirmed != true) return;

          // Perform check-in or check-out
          if (isCheckout) {
            await ref.read(bookingOperationsProvider.notifier).checkOut(bookingId, ref);
          } else {
            await ref.read(bookingOperationsProvider.notifier).checkIn(bookingId, ref);
          }

          // Show success message if still mounted
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isCheckout
                      ? 'Patient checked out successfully!'
                      : 'Patient checked in successfully!',
                ),
                backgroundColor: Colors.green,
              ),
            );

            // Refresh the booking detail
            ref.invalidate(bookingDetailProvider(bookingId));
          }
        },
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: isCheckout ? Colors.blue : Colors.green,
          foregroundColor: Colors.white,
        ),
        icon: Icon(icon),
        label: Text(label),
      ),
      loading: () => ElevatedButton.icon(
        onPressed: null,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        icon: const SizedBox(
          height: 20,
          width: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        label: Text(isCheckout ? 'Checking Out...' : 'Checking In...'),
      ),
      error: (error, stack) {
        // Show error in snackbar
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $error'),
              backgroundColor: Colors.red,
            ),
          );
          // Reset state
          ref.read(bookingOperationsProvider.notifier).reset();
        });

        return ElevatedButton.icon(
          onPressed: () async {
            if (isCheckout) {
              await ref.read(bookingOperationsProvider.notifier).checkOut(bookingId, ref);
            } else {
              await ref.read(bookingOperationsProvider.notifier).checkIn(bookingId, ref);
            }
          },
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.red,
          ),
          icon: const Icon(Icons.refresh),
          label: const Text('Retry'),
        );
      },
    );
  }
}
