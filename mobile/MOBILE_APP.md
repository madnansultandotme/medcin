# Medcin Patient Mobile App Documentation

> **Cross-Border Healthcare Booking Mobile Application**  
> Flutter 3.x · Dart · Firebase · Riverpod · Go Router

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [API Integration](#api-integration)
6. [Authentication](#authentication)
7. [State Management](#state-management)
8. [Navigation](#navigation)
9. [Push Notifications](#push-notifications)
10. [Business Model](#business-model)
11. [Environment Setup](#environment-setup)
12. [Development](#development)
13. [Deployment](#deployment)
14. [Project Structure](#project-structure)

---

## Overview

**Medcin Mobile App** is a subscription-based patient mobile application for booking cross-border healthcare appointments across Singapore, Thailand, and Malaysia. The app connects to the Medcin Web Platform backend APIs.

### Key Characteristics

- ✅ **Subscription-based** (FREE, BASIC, PREMIUM tiers)
- ✅ **Patient-focused** (no center or admin roles)
- ✅ **Real-time bookings** with push notifications
- ✅ **Multi-auth** (Email/Password, Google, Apple)
- ✅ **Offline-first** with Hive local storage
- ✅ **Android & iOS** support

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  Flutter UI · Riverpod Providers · Go Router        │
│  ├─ Browse Doctors Screen                            │
│  ├─ Doctor Profile Screen                            │
│  ├─ Booking Flow Screens                             │
│  ├─ My Appointments Screen                           │
│  └─ Profile Screen                                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Domain Layer                       │
│  Business Logic · Use Cases · Entities               │
│  ├─ Authentication Use Cases                         │
│  ├─ Booking Use Cases                                │
│  ├─ Doctor Browse Use Cases                          │
│  └─ Profile Management Use Cases                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    Data Layer                        │
│  Repositories · API Client · Local Storage           │
│  ├─ Remote Data Source (REST API)                   │
│  ├─ Local Data Source (Hive)                        │
│  └─ Firebase Services (Auth, FCM)                   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                 External Services                    │
│  ├─ Medcin Web API (Neon Database)                  │
│  ├─ Firebase Auth (Google, Apple)                   │
│  └─ Firebase Cloud Messaging (Notifications)        │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Flutter UI)
    ↓
Riverpod Provider
    ↓
Use Case (Domain)
    ↓
Repository (Data)
    ↓
API Client (HTTP)
    ↓
Medcin Web API
    ↓
Neon PostgreSQL
    ↓
Response → Update State → Rebuild UI
```

---

## Features

### Browse & Search
- ✅ Browse doctors by specialty
- ✅ Search by name, location, category
- ✅ Filter by price range and rating
- ✅ View doctor profiles with bio
- ✅ See services and pricing
- ✅ Check availability slots

### Booking Management
- ✅ Multi-step booking flow
- ✅ Select service and time slot
- ✅ Add patient notes
- ✅ Instant booking confirmation
- ✅ View upcoming appointments
- ✅ View booking history
- ✅ Cancel appointments
- ✅ Download booking receipts

### Profile & Settings
- ✅ Update personal information
- ✅ Add emergency contacts
- ✅ Medical notes and allergies
- ✅ Insurance information
- ✅ Manage subscription
- ✅ Language preferences
- ✅ Notification settings

### Push Notifications
- ✅ Booking confirmations
- ✅ Appointment reminders (24h, 1h before)
- ✅ Booking status updates
- ✅ Center announcements
- ✅ Subscription renewal reminders

### Subscription Features

**FREE Tier:**
- Browse doctors
- View center information
- Basic search
- Limited to 1 active booking

**BASIC Tier (Monthly):**
- Unlimited bookings
- Booking history
- Priority notifications
- Email support

**PREMIUM Tier (Yearly):**
- All BASIC features
- Health records storage
- Family account (up to 5 members)
- Exclusive center discounts
- Priority booking slots
- 24/7 chat support

---

## Tech Stack

### Frontend
- **Framework**: Flutter 3.x
- **Language**: Dart 3.x
- **State Management**: Riverpod
- **Navigation**: Go Router
- **UI Components**: Material Design 3

### Backend Integration
- **HTTP Client**: Dio
- **API**: Medcin Web Platform REST API
- **Auth**: Firebase Authentication
- **Storage**: Hive (local) + Shared Preferences

### Services
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Analytics**: Firebase Analytics
- **Crash Reporting**: Firebase Crashlytics
- **Auth Providers**: Google Sign-In, Apple Sign-In

### Development
- **Build System**: Flutter Build Runner
- **Code Generation**: Freezed, JSON Serializable
- **Linting**: Flutter Lints
- **Testing**: Flutter Test, Mockito

---

## API Integration

### Base Configuration

```dart
class ApiConfig {
  static const String baseUrl = 'https://your-domain.com';
  static const String apiVersion = 'v1';
  
  // Endpoints
  static const String doctors = '/api/doctors';
  static const String centers = '/api/centers';
  static const String bookings = '/api/bookings';
  static const String services = '/api/services';
  static const String profile = '/api/patient/profile';
  static const String auth = '/api/auth';
}
```

### API Client

```dart
class ApiClient {
  final Dio _dio;
  
  ApiClient() : _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));
  
  // Add auth interceptor
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await _dio.get(path, queryParameters: queryParameters);
  }
  
  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }
  
  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }
  
  Future<Response> delete(String path) async {
    return await _dio.delete(path);
  }
}
```

### Key API Endpoints

**Authentication:**
```dart
POST /api/auth/register
POST /api/auth/login (via Firebase, then exchange token)
GET /api/auth/me
```

**Doctors:**
```dart
GET /api/doctors?category=Dental&search=smith
GET /api/doctors/{id}
```

**Bookings:**
```dart
GET /api/bookings (user's bookings)
POST /api/bookings (create booking)
PUT /api/bookings (update status)
DELETE /api/bookings?id={id} (cancel booking)
```

**Patient Profile:**
```dart
GET /api/patient/profile
PUT /api/patient/profile
```

**Services:**
```dart
GET /api/services?doctorId={id}
```

---

## Authentication

### Firebase Authentication Setup

```dart
class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final ApiClient _apiClient;
  
  // Email/Password Sign Up
  Future<User?> signUpWithEmail(String email, String password, String name) async {
    final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    
    // Create user in Medcin database
    await _apiClient.post('/api/auth/register', data: {
      'email': email,
      'name': name,
      'role': 'PATIENT',
      'firebaseUid': userCredential.user!.uid,
    });
    
    return userCredential.user;
  }
  
  // Google Sign-In
  Future<User?> signInWithGoogle() async {
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
    final GoogleSignInAuthentication googleAuth = await googleUser!.authentication;
    
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    
    final userCredential = await _firebaseAuth.signInWithCredential(credential);
    
    // Check if user exists in Medcin DB, if not create
    final token = await userCredential.user!.getIdToken();
    _apiClient.setAuthToken(token);
    
    try {
      await _apiClient.get('/api/auth/me');
    } catch (e) {
      // User doesn't exist, create
      await _apiClient.post('/api/auth/register', data: {
        'email': userCredential.user!.email,
        'name': userCredential.user!.displayName,
        'role': 'PATIENT',
        'firebaseUid': userCredential.user!.uid,
      });
    }
    
    return userCredential.user;
  }
  
  // Apple Sign-In
  Future<User?> signInWithApple() async {
    final appleProvider = AppleAuthProvider();
    final userCredential = await _firebaseAuth.signInWithProvider(appleProvider);
    
    // Similar to Google sign-in flow
    return userCredential.user;
  }
  
  // Sign Out
  Future<void> signOut() async {
    await _firebaseAuth.signOut();
    await GoogleSignIn().signOut();
  }
  
  // Get Current User
  User? getCurrentUser() {
    return _firebaseAuth.currentUser;
  }
  
  // Listen to Auth State
  Stream<User?> authStateChanges() {
    return _firebaseAuth.authStateChanges();
  }
}
```

### Auth State Provider

```dart
final authServiceProvider = Provider((ref) => AuthService());

final authStateProvider = StreamProvider<User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges();
});

final currentUserProvider = FutureProvider<PatientProfile?>((ref) async {
  final authState = ref.watch(authStateProvider);
  
  return authState.when(
    data: (user) async {
      if (user == null) return null;
      
      final token = await user.getIdToken();
      final apiClient = ref.read(apiClientProvider);
      apiClient.setAuthToken(token);
      
      final response = await apiClient.get('/api/patient/profile');
      return PatientProfile.fromJson(response.data['profile']);
    },
    loading: () => null,
    error: (_, __) => null,
  );
});
```

---

## State Management

### Riverpod Providers

```dart
// API Client Provider
final apiClientProvider = Provider((ref) => ApiClient());

// Doctors List Provider
final doctorsProvider = FutureProvider.family<List<Doctor>, DoctorFilter>((ref, filter) async {
  final apiClient = ref.read(apiClientProvider);
  
  final queryParams = {
    if (filter.category != null) 'category': filter.category,
    if (filter.search != null) 'search': filter.search,
  };
  
  final response = await apiClient.get('/api/doctors', queryParameters: queryParams);
  return (response.data['doctors'] as List)
      .map((json) => Doctor.fromJson(json))
      .toList();
});

// Doctor Detail Provider
final doctorDetailProvider = FutureProvider.family<Doctor, String>((ref, doctorId) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('/api/doctors/$doctorId');
  return Doctor.fromJson(response.data['doctor']);
});

// Bookings Provider
final bookingsProvider = FutureProvider<List<Booking>>((ref) async {
  final apiClient = ref.read(apiClientProvider);
  final response = await apiClient.get('/api/bookings');
  return (response.data['bookings'] as List)
      .map((json) => Booking.fromJson(json))
      .toList();
});

// Booking State Provider (for creating bookings)
final bookingStateProvider = StateNotifierProvider<BookingNotifier, BookingState>((ref) {
  return BookingNotifier(ref.read(apiClientProvider));
});

class BookingNotifier extends StateNotifier<BookingState> {
  final ApiClient _apiClient;
  
  BookingNotifier(this._apiClient) : super(BookingState.initial());
  
  Future<void> createBooking(BookingRequest request) async {
    state = state.copyWith(isLoading: true);
    
    try {
      final response = await _apiClient.post('/api/bookings', data: request.toJson());
      final booking = Booking.fromJson(response.data['booking']);
      
      state = state.copyWith(
        isLoading: false,
        booking: booking,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  void reset() {
    state = BookingState.initial();
  }
}
```

---

## Navigation

### Go Router Configuration

```dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isLoggingIn = state.location == '/login' || state.location == '/signup';
      
      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }
      
      if (isLoggedIn && isLoggingIn) {
        return '/';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => SignUpScreen(),
      ),
      GoRoute(
        path: '/doctors',
        builder: (context, state) => DoctorsListScreen(),
      ),
      GoRoute(
        path: '/doctors/:id',
        builder: (context, state) => DoctorDetailScreen(
          doctorId: state.params['id']!,
        ),
      ),
      GoRoute(
        path: '/bookings',
        builder: (context, state) => MyBookingsScreen(),
      ),
      GoRoute(
        path: '/bookings/new',
        builder: (context, state) => BookingFlowScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => ProfileScreen(),
      ),
      GoRoute(
        path: '/subscription',
        builder: (context, state) => SubscriptionScreen(),
      ),
    ],
  );
});
```

---

## Push Notifications

### Firebase Cloud Messaging Setup

```dart
class NotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  
  Future<void> initialize() async {
    // Request permission (iOS)
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Get FCM token
    final token = await _fcm.getToken();
    print('FCM Token: $token');
    
    // Send token to backend
    // await apiClient.post('/api/notifications/register-device', data: {'token': token});
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleMessage);
    
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_backgroundMessageHandler);
    
    // Handle notification tap
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
  }
  
  void _handleMessage(RemoteMessage message) {
    print('Got a message: ${message.notification?.title}');
    
    // Show local notification
    // Use flutter_local_notifications package
  }
  
  void _handleNotificationTap(RemoteMessage message) {
    print('Notification tapped: ${message.data}');
    
    // Navigate based on notification data
    final type = message.data['type'];
    if (type == 'booking_confirmed') {
      // Navigate to booking detail
      final bookingId = message.data['bookingId'];
      // router.go('/bookings/$bookingId');
    }
  }
  
  static Future<void> _backgroundMessageHandler(RemoteMessage message) async {
    print('Background message: ${message.notification?.title}');
  }
}
```

### Notification Types

```dart
enum NotificationType {
  bookingConfirmed,
  bookingCancelled,
  appointmentReminder24h,
  appointmentReminder1h,
  subscriptionExpiring,
  centerAnnouncement,
}

class PushNotificationPayload {
  final NotificationType type;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  
  PushNotificationPayload({
    required this.type,
    required this.title,
    required this.body,
    required this.data,
  });
}
```

---

## Business Model

### Subscription Tiers

```dart
enum SubscriptionTier {
  free,
  basic,
  premium,
}

class SubscriptionFeatures {
  static const Map<SubscriptionTier, Map<String, dynamic>> features = {
    SubscriptionTier.free: {
      'maxActiveBookings': 1,
      'bookingHistory': false,
      'priorityNotifications': false,
      'healthRecords': false,
      'familyAccount': false,
      'support': 'email',
    },
    SubscriptionTier.basic: {
      'maxActiveBookings': -1, // unlimited
      'bookingHistory': true,
      'priorityNotifications': true,
      'healthRecords': false,
      'familyAccount': false,
      'support': 'email',
      'price': 9.99,
      'currency': 'USD',
      'period': 'month',
    },
    SubscriptionTier.premium: {
      'maxActiveBookings': -1,
      'bookingHistory': true,
      'priorityNotifications': true,
      'healthRecords': true,
      'familyAccount': true,
      'support': '24/7 chat',
      'price': 99.99,
      'currency': 'USD',
      'period': 'year',
    },
  };
}
```

### In-App Purchases

```dart
class SubscriptionService {
  // Use in_app_purchase package
  final InAppPurchase _iap = InAppPurchase.instance;
  
  Future<void> purchaseSubscription(SubscriptionTier tier) async {
    final productId = tier == SubscriptionTier.basic
        ? 'medcin_basic_monthly'
        : 'medcin_premium_yearly';
    
    final available = await _iap.isAvailable();
    if (!available) {
      throw Exception('Store not available');
    }
    
    final response = await _iap.queryProductDetails({productId});
    final product = response.productDetails.first;
    
    final purchaseParam = PurchaseParam(productDetails: product);
    await _iap.buyNonConsumable(purchaseParam: purchaseParam);
  }
  
  Future<void> restorePurchases() async {
    await _iap.restorePurchases();
  }
}
```

---

## Environment Setup

### Prerequisites

- Flutter SDK 3.x
- Dart SDK 3.x
- Android Studio / Xcode
- Firebase account
- Google Cloud Console account (for Google Sign-In)
- Apple Developer account (for Apple Sign-In)

### Installation

```bash
# Clone repository
cd medcin-dashboard/mobile

# Get dependencies
flutter pub get

# Run code generation
flutter pub run build_runner build --delete-conflicting-outputs

# Run on device/emulator
flutter run
```

### Firebase Configuration

1. Create Firebase project
2. Add Android app (package name: `com.medcin.patient`)
3. Add iOS app (bundle ID: `com.medcin.patient`)
4. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
5. Place files in respective folders:
   - Android: `android/app/`
   - iOS: `ios/Runner/`

### Environment Variables

Create `lib/core/config/env.dart`:

```dart
class Env {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-domain.com',
  );
  
  static const String googleWebClientId = String.fromEnvironment(
    'GOOGLE_WEB_CLIENT_ID',
  );
  
  static const bool isDevelopment = bool.fromEnvironment(
    'DEVELOPMENT',
    defaultValue: true,
  );
}
```

Run with:
```bash
flutter run --dart-define=API_BASE_URL=https://your-domain.com --dart-define=GOOGLE_WEB_CLIENT_ID=your-id
```

---

## Development

### Project Structure

```
mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── config/
│   │   │   ├── env.dart
│   │   │   ├── theme.dart
│   │   │   └── router.dart
│   │   ├── constants/
│   │   │   ├── colors.dart
│   │   │   └── strings.dart
│   │   ├── utils/
│   │   │   ├── formatters.dart
│   │   │   └── validators.dart
│   │   └── widgets/
│   │       ├── custom_button.dart
│   │       ├── custom_text_field.dart
│   │       └── loading_indicator.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   ├── repositories/
│   │   │   │   └── data_sources/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── use_cases/
│   │   │   └── presentation/
│   │   │       ├── screens/
│   │   │       ├── widgets/
│   │   │       └── providers/
│   │   ├── doctors/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── bookings/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   └── profile/
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   └── services/
│       ├── api_client.dart
│       ├── auth_service.dart
│       ├── notification_service.dart
│       └── storage_service.dart
├── android/
├── ios/
├── test/
├── pubspec.yaml
└── README.md
```

### Key Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0
  
  # Navigation
  go_router: ^12.0.0
  
  # HTTP & API
  dio: ^5.4.0
  retrofit: ^4.0.0
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2
  
  # Firebase
  firebase_core: ^2.24.0
  firebase_auth: ^4.15.0
  firebase_messaging: ^14.7.0
  firebase_analytics: ^10.7.0
  
  # Auth Providers
  google_sign_in: ^6.2.0
  sign_in_with_apple: ^5.0.0
  
  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Utils
  intl: ^0.18.1
  equatable: ^2.0.5
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  
  # In-App Purchase
  in_app_purchase: ^3.1.11

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.7
  riverpod_generator: ^2.3.0
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  mockito: ^5.4.4
```

---

## Deployment

### Android

1. **Update `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        applicationId "com.medcin.patient"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

2. **Build APK:**
```bash
flutter build apk --release
```

3. **Build App Bundle (for Play Store):**
```bash
flutter build appbundle --release
```

### iOS

1. **Update `ios/Runner/Info.plist` with required permissions:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for profile pictures</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo access for profile pictures</string>
```

2. **Build for iOS:**
```bash
flutter build ios --release
```

3. **Archive in Xcode and upload to App Store Connect**

---

## Testing

### Unit Tests

```dart
// test/features/doctors/domain/use_cases/get_doctors_test.dart
void main() {
  late GetDoctorsUseCase useCase;
  late MockDoctorRepository mockRepository;
  
  setUp(() {
    mockRepository = MockDoctorRepository();
    useCase = GetDoctorsUseCase(mockRepository);
  });
  
  test('should get doctors from repository', () async {
    // Arrange
    final doctors = [Doctor(id: '1', name: 'Dr. Smith')];
    when(mockRepository.getDoctors(any))
        .thenAnswer((_) async => Right(doctors));
    
    // Act
    final result = await useCase(DoctorFilter());
    
    // Assert
    expect(result, Right(doctors));
    verify(mockRepository.getDoctors(any));
    verifyNoMoreInteractions(mockRepository);
  });
}
```

### Widget Tests

```dart
// test/features/doctors/presentation/screens/doctors_list_screen_test.dart
void main() {
  testWidgets('displays list of doctors', (WidgetTester tester) async {
    // Build widget
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          doctorsProvider.overrideWith((ref, filter) async => mockDoctors),
        ],
        child: MaterialApp(home: DoctorsListScreen()),
      ),
    );
    
    // Wait for async operations
    await tester.pumpAndSettle();
    
    // Verify
    expect(find.text('Dr. Smith'), findsOneWidget);
    expect(find.text('Dr. Jones'), findsOneWidget);
  });
}
```

---

## API Response Models

### Doctor Model

```dart
@freezed
class Doctor with _$Doctor {
  const factory Doctor({
    required String id,
    required String name,
    required String role,
    required String category,
    required double price,
    required double rating,
    required int reviewsCount,
    required String licenseNumber,
    required String centerId,
    String? bio,
    String? imageUrl,
    @Default(true) bool active,
  }) = _Doctor;
  
  factory Doctor.fromJson(Map<String, dynamic> json) => _$DoctorFromJson(json);
}
```

### Booking Model

```dart
@freezed
class Booking with _$Booking {
  const factory Booking({
    required String id,
    required String reference,
    required String patientId,
    required String doctorId,
    required String slotId,
    required String date,
    required String time,
    required double price,
    required BookingStatus status,
    String? serviceId,
    String? patientNotes,
    DateTime? createdAt,
  }) = _Booking;
  
  factory Booking.fromJson(Map<String, dynamic> json) => _$BookingFromJson(json);
}

enum BookingStatus {
  @JsonValue('PENDING')
  pending,
  @JsonValue('CONFIRMED')
  confirmed,
  @JsonValue('COMPLETED')
  completed,
  @JsonValue('CANCELLED')
  cancelled,
}
```

---

## Troubleshooting

### Common Issues

**Firebase not initialized:**
```dart
// Ensure Firebase is initialized before runApp
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}
```

**Google Sign-In not working:**
- Check SHA-1 fingerprint is added to Firebase
- Verify `google-services.json` is up to date
- Ensure Web Client ID is correct

**iOS build fails:**
- Run `pod install` in ios/ folder
- Update CocoaPods: `sudo gem install cocoapods`
- Clean build: `flutter clean && flutter pub get`

---

## Monitoring & Analytics

### Firebase Analytics Events

```dart
class AnalyticsService {
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  
  Future<void> logDoctorViewed(String doctorId) async {
    await _analytics.logEvent(
      name: 'doctor_viewed',
      parameters: {'doctor_id': doctorId},
    );
  }
  
  Future<void> logBookingCreated(String bookingId, double price) async {
    await _analytics.logEvent(
      name: 'booking_created',
      parameters: {
        'booking_id': bookingId,
        'value': price,
        'currency': 'USD',
      },
    );
  }
  
  Future<void> logSubscriptionPurchased(String tier) async {
    await _analytics.logEvent(
      name: 'subscription_purchased',
      parameters: {'tier': tier},
    );
  }
}
```

---

## License

Proprietary - All rights reserved

---

## Contact

For support or questions:
- Email: support@medcin.health
- Platform: Medcin Patient Mobile App
- Region: Singapore, Thailand, Malaysia

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: In Development 🚧
**API Integration**: Ready for connection to Medcin Web Platform
