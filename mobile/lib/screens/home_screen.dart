import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Medcin'),
            centerTitle: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () async {
                  await authProvider.signOut();
                  if (!context.mounted) return;
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
                tooltip: 'Sign Out',
              ),
            ],
          ),
          body: user == null
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () async {
                    // Could refresh user data here
                    await Future.delayed(const Duration(seconds: 1));
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      // Welcome Card
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 30,
                                    backgroundColor:
                                        Theme.of(context).primaryColor,
                                    child: Text(
                                      user.name[0].toUpperCase(),
                                      style: const TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Welcome back,',
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          user.name,
                                          style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Divider(color: Colors.grey[300]),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Icon(Icons.email_outlined,
                                      size: 20, color: Colors.grey[600]),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      user.email,
                                      style: TextStyle(
                                        color: Colors.grey[700],
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.badge_outlined,
                                      size: 20, color: Colors.grey[600]),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Role: ${user.role}',
                                    style: TextStyle(
                                      color: Colors.grey[700],
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Quick Actions
                      Text(
                        'Quick Actions',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),

                      if (user.role == 'patient') ...[
                        _buildActionCard(
                          context,
                          icon: Icons.search,
                          title: 'Find Doctors',
                          subtitle: 'Browse available doctors',
                          color: Colors.blue,
                          onTap: () {
                            // Navigate to doctors list
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Doctors feature coming soon')),
                            );
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildActionCard(
                          context,
                          icon: Icons.calendar_today,
                          title: 'My Bookings',
                          subtitle: 'View your appointments',
                          color: Colors.green,
                          onTap: () {
                            // Navigate to bookings
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Bookings feature coming soon')),
                            );
                          },
                        ),
                      ],

                      if (user.role == 'center') ...[
                        _buildActionCard(
                          context,
                          icon: Icons.person_add,
                          title: 'Manage Doctors',
                          subtitle: 'Add or edit doctors',
                          color: Colors.purple,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content:
                                      Text('Doctor management coming soon')),
                            );
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildActionCard(
                          context,
                          icon: Icons.schedule,
                          title: 'Manage Slots',
                          subtitle: 'Configure availability',
                          color: Colors.orange,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Slots feature coming soon')),
                            );
                          },
                        ),
                      ],

                      if (user.role == 'admin') ...[
                        _buildActionCard(
                          context,
                          icon: Icons.business,
                          title: 'Manage Centers',
                          subtitle: 'Approve and monitor centers',
                          color: Colors.indigo,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content:
                                      Text('Center management coming soon')),
                            );
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildActionCard(
                          context,
                          icon: Icons.gavel,
                          title: 'Handle Disputes',
                          subtitle: 'Review and resolve issues',
                          color: Colors.red,
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Disputes feature coming soon')),
                            );
                          },
                        ),
                      ],
                    ],
                  ),
                ),
        );
      },
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios,
                  size: 16, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}
