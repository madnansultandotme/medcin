import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../services/api_service.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();
  
  bool _isLoading = true;
  String? _error;
  List<dynamic> _upcomingBookings = [];
  List<dynamic> _completedBookings = [];
  List<dynamic> _cancelledBookings = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadBookings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final bookings = await _apiService.getBookings();
      
      setState(() {
        _upcomingBookings = bookings.where((b) => 
          b['status'] == 'PENDING' || b['status'] == 'CONFIRMED'
        ).toList();
        
        _completedBookings = bookings.where((b) => 
          b['status'] == 'COMPLETED'
        ).toList();
        
        _cancelledBookings = bookings.where((b) => 
          b['status'] == 'CANCELLED'
        ).toList();
        
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Appointments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Upcoming (${_upcomingBookings.length})'),
            Tab(text: 'Completed (${_completedBookings.length})'),
            Tab(text: 'Cancelled (${_cancelledBookings.length})'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBookings,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text(
                        'Failed to load appointments',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: Theme.of(context).textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _loadBookings,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadBookings,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildBookingsList(_upcomingBookings, 'upcoming'),
                      _buildBookingsList(_completedBookings, 'completed'),
                      _buildBookingsList(_cancelledBookings, 'cancelled'),
                    ],
                  ),
                ),
    );
  }

  Widget _buildBookingsList(List<dynamic> bookings, String type) {
    if (bookings.isEmpty) {
      return _buildEmptyState(type);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        final booking = bookings[index];
        return _buildBookingCard(booking, type);
      },
    );
  }

  Widget _buildEmptyState(String type) {
    IconData icon;
    String title;
    String subtitle;

    switch (type) {
      case 'upcoming':
        icon = Icons.calendar_today;
        title = 'No Upcoming Appointments';
        subtitle = 'Your upcoming appointments will appear here';
        break;
      case 'completed':
        icon = Icons.check_circle_outline;
        title = 'No Completed Appointments';
        subtitle = 'Your appointment history will appear here';
        break;
      case 'cancelled':
        icon = Icons.cancel_outlined;
        title = 'No Cancelled Appointments';
        subtitle = 'Your cancelled appointments will appear here';
        break;
      default:
        icon = Icons.info_outline;
        title = 'No Appointments';
        subtitle = 'No appointments found';
    }

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

  Widget _buildBookingCard(Map<String, dynamic> booking, String type) {
    final doctor = booking['doctor'];
    final center = booking['center'];
    final status = booking['status'];
    
    Color statusColor;
    Color statusBgColor;
    IconData statusIcon;
    
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        statusColor = AppColors.clay;
        statusBgColor = AppColors.clay.withOpacity(0.1);
        statusIcon = Icons.schedule;
        break;
      case 'COMPLETED':
        statusColor = AppColors.success;
        statusBgColor = AppColors.success.withOpacity(0.1);
        statusIcon = Icons.check_circle;
        break;
      case 'CANCELLED':
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
      child: InkWell(
        onTap: () => _showBookingDetails(booking),
        borderRadius: BorderRadius.circular(12),
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
                    backgroundImage: doctor?['imageUrl'] != null 
                      ? NetworkImage(doctor['imageUrl'])
                      : null,
                    child: doctor?['imageUrl'] == null
                      ? Text(
                          (doctor?['name'] ?? 'D')[0].toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.clay,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          doctor?['name'] ?? 'Unknown Doctor',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          doctor?['category'] ?? doctor?['role'] ?? 'Medical Professional',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                        if (center != null) ...[
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 12, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  center['name'],
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 14, color: statusColor),
                        const SizedBox(width: 4),
                        Text(
                          _formatStatus(status),
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
                    _formatDate(booking['date']),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(width: 24),
                  const Icon(Icons.access_time, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(
                    booking['time'] ?? '',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              if (booking['price'] != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.payments_outlined, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    Text(
                      '\$${booking['price'].toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const Spacer(),
                    Text(
                      booking['paymentMethod'] ?? 'Pay at Clinic',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ],
              if (type == 'upcoming' && status != 'CANCELLED') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _cancelAppointment(booking),
                        icon: const Icon(Icons.cancel_outlined, size: 18),
                        label: const Text('Cancel'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          side: const BorderSide(color: AppColors.error),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatStatus(String status) {
    return status[0] + status.substring(1).toLowerCase();
  }

  String _formatDate(String date) {
    try {
      final dateTime = DateTime.parse(date);
      return DateFormat('MMM d, yyyy').format(dateTime);
    } catch (e) {
      return date;
    }
  }

  void _showBookingDetails(Map<String, dynamic> booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            padding: const EdgeInsets.all(24),
            child: ListView(
              controller: scrollController,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Booking Details',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 16),
                _buildDetailRow('Reference', booking['reference']),
                _buildDetailRow('Status', _formatStatus(booking['status'])),
                _buildDetailRow('Date', _formatDate(booking['date'])),
                _buildDetailRow('Time', booking['time']),
                _buildDetailRow('Price', '\$${booking['price'].toStringAsFixed(2)}'),
                if (booking['patientNotes'] != null)
                  _buildDetailRow('Notes', booking['patientNotes']),
                if (booking['cancellationReason'] != null)
                  _buildDetailRow('Cancellation Reason', booking['cancellationReason']),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? 'N/A',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelAppointment(Map<String, dynamic> booking) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: Text(
          'Are you sure you want to cancel your appointment with ${booking['doctor']?['name']}?'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _apiService.cancelBooking(
        bookingId: booking['id'],
        cancellationReason: 'Cancelled by patient',
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Appointment cancelled successfully'),
          backgroundColor: AppColors.success,
        ),
      );

      // Reload bookings
      await _loadBookings();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to cancel: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
