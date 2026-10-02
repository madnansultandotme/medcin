// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'booking.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Booking {

 String get id; String get reference; String get patientName; String get patientEmail; String get patientPhone; String? get patientNotes; String get doctorId; String get doctorName; String get doctorRole; String get clinicName; String get clinicAddress; String get serviceName; String get duration; String get date; String get time; double get price; String get status; String get createdAt; String get paymentMethod; String? get cancellationReason;
/// Create a copy of Booking
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BookingCopyWith<Booking> get copyWith => _$BookingCopyWithImpl<Booking>(this as Booking, _$identity);

  /// Serializes this Booking to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as Booking;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Booking&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.reference, _this.reference) || other.reference == _this.reference)&&(identical(other.patientName, _this.patientName) || other.patientName == _this.patientName)&&(identical(other.patientEmail, _this.patientEmail) || other.patientEmail == _this.patientEmail)&&(identical(other.patientPhone, _this.patientPhone) || other.patientPhone == _this.patientPhone)&&(identical(other.patientNotes, _this.patientNotes) || other.patientNotes == _this.patientNotes)&&(identical(other.doctorId, _this.doctorId) || other.doctorId == _this.doctorId)&&(identical(other.doctorName, _this.doctorName) || other.doctorName == _this.doctorName)&&(identical(other.doctorRole, _this.doctorRole) || other.doctorRole == _this.doctorRole)&&(identical(other.clinicName, _this.clinicName) || other.clinicName == _this.clinicName)&&(identical(other.clinicAddress, _this.clinicAddress) || other.clinicAddress == _this.clinicAddress)&&(identical(other.serviceName, _this.serviceName) || other.serviceName == _this.serviceName)&&(identical(other.duration, _this.duration) || other.duration == _this.duration)&&(identical(other.date, _this.date) || other.date == _this.date)&&(identical(other.time, _this.time) || other.time == _this.time)&&(identical(other.price, _this.price) || other.price == _this.price)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt)&&(identical(other.paymentMethod, _this.paymentMethod) || other.paymentMethod == _this.paymentMethod)&&(identical(other.cancellationReason, _this.cancellationReason) || other.cancellationReason == _this.cancellationReason));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as Booking;
  return Object.hashAll([runtimeType,_this.id,_this.reference,_this.patientName,_this.patientEmail,_this.patientPhone,_this.patientNotes,_this.doctorId,_this.doctorName,_this.doctorRole,_this.clinicName,_this.clinicAddress,_this.serviceName,_this.duration,_this.date,_this.time,_this.price,_this.status,_this.createdAt,_this.paymentMethod,_this.cancellationReason]);
}

@override
String toString() {
  final _this = this as Booking;
  return 'Booking(id: ${_this.id}, reference: ${_this.reference}, patientName: ${_this.patientName}, patientEmail: ${_this.patientEmail}, patientPhone: ${_this.patientPhone}, patientNotes: ${_this.patientNotes}, doctorId: ${_this.doctorId}, doctorName: ${_this.doctorName}, doctorRole: ${_this.doctorRole}, clinicName: ${_this.clinicName}, clinicAddress: ${_this.clinicAddress}, serviceName: ${_this.serviceName}, duration: ${_this.duration}, date: ${_this.date}, time: ${_this.time}, price: ${_this.price}, status: ${_this.status}, createdAt: ${_this.createdAt}, paymentMethod: ${_this.paymentMethod}, cancellationReason: ${_this.cancellationReason})';
}


}

/// @nodoc
abstract mixin class $BookingCopyWith<$Res>  {
  factory $BookingCopyWith(Booking value, $Res Function(Booking) _then) = _$BookingCopyWithImpl;
@useResult
$Res call({
 String id, String reference, String patientName, String patientEmail, String patientPhone, String? patientNotes, String doctorId, String doctorName, String doctorRole, String clinicName, String clinicAddress, String serviceName, String duration, String date, String time, double price, String status, String createdAt, String paymentMethod, String? cancellationReason
});




}
/// @nodoc
class _$BookingCopyWithImpl<$Res>
    implements $BookingCopyWith<$Res> {
  _$BookingCopyWithImpl(this._self, this._then);

  final Booking _self;
  final $Res Function(Booking) _then;

/// Create a copy of Booking
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? reference = null,Object? patientName = null,Object? patientEmail = null,Object? patientPhone = null,Object? patientNotes = freezed,Object? doctorId = null,Object? doctorName = null,Object? doctorRole = null,Object? clinicName = null,Object? clinicAddress = null,Object? serviceName = null,Object? duration = null,Object? date = null,Object? time = null,Object? price = null,Object? status = null,Object? createdAt = null,Object? paymentMethod = null,Object? cancellationReason = freezed,}) {
  return _then(Booking(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,reference: null == reference ? _self.reference : reference // ignore: cast_nullable_to_non_nullable
as String,patientName: null == patientName ? _self.patientName : patientName // ignore: cast_nullable_to_non_nullable
as String,patientEmail: null == patientEmail ? _self.patientEmail : patientEmail // ignore: cast_nullable_to_non_nullable
as String,patientPhone: null == patientPhone ? _self.patientPhone : patientPhone // ignore: cast_nullable_to_non_nullable
as String,patientNotes: freezed == patientNotes ? _self.patientNotes : patientNotes // ignore: cast_nullable_to_non_nullable
as String?,doctorId: null == doctorId ? _self.doctorId : doctorId // ignore: cast_nullable_to_non_nullable
as String,doctorName: null == doctorName ? _self.doctorName : doctorName // ignore: cast_nullable_to_non_nullable
as String,doctorRole: null == doctorRole ? _self.doctorRole : doctorRole // ignore: cast_nullable_to_non_nullable
as String,clinicName: null == clinicName ? _self.clinicName : clinicName // ignore: cast_nullable_to_non_nullable
as String,clinicAddress: null == clinicAddress ? _self.clinicAddress : clinicAddress // ignore: cast_nullable_to_non_nullable
as String,serviceName: null == serviceName ? _self.serviceName : serviceName // ignore: cast_nullable_to_non_nullable
as String,duration: null == duration ? _self.duration : duration // ignore: cast_nullable_to_non_nullable
as String,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,time: null == time ? _self.time : time // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,cancellationReason: freezed == cancellationReason ? _self.cancellationReason : cancellationReason // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Booking].
extension BookingPatterns on Booking {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Booking value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Booking() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Booking value)  $default,){
final _that = this;
switch (_that) {
case _Booking():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Booking value)?  $default,){
final _that = this;
switch (_that) {
case _Booking() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String reference,  String patientName,  String patientEmail,  String patientPhone,  String? patientNotes,  String doctorId,  String doctorName,  String doctorRole,  String clinicName,  String clinicAddress,  String serviceName,  String duration,  String date,  String time,  double price,  String status,  String createdAt,  String paymentMethod,  String? cancellationReason)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Booking() when $default != null:
return $default(_that.id,_that.reference,_that.patientName,_that.patientEmail,_that.patientPhone,_that.patientNotes,_that.doctorId,_that.doctorName,_that.doctorRole,_that.clinicName,_that.clinicAddress,_that.serviceName,_that.duration,_that.date,_that.time,_that.price,_that.status,_that.createdAt,_that.paymentMethod,_that.cancellationReason);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String reference,  String patientName,  String patientEmail,  String patientPhone,  String? patientNotes,  String doctorId,  String doctorName,  String doctorRole,  String clinicName,  String clinicAddress,  String serviceName,  String duration,  String date,  String time,  double price,  String status,  String createdAt,  String paymentMethod,  String? cancellationReason)  $default,) {final _that = this;
switch (_that) {
case _Booking():
return $default(_that.id,_that.reference,_that.patientName,_that.patientEmail,_that.patientPhone,_that.patientNotes,_that.doctorId,_that.doctorName,_that.doctorRole,_that.clinicName,_that.clinicAddress,_that.serviceName,_that.duration,_that.date,_that.time,_that.price,_that.status,_that.createdAt,_that.paymentMethod,_that.cancellationReason);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String reference,  String patientName,  String patientEmail,  String patientPhone,  String? patientNotes,  String doctorId,  String doctorName,  String doctorRole,  String clinicName,  String clinicAddress,  String serviceName,  String duration,  String date,  String time,  double price,  String status,  String createdAt,  String paymentMethod,  String? cancellationReason)?  $default,) {final _that = this;
switch (_that) {
case _Booking() when $default != null:
return $default(_that.id,_that.reference,_that.patientName,_that.patientEmail,_that.patientPhone,_that.patientNotes,_that.doctorId,_that.doctorName,_that.doctorRole,_that.clinicName,_that.clinicAddress,_that.serviceName,_that.duration,_that.date,_that.time,_that.price,_that.status,_that.createdAt,_that.paymentMethod,_that.cancellationReason);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Booking implements Booking {
  const _Booking({required this.id, required this.reference, required this.patientName, required this.patientEmail, required this.patientPhone, this.patientNotes, required this.doctorId, required this.doctorName, required this.doctorRole, required this.clinicName, required this.clinicAddress, required this.serviceName, required this.duration, required this.date, required this.time, required this.price, required this.status, required this.createdAt, required this.paymentMethod, this.cancellationReason});
  factory _Booking.fromJson(Map<String, dynamic> json) => _$BookingFromJson(json);

@override final  String id;
@override final  String reference;
@override final  String patientName;
@override final  String patientEmail;
@override final  String patientPhone;
@override final  String? patientNotes;
@override final  String doctorId;
@override final  String doctorName;
@override final  String doctorRole;
@override final  String clinicName;
@override final  String clinicAddress;
@override final  String serviceName;
@override final  String duration;
@override final  String date;
@override final  String time;
@override final  double price;
@override final  String status;
@override final  String createdAt;
@override final  String paymentMethod;
@override final  String? cancellationReason;

/// Create a copy of Booking
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BookingCopyWith<_Booking> get copyWith => __$BookingCopyWithImpl<_Booking>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BookingToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Booking&&(identical(other.id, id) || other.id == id)&&(identical(other.reference, reference) || other.reference == reference)&&(identical(other.patientName, patientName) || other.patientName == patientName)&&(identical(other.patientEmail, patientEmail) || other.patientEmail == patientEmail)&&(identical(other.patientPhone, patientPhone) || other.patientPhone == patientPhone)&&(identical(other.patientNotes, patientNotes) || other.patientNotes == patientNotes)&&(identical(other.doctorId, doctorId) || other.doctorId == doctorId)&&(identical(other.doctorName, doctorName) || other.doctorName == doctorName)&&(identical(other.doctorRole, doctorRole) || other.doctorRole == doctorRole)&&(identical(other.clinicName, clinicName) || other.clinicName == clinicName)&&(identical(other.clinicAddress, clinicAddress) || other.clinicAddress == clinicAddress)&&(identical(other.serviceName, serviceName) || other.serviceName == serviceName)&&(identical(other.duration, duration) || other.duration == duration)&&(identical(other.date, date) || other.date == date)&&(identical(other.time, time) || other.time == time)&&(identical(other.price, price) || other.price == price)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.cancellationReason, cancellationReason) || other.cancellationReason == cancellationReason));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hashAll([runtimeType,id,reference,patientName,patientEmail,patientPhone,patientNotes,doctorId,doctorName,doctorRole,clinicName,clinicAddress,serviceName,duration,date,time,price,status,createdAt,paymentMethod,cancellationReason]);
}

@override
String toString() {
    return 'Booking(id: $id, reference: $reference, patientName: $patientName, patientEmail: $patientEmail, patientPhone: $patientPhone, patientNotes: $patientNotes, doctorId: $doctorId, doctorName: $doctorName, doctorRole: $doctorRole, clinicName: $clinicName, clinicAddress: $clinicAddress, serviceName: $serviceName, duration: $duration, date: $date, time: $time, price: $price, status: $status, createdAt: $createdAt, paymentMethod: $paymentMethod, cancellationReason: $cancellationReason)';
}


}

/// @nodoc
abstract mixin class _$BookingCopyWith<$Res> implements $BookingCopyWith<$Res> {
  factory _$BookingCopyWith(_Booking value, $Res Function(_Booking) _then) = __$BookingCopyWithImpl;
@override @useResult
$Res call({
 String id, String reference, String patientName, String patientEmail, String patientPhone, String? patientNotes, String doctorId, String doctorName, String doctorRole, String clinicName, String clinicAddress, String serviceName, String duration, String date, String time, double price, String status, String createdAt, String paymentMethod, String? cancellationReason
});




}
/// @nodoc
class __$BookingCopyWithImpl<$Res>
    implements _$BookingCopyWith<$Res> {
  __$BookingCopyWithImpl(this._self, this._then);

  final _Booking _self;
  final $Res Function(_Booking) _then;

/// Create a copy of Booking
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? reference = null,Object? patientName = null,Object? patientEmail = null,Object? patientPhone = null,Object? patientNotes = freezed,Object? doctorId = null,Object? doctorName = null,Object? doctorRole = null,Object? clinicName = null,Object? clinicAddress = null,Object? serviceName = null,Object? duration = null,Object? date = null,Object? time = null,Object? price = null,Object? status = null,Object? createdAt = null,Object? paymentMethod = null,Object? cancellationReason = freezed,}) {
  return _then(_Booking(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,reference: null == reference ? _self.reference : reference // ignore: cast_nullable_to_non_nullable
as String,patientName: null == patientName ? _self.patientName : patientName // ignore: cast_nullable_to_non_nullable
as String,patientEmail: null == patientEmail ? _self.patientEmail : patientEmail // ignore: cast_nullable_to_non_nullable
as String,patientPhone: null == patientPhone ? _self.patientPhone : patientPhone // ignore: cast_nullable_to_non_nullable
as String,patientNotes: freezed == patientNotes ? _self.patientNotes : patientNotes // ignore: cast_nullable_to_non_nullable
as String?,doctorId: null == doctorId ? _self.doctorId : doctorId // ignore: cast_nullable_to_non_nullable
as String,doctorName: null == doctorName ? _self.doctorName : doctorName // ignore: cast_nullable_to_non_nullable
as String,doctorRole: null == doctorRole ? _self.doctorRole : doctorRole // ignore: cast_nullable_to_non_nullable
as String,clinicName: null == clinicName ? _self.clinicName : clinicName // ignore: cast_nullable_to_non_nullable
as String,clinicAddress: null == clinicAddress ? _self.clinicAddress : clinicAddress // ignore: cast_nullable_to_non_nullable
as String,serviceName: null == serviceName ? _self.serviceName : serviceName // ignore: cast_nullable_to_non_nullable
as String,duration: null == duration ? _self.duration : duration // ignore: cast_nullable_to_non_nullable
as String,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,time: null == time ? _self.time : time // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,cancellationReason: freezed == cancellationReason ? _self.cancellationReason : cancellationReason // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
