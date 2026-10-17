import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/service.dart';
import '../../../shared/models/doctor.dart';
import '../../../services/api_service.dart';

class SlotSelectionScreen extends StatefulWidget {
  final Doctor doctor;
  final Service service;
  
  const SlotSelectionScreen({
    super.key,
    required this.doctor,
    required this.service,
  });

  @override
  State<SlotSelectionScreen> createState() => _SlotSelectionScreenState();
}

class _SlotSelectionScreenState extends State<SlotSelectionScreen> {
  final ApiService _apiService = ApiService();
  DateTime _selectedDate = DateTime.now();
  Map<String, dynamic>? _selectedSlot;
  
  bool _isLoadingSlots = false;
  List<dynamic> _availableSlots = [];
  String? _slotsError;

  @override
  void initState() {
    super.initState();
    _loadSlots();
  }

  Future<void> _loadSlots() async {
    setState(() {
      _isLoadingSlots = true;
      _slotsError = null;
    });

    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final slotsData = await _apiService.getSlots(
        doctorId: widget.doctor.id,
        date: formattedDate,
      );

      // The backend groups slots by date: { "slots": { "yyyy-MM-dd": [ {id, startTime, endTime, status}, ... ] } }
      final slotsByDate = slotsData['slots'] as Map<String, dynamic>? ?? {};
      final daySlots = (slotsByDate[formattedDate] as List<dynamic>? ?? [])
          .where((slot) => slot['status'] == 'AVAILABLE')
          .toList();

      if (!mounted) return;
      setState(() {
        _availableSlots = daySlots;
        _isLoadingSlots = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _slotsError = e.toString();
        _availableSlots = [];
        _isLoadingSlots = false;
      });
    }
  }

  String _formatSlotTime(String time) {
    try {
      final parsed = DateFormat('HH:mm').parse(time);
      return DateFormat('h:mm a').format(parsed);
    } catch (_) {
      return time;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Date & Time'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Booking progress indicator
          _buildProgressIndicator(),
          
          // Service summary card
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      widget.doctor.image?.isNotEmpty == true
                          ? CircleAvatar(
                              radius: 24,
                              backgroundColor: AppColors.surface,
                              child: ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl: widget.doctor.image!,
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => const CircularProgressIndicator(strokeWidth: 2),
                                  errorWidget: (context, url, error) {
                                    return Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: AppColors.clay.withValues(alpha: 0.1),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          widget.doctor.name[0].toUpperCase(),
                                          style: const TextStyle(
                                            color: AppColors.clay,
                                            fontSize: 18,
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
                              radius: 24,
                              backgroundColor: AppColors.clay.withValues(alpha: 0.1),
                              child: Text(
                                widget.doctor.name[0].toUpperCase(),
                                style: const TextStyle(
                                  color: AppColors.clay,
                                  fontSize: 18,
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
                              'Dr. ${widget.doctor.name}',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            Text(
                              widget.service.name,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '\$${widget.service.price}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.sage,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          // Date selector
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Select Date',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),
                _buildDateSelector(),
              ],
            ),
          ),
          
          // Time slots
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Time',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    if (_isLoadingSlots)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: CircularProgressIndicator(),
                        ),
                      )
                    else if (_slotsError != null)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            children: [
                              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                              const SizedBox(height: 16),
                              Text(
                                'Failed to load slots',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              ElevatedButton.icon(
                                onPressed: _loadSlots,
                                icon: const Icon(Icons.refresh),
                                label: const Text('Retry'),
                              ),
                            ],
                          ),
                        ),
                      )
                    else if (_availableSlots.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            children: [
                              const Icon(Icons.event_busy, size: 48, color: AppColors.textSecondary),
                              const SizedBox(height: 16),
                              Text(
                                'No available slots',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Please try another date',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      _buildTimeSlots(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _selectedSlot != null
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
                    context.push(
                      AppRoutes.bookingDetails,
                      extra: {
                        'doctor': widget.doctor,
                        'service': widget.service,
                        'selectedDate': _selectedDate,
                        'selectedTime': _formatSlotTime(_selectedSlot!['startTime'] as String? ?? ''),
                        'slotId': _selectedSlot!['id'],
                      },
                    );
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.clay,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Continue to Details'),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildProgressStep('1', 'Service', true),
            _buildProgressLine(true),
            _buildProgressStep('2', 'Date & Time', true),
            _buildProgressLine(false),
            _buildProgressStep('3', 'Details', false),
            _buildProgressLine(false),
            _buildProgressStep('4', 'Confirm', false),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressStep(String number, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive ? AppColors.clay : AppColors.surface,
            shape: BoxShape.circle,
            border: Border.all(
              color: isActive ? AppColors.clay : AppColors.border,
              width: 2,
            ),
          ),
          child: Center(
            child: Text(
              number,
              style: TextStyle(
                color: isActive ? Colors.white : AppColors.textSecondary,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: isActive ? AppColors.clay : AppColors.textSecondary,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressLine(bool isActive) {
    return Container(
      width: 40,
      height: 2,
      margin: const EdgeInsets.only(bottom: 20, left: 4, right: 4),
      color: isActive ? AppColors.clay : AppColors.border,
    );
  }

  Widget _buildDateSelector() {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.11,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 14,
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = _selectedDate.day == date.day &&
              _selectedDate.month == date.month &&
              _selectedDate.year == date.year;
          
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedDate = date;
                  _selectedSlot = null; // Reset selection when date changes
                });
                _loadSlots(); // Load slots for new date
              },
              child: Container(
                width: MediaQuery.of(context).size.width * 0.15,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.clay : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppColors.clay : AppColors.border,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      DateFormat('EEE').format(date),
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('d').format(date),
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      DateFormat('MMM').format(date),
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTimeSlots() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: _availableSlots.map<Widget>((slot) {
        final isSelected = _selectedSlot?['id'] == slot['id'];
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedSlot = slot;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.clay : AppColors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected ? AppColors.clay : AppColors.border,
              ),
            ),
            child: Text(
              _formatSlotTime(slot['startTime'] as String? ?? ''),
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
