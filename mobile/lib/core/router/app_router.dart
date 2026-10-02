import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/appointments/presentation/appointments_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/doctor_detail/presentation/doctor_detail_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../features/auth/providers/auth_provider.dart';
import 'app_routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isInitialized = authState.isInitialized;

      final isSplash = state.matchedLocation == AppRoutes.splash;
      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.signup ||
          state.matchedLocation == AppRoutes.forgotPassword;

      // Show splash while initializing
      if (!isInitialized) {
        if (isSplash) return null; // Stay on splash
        return AppRoutes.splash; // Redirect to splash
      }

      // Once initialized, redirect from splash to appropriate screen
      if (isSplash) {
        return isAuthenticated ? AppRoutes.home : AppRoutes.login;
      }

      // Redirect to home if authenticated and trying to access auth routes
      if (isAuthenticated && isAuthRoute) {
        return AppRoutes.home;
      }

      // Redirect to login if not authenticated and not on auth route or splash
      if (!isAuthenticated && !isAuthRoute && !isSplash) {
        return AppRoutes.login;
      }

      return null;
    },
    routes: [
      // Splash screen
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes (outside shell)
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.signup,
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // Main app shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.search,
            builder: (context, state) => const SearchScreen(),
          ),
          GoRoute(
            path: AppRoutes.appointments,
            builder: (context, state) => const AppointmentsScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // Detail routes (will be implemented later in Task 6-8)
      GoRoute(
        path: AppRoutes.doctorDetail,
        builder: (context, state) {
          final doctorId = state.pathParameters['id']!;
          return DoctorDetailScreen(doctorId: doctorId);
        },
      ),
      GoRoute(
        path: AppRoutes.centerDetail,
        builder: (context, state) {
          final centerId = state.pathParameters['id']!;
          return Scaffold(
            appBar: AppBar(title: const Text('Center Detail')),
            body: Center(child: Text('Center ID: $centerId')),
          );
        },
      ),
      GoRoute(
        path: AppRoutes.appointmentDetail,
        builder: (context, state) {
          final appointmentId = state.pathParameters['id']!;
          return Scaffold(
            appBar: AppBar(title: const Text('Appointment Detail')),
            body: Center(child: Text('Appointment ID: $appointmentId')),
          );
        },
      ),
    ],
  );
});
