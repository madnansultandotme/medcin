import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/router/app_routes.dart';

/// Main shell with bottom navigation for authenticated screens
class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({
    super.key,
    required this.child,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  void _onTap(int index) {
    setState(() => _currentIndex = index);
    
    switch (index) {
      case 0:
        context.go(AppRoutes.home);
        break;
      case 1:
        context.go(AppRoutes.search);
        break;
      case 2:
        context.go(AppRoutes.appointments);
        break;
      case 3:
        context.go(AppRoutes.profile);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get current route to sync bottom nav
    final location = GoRouterState.of(context).matchedLocation;
    if (location == AppRoutes.home) _currentIndex = 0;
    if (location == AppRoutes.search) _currentIndex = 1;
    if (location == AppRoutes.appointments) _currentIndex = 2;
    if (location == AppRoutes.profile) _currentIndex = 3;

    return PopScope(
      canPop: _currentIndex == 0, // Only allow pop on home screen
      onPopInvoked: (didPop) {
        // If we didn't pop and we're not on home, go to home
        if (!didPop && _currentIndex != 0) {
          _onTap(0); // Navigate to home tab
        }
      },
      child: Scaffold(
        body: widget.child,
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTap,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppColors.clay,
          unselectedItemColor: AppColors.muted,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_outlined),
              activeIcon: Icon(Icons.search),
              label: 'Search',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              activeIcon: Icon(Icons.calendar_today),
              label: 'Appointments',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
