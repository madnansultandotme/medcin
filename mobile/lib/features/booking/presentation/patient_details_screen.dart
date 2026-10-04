import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/service.dart';
import '../../../shared/models/doctor.dart';
import '../../../features/auth/providers/auth_provider.dart';
import 'booking_confirmation_screen.dart';

class PatientDetailsScreen extends ConsumerStatefulWidget {
  final Doctor doctor;
  final Service service;
  final DateTime selectedDate;
  final String selectedTime;
  
  const PatientDetailsScreen({
    super.key,
    required this.doctor,
    required this.service,
    required this.selectedDate,
    required this.selectedTime,
  });

  @override
  ConsumerState<PatientDetailsScreen> createState() => _PatientDetailsScreenState();
}

class _PatientDetailsScreenState extends ConsumerState<PatientDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _notesController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    // Pre-fill with user data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authStateProvider);
      final user = authState.user;
      if (user != null) {
        _nameController.text = user.name;
        _emailController.text = user.email;
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patient Details'),
      ),
      body: Column(
        children: [
          // Progress indicator
          _buildProgressIndicator(),
          
          // Form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Appointment summary
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.calendar_today, size: 16, color: AppColors.clay),
                                const SizedBox(width: 8),
                                Text(
                                  DateFormat('EEE, MMM d, yyyy').format(widget.selectedDate),
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(width: 16),
                                const Icon(Icons.access_time, size: 16, color: AppColors.clay),
                                const SizedBox(width: 8),
                                Text(
                                  widget.selectedTime,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                            const Divider(height: 24),
                            Row(
                              children: [
                                // Doctor image
                                widget.doctor.image != null && widget.doctor.image!.isNotEmpty
                                    ? CircleAvatar(
                                        radius: 24,
                                        backgroundColor: AppColors.surface,
                                        child: ClipOval(
                                          child: CachedNetworkImage(
                                            imageUrl: widget.doctor.image!,
                                            fit: BoxFit.cover,
                                            width: 48,
                                            height: 48,
                                            placeholder: (context, url) => const CircularProgressIndicator(strokeWidth: 2),
                                            errorWidget: (context, url, error) => const Icon(Icons.person, size: 24),
                                          ),
                                        ),
                                      )
                                    : const CircleAvatar(
                                        radius: 24,
                                        backgroundColor: AppColors.surface,
                                        child: Icon(Icons.person, size: 24, color: AppColors.clay),
                                      ),
                                const SizedBox(width: 12),
                                // Doctor info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Dr. ${widget.doctor.name}',
                                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Text(
                                        widget.service.name,
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: AppColors.textSecondary,
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
                    const SizedBox(height: 24),
                    
                    // Patient information
                    Text(
                      'Patient Information',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Full Name',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    IntlPhoneField(
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        border: OutlineInputBorder(),
                      ),
                      initialCountryCode: 'SG',
                      onChanged: (phone) {
                        _phoneController.text = phone.completeNumber;
                      },
                      validator: (phone) {
                        if (phone == null || phone.completeNumber.isEmpty) {
                          return 'Please enter your phone number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    
                    // Special requests
                    Text(
                      'Special Requests or Notes (Optional)',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    
                    TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        hintText: 'Any special requests or medical information we should know...',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 4,
                      maxLength: 500,
                    ),
                    const SizedBox(height: 16),
                    
                    // Info card
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.clay.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, size: 20, color: AppColors.clay),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Your information will be shared with the doctor for appointment preparation.',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.clay,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
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
              if (_formKey.currentState!.validate()) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => BookingConfirmationScreen(
                      doctor: widget.doctor,
                      service: widget.service,
                      selectedDate: widget.selectedDate,
                      selectedTime: widget.selectedTime,
                      patientName: _nameController.text,
                      patientEmail: _emailController.text,
                      patientPhone: _phoneController.text,
                      notes: _notesController.text,
                    ),
                  ),
                );
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.clay,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Review Booking'),
          ),
        ),
      ),
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
            _buildProgressLine(true),
            _buildProgressStep('3', 'Details', true),
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
}
