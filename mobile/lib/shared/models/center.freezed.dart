// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'center.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Center {

 String get id; String get name; String get category; String get address; String get email; String get phone; String get licenseNumber; String get status; String? get logo; String? get coverImage; int get doctorCount; String? get operatingHours; List<String> get amenities; String? get submittedTime;
/// Create a copy of Center
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CenterCopyWith<Center> get copyWith => _$CenterCopyWithImpl<Center>(this as Center, _$identity);

  /// Serializes this Center to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as Center;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Center&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.address, _this.address) || other.address == _this.address)&&(identical(other.email, _this.email) || other.email == _this.email)&&(identical(other.phone, _this.phone) || other.phone == _this.phone)&&(identical(other.licenseNumber, _this.licenseNumber) || other.licenseNumber == _this.licenseNumber)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.logo, _this.logo) || other.logo == _this.logo)&&(identical(other.coverImage, _this.coverImage) || other.coverImage == _this.coverImage)&&(identical(other.doctorCount, _this.doctorCount) || other.doctorCount == _this.doctorCount)&&(identical(other.operatingHours, _this.operatingHours) || other.operatingHours == _this.operatingHours)&&const DeepCollectionEquality().equals(other.amenities, _this.amenities)&&(identical(other.submittedTime, _this.submittedTime) || other.submittedTime == _this.submittedTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as Center;
  return Object.hash(runtimeType,_this.id,_this.name,_this.category,_this.address,_this.email,_this.phone,_this.licenseNumber,_this.status,_this.logo,_this.coverImage,_this.doctorCount,_this.operatingHours,const DeepCollectionEquality().hash(_this.amenities),_this.submittedTime);
}

@override
String toString() {
  final _this = this as Center;
  return 'Center(id: ${_this.id}, name: ${_this.name}, category: ${_this.category}, address: ${_this.address}, email: ${_this.email}, phone: ${_this.phone}, licenseNumber: ${_this.licenseNumber}, status: ${_this.status}, logo: ${_this.logo}, coverImage: ${_this.coverImage}, doctorCount: ${_this.doctorCount}, operatingHours: ${_this.operatingHours}, amenities: ${_this.amenities}, submittedTime: ${_this.submittedTime})';
}


}

/// @nodoc
abstract mixin class $CenterCopyWith<$Res>  {
  factory $CenterCopyWith(Center value, $Res Function(Center) _then) = _$CenterCopyWithImpl;
@useResult
$Res call({
 String id, String name, String category, String address, String email, String phone, String licenseNumber, String status, String? logo, String? coverImage, int doctorCount, String? operatingHours, List<String> amenities, String? submittedTime
});




}
/// @nodoc
class _$CenterCopyWithImpl<$Res>
    implements $CenterCopyWith<$Res> {
  _$CenterCopyWithImpl(this._self, this._then);

  final Center _self;
  final $Res Function(Center) _then;

/// Create a copy of Center
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? category = null,Object? address = null,Object? email = null,Object? phone = null,Object? licenseNumber = null,Object? status = null,Object? logo = freezed,Object? coverImage = freezed,Object? doctorCount = null,Object? operatingHours = freezed,Object? amenities = null,Object? submittedTime = freezed,}) {
  return _then(Center(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,address: null == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,licenseNumber: null == licenseNumber ? _self.licenseNumber : licenseNumber // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,logo: freezed == logo ? _self.logo : logo // ignore: cast_nullable_to_non_nullable
as String?,coverImage: freezed == coverImage ? _self.coverImage : coverImage // ignore: cast_nullable_to_non_nullable
as String?,doctorCount: null == doctorCount ? _self.doctorCount : doctorCount // ignore: cast_nullable_to_non_nullable
as int,operatingHours: freezed == operatingHours ? _self.operatingHours : operatingHours // ignore: cast_nullable_to_non_nullable
as String?,amenities: null == amenities ? _self.amenities : amenities // ignore: cast_nullable_to_non_nullable
as List<String>,submittedTime: freezed == submittedTime ? _self.submittedTime : submittedTime // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Center].
extension CenterPatterns on Center {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Center value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Center() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Center value)  $default,){
final _that = this;
switch (_that) {
case _Center():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Center value)?  $default,){
final _that = this;
switch (_that) {
case _Center() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String category,  String address,  String email,  String phone,  String licenseNumber,  String status,  String? logo,  String? coverImage,  int doctorCount,  String? operatingHours,  List<String> amenities,  String? submittedTime)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Center() when $default != null:
return $default(_that.id,_that.name,_that.category,_that.address,_that.email,_that.phone,_that.licenseNumber,_that.status,_that.logo,_that.coverImage,_that.doctorCount,_that.operatingHours,_that.amenities,_that.submittedTime);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String category,  String address,  String email,  String phone,  String licenseNumber,  String status,  String? logo,  String? coverImage,  int doctorCount,  String? operatingHours,  List<String> amenities,  String? submittedTime)  $default,) {final _that = this;
switch (_that) {
case _Center():
return $default(_that.id,_that.name,_that.category,_that.address,_that.email,_that.phone,_that.licenseNumber,_that.status,_that.logo,_that.coverImage,_that.doctorCount,_that.operatingHours,_that.amenities,_that.submittedTime);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String category,  String address,  String email,  String phone,  String licenseNumber,  String status,  String? logo,  String? coverImage,  int doctorCount,  String? operatingHours,  List<String> amenities,  String? submittedTime)?  $default,) {final _that = this;
switch (_that) {
case _Center() when $default != null:
return $default(_that.id,_that.name,_that.category,_that.address,_that.email,_that.phone,_that.licenseNumber,_that.status,_that.logo,_that.coverImage,_that.doctorCount,_that.operatingHours,_that.amenities,_that.submittedTime);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Center implements Center {
  const _Center({required this.id, required this.name, required this.category, required this.address, required this.email, required this.phone, required this.licenseNumber, required this.status, this.logo, this.coverImage, required this.doctorCount, this.operatingHours,  List<String> amenities = const [], this.submittedTime}): _amenities = amenities;
  factory _Center.fromJson(Map<String, dynamic> json) => _$CenterFromJson(json);

@override final  String id;
@override final  String name;
@override final  String category;
@override final  String address;
@override final  String email;
@override final  String phone;
@override final  String licenseNumber;
@override final  String status;
@override final  String? logo;
@override final  String? coverImage;
@override final  int doctorCount;
@override final  String? operatingHours;
 final  List<String> _amenities;
@override@JsonKey() List<String> get amenities {
  if (_amenities is EqualUnmodifiableListView) return _amenities;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_amenities);
}

@override final  String? submittedTime;

/// Create a copy of Center
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CenterCopyWith<_Center> get copyWith => __$CenterCopyWithImpl<_Center>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CenterToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Center&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.category, category) || other.category == category)&&(identical(other.address, address) || other.address == address)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.licenseNumber, licenseNumber) || other.licenseNumber == licenseNumber)&&(identical(other.status, status) || other.status == status)&&(identical(other.logo, logo) || other.logo == logo)&&(identical(other.coverImage, coverImage) || other.coverImage == coverImage)&&(identical(other.doctorCount, doctorCount) || other.doctorCount == doctorCount)&&(identical(other.operatingHours, operatingHours) || other.operatingHours == operatingHours)&&const DeepCollectionEquality().equals(other.amenities, _amenities)&&(identical(other.submittedTime, submittedTime) || other.submittedTime == submittedTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,name,category,address,email,phone,licenseNumber,status,logo,coverImage,doctorCount,operatingHours,const DeepCollectionEquality().hash(_amenities),submittedTime);
}

@override
String toString() {
    return 'Center(id: $id, name: $name, category: $category, address: $address, email: $email, phone: $phone, licenseNumber: $licenseNumber, status: $status, logo: $logo, coverImage: $coverImage, doctorCount: $doctorCount, operatingHours: $operatingHours, amenities: $amenities, submittedTime: $submittedTime)';
}


}

/// @nodoc
abstract mixin class _$CenterCopyWith<$Res> implements $CenterCopyWith<$Res> {
  factory _$CenterCopyWith(_Center value, $Res Function(_Center) _then) = __$CenterCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String category, String address, String email, String phone, String licenseNumber, String status, String? logo, String? coverImage, int doctorCount, String? operatingHours, List<String> amenities, String? submittedTime
});




}
/// @nodoc
class __$CenterCopyWithImpl<$Res>
    implements _$CenterCopyWith<$Res> {
  __$CenterCopyWithImpl(this._self, this._then);

  final _Center _self;
  final $Res Function(_Center) _then;

/// Create a copy of Center
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? category = null,Object? address = null,Object? email = null,Object? phone = null,Object? licenseNumber = null,Object? status = null,Object? logo = freezed,Object? coverImage = freezed,Object? doctorCount = null,Object? operatingHours = freezed,Object? amenities = null,Object? submittedTime = freezed,}) {
  return _then(_Center(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,address: null == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,licenseNumber: null == licenseNumber ? _self.licenseNumber : licenseNumber // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,logo: freezed == logo ? _self.logo : logo // ignore: cast_nullable_to_non_nullable
as String?,coverImage: freezed == coverImage ? _self.coverImage : coverImage // ignore: cast_nullable_to_non_nullable
as String?,doctorCount: null == doctorCount ? _self.doctorCount : doctorCount // ignore: cast_nullable_to_non_nullable
as int,operatingHours: freezed == operatingHours ? _self.operatingHours : operatingHours // ignore: cast_nullable_to_non_nullable
as String?,amenities: null == amenities ? _self._amenities : amenities // ignore: cast_nullable_to_non_nullable
as List<String>,submittedTime: freezed == submittedTime ? _self.submittedTime : submittedTime // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
