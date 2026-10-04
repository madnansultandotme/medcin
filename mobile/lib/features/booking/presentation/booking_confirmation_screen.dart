import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:math';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/theme/app_colors.dart';
import '../../../shared/models/service.dart';
import '../../../shared/models/doctor.dart';
import 'booking_success_screen.dart';

class BookingConfirmationScreen extends StatefulWidget {
  final Doctor doctor;
  final Service service;
  final DateTime selectedDate;
  final String selectedTime;
  final String patientName;
  final String patientEmail;
  final String patientPhone;
  final String notes;
  
  const BookingConfirmationScreen({
    super.key,
    required this.doctor,
    required this.service,
    required this.selectedDate,
    required this.selectedTime,
    required this.patientName,
    required this.patientEmail,
    required this.patientPhone,
    required this.notes,
  });

  @override
  State<BookingConfirmationScreen> createState() => _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends State<BookingConfirmationScreen> {
  bool _acceptedTerms = false;
  bool _isBooking = false;

  String _generateBookingReference() {
    final random = Random();
    final number = random.nextInt(90000) + 10000;
    return 'MED-SG-$number';
  }

  Future<void> _confirmBooking() async {
    if (!_acceptedTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the terms and conditions'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isBooking = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isBooking = false);
      
      final bookingRef = _generateBookingReference();
      
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => BookingSuccessScreen(
            bookingReference: bookingRef,
            doctor: widget.doctor,
            service: widget.service,
            selectedDate: widget.selectedDate,
            selectedTime: widget.selectedTime,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Booking'),
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Progress indicator
              _buildProgressIndicator(),
              
              // Scrollable content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Review Your Appointment',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Doctor & Service Card
                      _buildSummaryCard(
                        title: 'Doctor & Service',
                        icon: Icons.medical_services,
                        children: [
                          // Doctor image and info row
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                widget.doctor.image != null && widget.doctor.image!.isNotEmpty
                                    ? CircleAvatar(
                                        radius: 28,
                                        backgroundColor: AppColors.surface,
                                        child: ClipOval(
                                          child: CachedNetworkImage(
                                            imageUrl: widget.doctor.image!,
                                            fit: BoxFit.cover,
                                            width: 56,
                                            height: 56,
                                            placeholder: (context, url) => const CircularProgressIndicator(strokeWidth: 2),
                                            errorWidget: (context, url, error) => const Icon(Icons.person, size: 28),
                                          ),
                                        ),
                                      )
                                    : const CircleAvatar(
                                        radius: 28,
                                        backgroundColor: AppColors.surface,
                                        child: Icon(Icons.person, size: 28, color: AppColors.clay),
                                      ),
                                const SizedBox(width: 12),
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
                                        widget.doctor.specialization,
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
                          const Divider(),
                          _buildInfoRow('Service', widget.service.name),
                          _buildInfoRow('Duration', '${widget.service.duration} minutes'),
                        ],
                      ),
                      
                      // Date & Time Card
                      _buildSummaryCard(
                        title: 'Date & Time',
                        icon: Icons.calendar_today,
                        children: [
                          _buildInfoRow(
                            'Date',
                            DateFormat('EEEE, MMMM d, yyyy').format(widget.selectedDate),
                          ),
                          _buildInfoRow('Time', widget.selectedTime),
                        ],
                      ),
                      
                      // Clinic Card
                      _buildSummaryCard(
                        title: 'Clinic Location',
                        icon: Icons.location_on,
                        children: [
                          _buildInfoRow('Clinic', widget.doctor.clinic),
                          _buildInfoRow('Address', widget.doctor.location),
                          const SizedBox(height: 8),
                          TextButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Opening maps...'),
                                  backgroundColor: AppColors.clay,
                                ),
                              );
                            },
                            icon: const Icon(Icons.directions, size: 18),
                            label: const Text('Get Directions'),
                          ),
                        ],
                      ),
                      
                      // Patient Info Card
                      _buildSummaryCard(
                        title: 'Patient Information',
                        icon: Icons.person,
                        children: [
                          _buildInfoRow('Name', widget.patientName),
                          _buildInfoRow('Email', widget.patientEmail),
                          _buildInfoRow('Phone', widget.patientPhone),
                          if (widget.notes.isNotEmpty) ...[
                            const Divider(),
                            _buildInfoRow('Notes', widget.notes),
                          ],
                        ],
                      ),
                      
                      // Payment Card
                      _buildSummaryCard(
                        title: 'Payment',
                        icon: Icons.attach_money,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total Amount',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Text(
                                '\$${widget.service.price}',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      color: AppColors.sage,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          _buildInfoRow('Payment Method', 'Pay at Clinic'),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Terms and conditions
                      CheckboxListTile(
                        value: _acceptedTerms,
                        onChanged: (value) {
                          setState(() => _acceptedTerms = value ?? false);
                        },
                        controlAffinity: ListTileControlAffinity.leading,
                        activeColor: AppColors.clay,
                        title: RichText(
                          text: TextSpan(
                            style: Theme.of(context).textTheme.bodyMedium,
                            children: [
                              const TextSpan(text: 'I accept the '),
                              TextSpan(
                                text: 'Terms & Conditions',
                                style: const TextStyle(
                                  color: AppColors.clay,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const TextSpan(text: ' and '),
                              TextSpan(
                                text: 'Cancellation Policy',
                                style: const TextStyle(
                                  color: AppColors.clay,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        contentPadding: EdgeInsets.zero,
                      ),
                      
                      const SizedBox(height: 100), // Space for bottom button
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          // Loading overlay
          if (_isBooking)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: Card(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('Confirming your appointment...'),
                      ],
                    ),
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
            onPressed: _isBooking ? null : _confirmBooking,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.clay,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('Confirm Appointment'),
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
            _buildProgressLine(true),
            _buildProgressStep('4', 'Confirm', true),
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

  Widget _buildSummaryCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppColors.clay, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
