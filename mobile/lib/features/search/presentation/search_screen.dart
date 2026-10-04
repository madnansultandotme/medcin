import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/doctor.dart';
import '../providers/doctor_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _selectedSpecialty = 'All';
  String _selectedExperience = 'All';
  double _minRating = 0.0;
  
  final List<String> _specialties = [
    'All',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'General Practice',
    'Orthopedics',
    'Dermatology',
  ];
  
  final List<String> _experienceLevels = [
    'All',
    '0-5 years',
    '5-10 years',
    '10+ years',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleRefresh() async {
    // Simulate refresh - in real app this would reload data from API
    await Future.delayed(const Duration(seconds: 1));
    // Invalidate providers to reload data
    ref.invalidate(doctorsProvider);
  }

  List<Doctor> _filterDoctors(List<Doctor> doctors) {
    return doctors.where((doctor) {
      // Search filter
      final searchQuery = _searchController.text.toLowerCase();
      final matchesSearch = searchQuery.isEmpty ||
          doctor.name.toLowerCase().contains(searchQuery) ||
          doctor.specialization.toLowerCase().contains(searchQuery);

      // Specialty filter
      final matchesSpecialty = _selectedSpecialty == 'All' ||
          doctor.specialization.toLowerCase().contains(_selectedSpecialty.toLowerCase());

      // Experience filter
      bool matchesExperience = true;
      if (_selectedExperience != 'All') {
        if (_selectedExperience == '0-5 years') {
          matchesExperience = doctor.experience <= 5;
        } else if (_selectedExperience == '5-10 years') {
          matchesExperience = doctor.experience > 5 && doctor.experience <= 10;
        } else if (_selectedExperience == '10+ years') {
          matchesExperience = doctor.experience > 10;
        }
      }

      // Rating filter
      final matchesRating = doctor.rating >= _minRating;

      return matchesSearch && matchesSpecialty && matchesExperience && matchesRating;
    }).toList();
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => StatefulBuilder(
          builder: (context, setModalState) => Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Filters',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    TextButton(
                      onPressed: () {
                        setModalState(() {
                          _selectedSpecialty = 'All';
                          _selectedExperience = 'All';
                          _minRating = 0.0;
                        });
                        setState(() {});
                      },
                      child: const Text('Reset'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Specialty filter
                    Text(
                      'Specialty',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _specialties.map((specialty) {
                        final isSelected = _selectedSpecialty == specialty;
                        return FilterChip(
                          label: Text(specialty),
                          selected: isSelected,
                          onSelected: (selected) {
                            setModalState(() {
                              _selectedSpecialty = specialty;
                            });
                            setState(() {});
                          },
                          selectedColor: AppColors.clay.withOpacity(0.2),
                          checkmarkColor: AppColors.clay,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                    
                    // Experience filter
                    Text(
                      'Experience',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _experienceLevels.map((level) {
                        final isSelected = _selectedExperience == level;
                        return FilterChip(
                          label: Text(level),
                          selected: isSelected,
                          onSelected: (selected) {
                            setModalState(() {
                              _selectedExperience = level;
                            });
                            setState(() {});
                          },
                          selectedColor: AppColors.sage.withOpacity(0.2),
                          checkmarkColor: AppColors.sage,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                    
                    // Rating filter
                    Text(
                      'Minimum Rating',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Slider(
                            value: _minRating,
                            min: 0.0,
                            max: 5.0,
                            divisions: 10,
                            label: _minRating.toStringAsFixed(1),
                            activeColor: AppColors.clay,
                            onChanged: (value) {
                              setModalState(() {
                                _minRating = value;
                              });
                              setState(() {});
                            },
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.clay.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star, size: 16, color: AppColors.warning),
                              const SizedBox(width: 4),
                              Text(
                                _minRating.toStringAsFixed(1),
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
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
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppColors.border)),
                ),
                child: FilledButton(
                  onPressed: () => Navigator.pop(context),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.clay,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Apply Filters'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final doctors = ref.watch(doctorsProvider);
    final filteredDoctors = _filterDoctors(doctors);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Doctors'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by name or specialty...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                          });
                        },
                      )
                    : null,
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),
          
          // Active filters
          if (_selectedSpecialty != 'All' ||
              _selectedExperience != 'All' ||
              _minRating > 0)
            Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  if (_selectedSpecialty != 'All')
                    _buildFilterChip(
                      _selectedSpecialty,
                      () => setState(() => _selectedSpecialty = 'All'),
                    ),
                  if (_selectedExperience != 'All')
                    _buildFilterChip(
                      _selectedExperience,
                      () => setState(() => _selectedExperience = 'All'),
                    ),
                  if (_minRating > 0)
                    _buildFilterChip(
                      'Rating ${_minRating.toStringAsFixed(1)}+',
                      () => setState(() => _minRating = 0.0),
                    ),
                ],
              ),
            ),
          
          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${filteredDoctors.length} doctor${filteredDoctors.length != 1 ? 's' : ''} found',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ),
          ),
          
          // Doctors list
          Expanded(
            child: filteredDoctors.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 64,
                          color: AppColors.textSecondary.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No doctors found',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Try adjusting your filters',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _handleRefresh,
                    color: AppColors.clay,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredDoctors.length,
                      itemBuilder: (context, index) {
                        final doctor = filteredDoctors[index];
                        return _buildDoctorCard(doctor);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onRemove) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Chip(
        label: Text(label),
        deleteIcon: const Icon(Icons.close, size: 18),
        onDeleted: onRemove,
        backgroundColor: AppColors.clay.withOpacity(0.1),
        deleteIconColor: AppColors.clay,
      ),
    );
  }

  Widget _buildDoctorCard(Doctor doctor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
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
