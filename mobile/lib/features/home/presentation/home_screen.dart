import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../search/providers/doctor_provider.dart';
import '../../../shared/models/doctor.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  Future<void> _handleRefresh() async {
    // Simulate refresh - in real app this would reload data from API
    await Future.delayed(const Duration(seconds: 1));
    // Invalidate providers to reload data
    ref.invalidate(doctorsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final doctors = ref.watch(doctorsProvider);
    
    final userName = authState.user?.name ?? 'Guest';

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: AppColors.clay,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(context, userName),
                
                // Search bar
                _buildSearchBar(context),
                
                // Categories
                _buildCategories(context),
                
                // Featured Doctors
                _buildFeaturedDoctors(context, doctors),
                
                // Quick Actions
                _buildQuickActions(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String userName) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, $userName 👋',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'How can we help you today?',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {
                  // Navigate to profile screen
                  context.go(AppRoutes.profile);
                },
                child: CircleAvatar(
                  radius: MediaQuery.of(context).size.width * 0.06,
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.person,
                    color: AppColors.clay,
                    size: MediaQuery.of(context).size.width * 0.075,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: GestureDetector(
        onTap: () => context.go(AppRoutes.search),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppColors.textSecondary),
              const SizedBox(width: 12),
              Text(
                'Search doctors, specialties...',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategories(BuildContext context) {
    final categories = [
      _CategoryItem(Icons.favorite, 'Cardiology', AppColors.clay),
      _CategoryItem(Icons.psychology, 'Neurology', AppColors.sage),
      _CategoryItem(Icons.child_care, 'Pediatrics', AppColors.amber),
      _CategoryItem(Icons.healing, 'General', AppColors.clay),
      _CategoryItem(Icons.visibility, 'Ophthalmology', AppColors.sage),
      _CategoryItem(Icons.face, 'Dermatology', AppColors.amber),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'Specialties',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.13,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: GestureDetector(
                  onTap: () => context.go(AppRoutes.search),
                  child: Container(
                    width: 80,
                    decoration: BoxDecoration(
                      color: category.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          category.icon,
                          color: category.color,
                          size: 32,
                        ),
                        const SizedBox(height: 8),
                          Text(
                            category.name,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedDoctors(BuildContext context, List<Doctor> doctors) {
    final featuredDoctors = doctors.take(3).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Featured Doctors',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              TextButton(
                onPressed: () => context.go(AppRoutes.search),
                child: const Text('See All'),
              ),
            ],
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24),
          itemCount: featuredDoctors.length,
          itemBuilder: (context, index) {
            final doctor = featuredDoctors[index];
            return _buildDoctorCard(context, doctor);
          },
        ),
      ],
    );
  }

  Widget _buildDoctorCard(BuildContext context, Doctor doctor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => context.go(AppRoutes.doctorDetailWithId(doctor.id)),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Doctor image or initials
              ClipRRect(
                borderRadius: BorderRadius.circular(32),
                child: doctor.image != null && doctor.image!.isNotEmpty
                    ? CachedNetworkImage(
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
                          return _buildInitialsAvatar(doctor);
                        },
                      )
                    : _buildInitialsAvatar(doctor),
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
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 16, color: AppColors.warning),
                        const SizedBox(width: 4),
                        Text(
                          doctor.rating.toString(),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(width: 16),
                        const Icon(Icons.access_time, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          '${doctor.experience} years',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  context,
                  'My Appointments',
                  Icons.calendar_today,
                  AppColors.clay,
                  () => context.go(AppRoutes.appointments),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildActionCard(
                  context,
                  'Find Doctors',
                  Icons.search,
                  AppColors.sage,
                  () => context.go(AppRoutes.search),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildInitialsAvatar(Doctor doctor) {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: AppColors.clay.withOpacity(0.1),
        borderRadius: BorderRadius.circular(32),
      ),
      child: Center(
        child: Text(
          doctor.initials,
          style: const TextStyle(
            color: AppColors.clay,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

class _CategoryItem {
  final IconData icon;
  final String name;
  final Color color;

  _CategoryItem(this.icon, this.name, this.color);
}
