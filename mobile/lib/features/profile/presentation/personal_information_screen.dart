import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

class PersonalInformationScreen extends ConsumerStatefulWidget {
  const PersonalInformationScreen({super.key});

  @override
  ConsumerState<PersonalInformationScreen> createState() => _PersonalInformationScreenState();
}

class _PersonalInformationScreenState extends ConsumerState<PersonalInformationScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _emergencyContactController;
  late TextEditingController _emergencyPhoneController;
  
  String _bloodGroup = 'O+';
  String _gender = 'Male';
  DateTime _dateOfBirth = DateTime(1990, 1, 1);
  bool _isEditing = false;

  final List<String> _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  final List<String> _genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authStateProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: '+65 9123 4567');
    _addressController = TextEditingController(text: '123 Healthcare St, Singapore 123456');
    _emergencyContactController = TextEditingController(text: 'Jane Doe');
    _emergencyPhoneController = TextEditingController(text: '+65 9876 5432');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _emergencyContactController.dispose();
    _emergencyPhoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal Information'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Basic Information Section
              _buildSectionTitle('Basic Information'),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _nameController,
                enabled: _isEditing,
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
                enabled: _isEditing,
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
                enabled: _isEditing,
                initialCountryCode: 'SG',
                onChanged: (phone) {
                  // Phone number is automatically formatted
                },
              ),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _gender,
                decoration: const InputDecoration(
                  labelText: 'Gender',
                  prefixIcon: Icon(Icons.wc_outlined),
                ),
                items: _genders.map((gender) {
                  return DropdownMenuItem(value: gender, child: Text(gender));
                }).toList(),
                onChanged: _isEditing ? (value) {
                  if (value != null) setState(() => _gender = value);
                } : null,
              ),
              const SizedBox(height: 16),
              
              InkWell(
                onTap: _isEditing ? () => _selectDate(context) : null,
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Date of Birth',
                    prefixIcon: Icon(Icons.calendar_today_outlined),
                  ),
                  child: Text(
                    '${_dateOfBirth.day}/${_dateOfBirth.month}/${_dateOfBirth.year}',
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Medical Information Section
              _buildSectionTitle('Medical Information'),
              const SizedBox(height: 16),
              
              DropdownButtonFormField<String>(
                value: _bloodGroup,
                decoration: const InputDecoration(
                  labelText: 'Blood Group',
                  prefixIcon: Icon(Icons.bloodtype_outlined),
                ),
                items: _bloodGroups.map((group) {
                  return DropdownMenuItem(value: group, child: Text(group));
                }).toList(),
                onChanged: _isEditing ? (value) {
                  if (value != null) setState(() => _bloodGroup = value);
                } : null,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                initialValue: 'None',
                enabled: _isEditing,
                decoration: const InputDecoration(
                  labelText: 'Allergies',
                  prefixIcon: Icon(Icons.warning_amber_outlined),
                  hintText: 'e.g., Penicillin, Peanuts',
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              
              // Contact Information Section
              _buildSectionTitle('Address'),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _addressController,
                enabled: _isEditing,
                decoration: const InputDecoration(
                  labelText: 'Home Address',
                  prefixIcon: Icon(Icons.home_outlined),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              
              // Emergency Contact Section
              _buildSectionTitle('Emergency Contact'),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _emergencyContactController,
                enabled: _isEditing,
                decoration: const InputDecoration(
                  labelText: 'Contact Name',
                  prefixIcon: Icon(Icons.emergency_outlined),
                ),
              ),
              const SizedBox(height: 16),
              
              IntlPhoneField(
                decoration: const InputDecoration(
                  labelText: 'Contact Phone',
                  border: OutlineInputBorder(),
                ),
                enabled: _isEditing,
                initialCountryCode: 'SG',
                onChanged: (phone) {
                  // Phone number is automatically formatted
                },
              ),
              const SizedBox(height: 32),
              
              // Save/Cancel buttons
              if (_isEditing)
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          setState(() => _isEditing = false);
                          // Reset form
                          final user = ref.read(authStateProvider).user;
                          _nameController.text = user?.name ?? '';
                          _emailController.text = user?.email ?? '';
                        },
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: FilledButton(
                        onPressed: _saveChanges,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.clay,
                        ),
                        child: const Text('Save Changes'),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _dateOfBirth) {
      setState(() => _dateOfBirth = picked);
    }
  }

  void _saveChanges() {
    if (_formKey.currentState!.validate()) {
      setState(() => _isEditing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Changes saved successfully'),
          backgroundColor: AppColors.sage,
        ),
      );
    }
  }
}
