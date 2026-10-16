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
import '../../features/booking/presentation/service_selection_screen.dart';
import '../../features/booking/presentation/patient_details_screen.dart';
import '../../features/booking/presentation/booking_confirmation_screen.dart';
import '../../features/booking/presentation/booking_success_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../shared/models/doctor.dart';
import '../../shared/models/service.dart';
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

      // Booking flow routes
      GoRoute(
        path: AppRoutes.bookingService,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          final doctorId = extra?['doctorId'] as String? ?? '';
          final preSelectedDate = extra?['preSelectedDate'] as DateTime?;
          final preSelectedTime = extra?['preSelectedTime'] as String?;
          
          return ServiceSelectionScreen(
            doctorId: doctorId,
            preSelectedDate: preSelectedDate,
            preSelectedTime: preSelectedTime,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.bookingDetails,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          final doctor = extra['doctor'] as Doctor;
          final service = extra['service'] as Service;
          final selectedDate = extra['selectedDate'] as DateTime;
          final selectedTime = extra['selectedTime'] as String;
          final slotId = extra['slotId'] as String;
          
          return PatientDetailsScreen(
            doctor: doctor,
            service: service,
            selectedDate: selectedDate,
            selectedTime: selectedTime,
            slotId: slotId,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.bookingConfirmation,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          final doctor = extra['doctor'] as Doctor;
          final service = extra['service'] as Service;
          final selectedDate = extra['selectedDate'] as DateTime;
          final selectedTime = extra['selectedTime'] as String;
          final slotId = extra['slotId'] as String;
          final patientName = extra['patientName'] as String;
          final patientEmail = extra['patientEmail'] as String;
          final patientPhone = extra['patientPhone'] as String;
          final notes = extra['notes'] as String;
          
          return BookingConfirmationScreen(
            doctor: doctor,
            service: service,
            selectedDate: selectedDate,
            selectedTime: selectedTime,
            slotId: slotId,
            patientName: patientName,
            patientEmail: patientEmail,
            patientPhone: patientPhone,
            notes: notes,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.bookingSuccess,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          final bookingReference = extra['bookingReference'] as String;
          final bookingId = extra['bookingId'] as String;
          final doctor = extra['doctor'] as Doctor;
          final service = extra['service'] as Service;
          final selectedDate = extra['selectedDate'] as DateTime;
          final selectedTime = extra['selectedTime'] as String;
          
          return BookingSuccessScreen(
            bookingReference: bookingReference,
            bookingId: bookingId,
            doctor: doctor,
            service: service,
            selectedDate: selectedDate,
            selectedTime: selectedTime,
          );
        },
      ),
    ],
  );
});
