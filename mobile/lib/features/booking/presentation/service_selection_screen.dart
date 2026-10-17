import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/doctor.dart';
import '../../../shared/models/service.dart';
import '../../../features/search/providers/doctor_provider.dart';

class ServiceSelectionScreen extends ConsumerStatefulWidget {
  final String doctorId;
  final String? slotId;
  final DateTime? preSelectedDate;
  final String? preSelectedTime;
  
  const ServiceSelectionScreen({
    super.key,
    required this.doctorId,
    this.slotId,
    this.preSelectedDate,
    this.preSelectedTime,
  });

  @override
  ConsumerState<ServiceSelectionScreen> createState() => _ServiceSelectionScreenState();
}

class _ServiceSelectionScreenState extends ConsumerState<ServiceSelectionScreen> {
  // null id is used to represent the "General Consultation" option, since
  // a real Service.id is never an empty string.
  String? _selectedServiceId;

  /// Doctor's configured services, plus a "General Consultation" option using
  /// the doctor's base price — matching the web dashboard's booking dropdown,
  /// which always offers general consultation alongside any custom services.
  List<Service> _servicesFor(Doctor doctor) {
    return [Service.general(doctor.price), ...doctor.services];
  }

  @override
  Widget build(BuildContext context) {
    // Use the doctor-by-id provider, since the doctors list endpoint does not
    // include each doctor's services, but the detail endpoint does.
    final doctorAsync = ref.watch(doctorByIdProvider(widget.doctorId));

    return doctorAsync.when(
      data: (doctor) {
        if (doctor == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Select Service')),
            body: const Center(child: Text('Doctor not found')),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('Select Service'),
          ),
          body: _buildBody(context, doctor),
          bottomNavigationBar: _selectedServiceId != null
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: FilledButton(
                      onPressed: () {
                        final service = _servicesFor(doctor).firstWhere(
                          (s) => s.id == _selectedServiceId,
                        );

                        if (widget.slotId != null &&
                            widget.preSelectedDate != null &&
                            widget.preSelectedTime != null) {
                          // Slot was already picked on the doctor detail screen
                          context.push(
                            AppRoutes.bookingDetails,
                            extra: {
                              'doctor': doctor,
                              'service': service,
                              'selectedDate': widget.preSelectedDate!,
                              'selectedTime': widget.preSelectedTime!,
                              'slotId': widget.slotId!,
                            },
                          );
                        } else {
                          // No slot pre-selected: let the user pick date & time
                          context.push(
                            AppRoutes.bookingSlot,
                            extra: {
                              'doctor': doctor,
                              'service': service,
                            },
                          );
                        }
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.clay,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Continue to Patient Details'),
                    ),
                  ),
                )
              : null,
        );
      },
      loading: () => Scaffold(
        appBar: AppBar(
          title: const Text('Select Service'),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.clay),
        ),
      ),
      error: (error, stack) => Scaffold(
        appBar: AppBar(
          title: const Text('Select Service'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(doctorByIdProvider(widget.doctorId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, Doctor doctor) {
    return Column(
        children: [
          // Doctor info card
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  doctor.image?.isNotEmpty == true
                      ? CircleAvatar(
                          radius: 32,
                          backgroundColor: AppColors.surface,
                          child: ClipOval(
                            child: CachedNetworkImage(
                              imageUrl: doctor.image!,
                              width: 64,
                              height: 64,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                width: 64,
                                height: 64,
                                color: AppColors.surface,
                                child: const Center(
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              ),
                              errorWidget: (context, url, error) {
                                return Container(
                                  width: 64,
                                  height: 64,
                                  decoration: BoxDecoration(
                                    color: AppColors.clay.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      doctor.name[0].toUpperCase(),
                                      style: const TextStyle(
                                        color: AppColors.clay,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        )
                      : CircleAvatar(
                          radius: 32,
                          backgroundColor: AppColors.clay.withValues(alpha: 0.1),
                          child: Text(
                            doctor.name[0].toUpperCase(),
                            style: const TextStyle(
                              color: AppColors.clay,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Dr. ${doctor.name}',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          doctor.specialization,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Services list
          Expanded(
            child: Builder(builder: (context) {
              final allServices = _servicesFor(doctor);
              return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: allServices.length,
              itemBuilder: (context, index) {
                final service = allServices[index];
                final isSelected = _selectedServiceId == service.id;
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () => setState(() => _selectedServiceId = service.id),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.clay : Colors.transparent,
                          width: 2,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Radio<String>(
                              value: service.id,
                              groupValue: _selectedServiceId,
                              onChanged: (value) {
                                setState(() => _selectedServiceId = value);
                              },
                              activeColor: AppColors.clay,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    service.name,
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    service.description ?? '',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: AppColors.textSecondary,
                                        ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.access_time,
                                        size: 16,
                                        color: AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${service.duration} mins',
                                        style: Theme.of(context).textTheme.bodySmall,
                                      ),
                                      const SizedBox(width: 16),
                                      Icon(
                                        Icons.attach_money,
                                        size: 16,
                                        color: AppColors.sage,
                                      ),
                                      Text(
                                        '\$${service.price}',
                                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                              color: AppColors.sage,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
              );
            }),
          ),
        ],
      );
  }
}
