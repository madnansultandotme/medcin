import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../services/api_service.dart';
import '../../search/providers/doctor_provider.dart';

class DoctorDetailScreen extends ConsumerStatefulWidget {
  final String doctorId;
  
  const DoctorDetailScreen({super.key, required this.doctorId});

  @override
  ConsumerState<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends ConsumerState<DoctorDetailScreen> {
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
      _selectedSlot = null;
    });

    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final data = await _apiService.getSlots(
        doctorId: widget.doctorId,
        date: formattedDate,
      );

      // The backend groups slots by date: { "slots": { "yyyy-MM-dd": [ {id, startTime, endTime, status}, ... ] } }
      final slotsByDate = data['slots'] as Map<String, dynamic>? ?? {};
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
    final doctorsAsync = ref.watch(doctorsProvider);

    return doctorsAsync.when(
      data: (doctors) {
        final doctor = doctors.firstWhere(
          (d) => d.id == widget.doctorId,
          orElse: () => doctors.first,
        );

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              // App bar with doctor image
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => context.pop(),
                ),
                backgroundColor: AppColors.clay,
                iconTheme: const IconThemeData(color: Colors.white),
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                    ),
                    child: Center(
                      child: doctor.image != null && doctor.image!.isNotEmpty
                          ? CircleAvatar(
                              radius: 60,
                              backgroundColor: Colors.white,
                              child: ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl: doctor.image!,
                                  width: 120,
                                  height: 120,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    width: 120,
                                    height: 120,
                                    color: Colors.white,
                                    child: const Center(
                                      child: CircularProgressIndicator(strokeWidth: 3),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) {
                                    return Container(
                                      width: 120,
                                      height: 120,
                                      color: Colors.white,
                                      child: Center(
                                        child: Text(
                                          doctor.name[0].toUpperCase(),
                                          style: const TextStyle(
                                            color: AppColors.clay,
                                            fontSize: 48,
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
                              radius: 60,
                              backgroundColor: Colors.white,
                              child: Text(
                                doctor.name[0].toUpperCase(),
                                style: const TextStyle(
                                  color: AppColors.clay,
                                  fontSize: 48,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                    ),
                  ),
                ),
              ),
              
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Doctor info
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dr. ${doctor.name}',
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            doctor.specialization,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _buildInfoChip(
                                Icons.star,
                                '${doctor.rating}',
                                AppColors.warning,
                              ),
                              const SizedBox(width: 12),
                              _buildInfoChip(
                                Icons.access_time,
                                '${doctor.experience} years',
                                AppColors.clay,
                              ),
                              const SizedBox(width: 12),
                              _buildInfoChip(
                                Icons.attach_money,
                                '\$${doctor.consultationFee}',
                                AppColors.sage,
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          
                          // About
                          Text(
                            'About',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            doctor.bio ?? '',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                  height: 1.5,
                                ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Working hours
                          Text(
                            'Working Hours',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            doctor.availability,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Select appointment date
                          Text(
                            'Select Appointment Date',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 16),
                          _buildDateSelector(),
                          const SizedBox(height: 24),
                          
                          // Available time slots
                          Text(
                            'Available Time Slots',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 16),
                          _buildTimeSlots(),
                          const SizedBox(height: 100), // Space for bottom button
                        ],
                      ),
                    ),
                  ],
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
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: FilledButton(
                      onPressed: () => _showBookingConfirmation(context),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.clay,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Book Appointment'),
                    ),
                  ),
                )
              : null,
        );
      },
      loading: () => Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.clay),
        ),
      ),
      error: (error, stack) => Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error loading doctor details: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(doctorsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.11,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 7,
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final isSelected = _selectedDate.day == date.day &&
              _selectedDate.month == date.month;
          
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedDate = date;
                });
                _loadSlots();
              },
              child: Container(
                width: MediaQuery.of(context).size.width * 0.15,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.clay
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.clay
                        : AppColors.border,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      DateFormat('EEE').format(date),
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : AppColors.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('d').format(date),
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : AppColors.textPrimary,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      DateFormat('MMM').format(date),
                      style: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : AppColors.textSecondary,
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
    if (_isLoadingSlots) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: CircularProgressIndicator(color: AppColors.clay),
        ),
      );
    }

    if (_slotsError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Icon(Icons.error_outline, size: 40, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                'Failed to load available slots',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: _loadSlots,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_availableSlots.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.event_busy, size: 40, color: AppColors.textSecondary),
              const SizedBox(height: 12),
              Text(
                'No available slots for this date',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
        ),
      );
    }

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: _availableSlots.map((slot) {
        final isSelected = _selectedSlot?['id'] == slot['id'];
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedSlot = slot as Map<String, dynamic>;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.clay
                  : AppColors.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSelected
                    ? AppColors.clay
                    : AppColors.border,
              ),
            ),
            child: Center(
              child: Text(
                _formatSlotTime(slot['startTime'] as String? ?? ''),
                style: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : AppColors.textPrimary,
                  fontWeight: isSelected
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  void _showBookingConfirmation(BuildContext context) {
    if (_selectedSlot == null) return;

    // Navigate to service selection, carrying the real slot selected from the backend
    context.push(
      AppRoutes.bookingService,
      extra: {
        'doctorId': widget.doctorId,
        'slotId': _selectedSlot!['id'],
        'preSelectedDate': _selectedDate,
        'preSelectedTime': _formatSlotTime(_selectedSlot!['startTime'] as String? ?? ''),
      },
    );
  }
}
