import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:better_auth_flutter/better_auth_flutter.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

// Better Auth Configuration
const String authUrl = "https://medcin.vercel.app";
// For local development:
// const String authUrl = "http://localhost:3000";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Better Auth
  await BetterAuthFlutter.initialize(
    url: authUrl,
    enableLogging: true, // Set to false in production
  );

  runApp(
    const ProviderScope(
      child: MedcinApp(),
    ),
  );
}

class MedcinApp extends ConsumerWidget {
  const MedcinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    // Wrap with BetterAuthProvider for reactive auth state
    return BetterAuthProvider(
      child: MaterialApp.router(
        title: 'Medcin',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: router,
      ),
    );
  }
}
