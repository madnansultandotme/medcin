import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/service.dart';
import '../../../shared/models/doctor.dart';
import '../../../features/search/providers/doctor_provider.dart';
import 'slot_selection_screen.dart';

class ServiceSelectionScreen extends ConsumerStatefulWidget {
  final String doctorId;
  
  const ServiceSelectionScreen({super.key, required this.doctorId});

  @override
  ConsumerState<ServiceSelectionScreen> createState() => _ServiceSelectionScreenState();
}

class _ServiceSelectionScreenState extends ConsumerState<ServiceSelectionScreen> {
  String? _selectedServiceId;

  @override
  Widget build(BuildContext context) {
    final doctors = ref.watch(doctorsProvider);
    final doctor = doctors.firstWhere(
      (d) => d.id == widget.doctorId,
      orElse: () => doctors.first,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Service'),
      ),
      body: Column(
        children: [
          // Doctor info card
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppColors.clay.withOpacity(0.1),
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
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: doctor.services.length,
              itemBuilder: (context, index) {
                final service = doctor.services[index];
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
            ),
          ),
        ],
      ),
      bottomNavigationBar: _selectedServiceId != null
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: SafeArea(
                child: FilledButton(
                  onPressed: () {
                    final service = doctor.services.firstWhere(
                      (s) => s.id == _selectedServiceId,
                    );
                    
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => SlotSelectionScreen(
                          doctor: doctor,
                          service: service,
                        ),
                      ),
                    );
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.clay,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Continue to Date Selection'),
                ),
              ),
            )
          : null,
    );
  }
}
