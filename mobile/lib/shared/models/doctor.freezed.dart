// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'doctor.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Doctor {

 String get id; String get name; String get role; String get category; String get clinic; String get location; double get price; double get rating; int get reviewsCount; String get initials; String get licenseNumber; bool get active; String? get bio; String? get image; List<Service> get services;
/// Create a copy of Doctor
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DoctorCopyWith<Doctor> get copyWith => _$DoctorCopyWithImpl<Doctor>(this as Doctor, _$identity);

  /// Serializes this Doctor to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as Doctor;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Doctor&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.role, _this.role) || other.role == _this.role)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.clinic, _this.clinic) || other.clinic == _this.clinic)&&(identical(other.location, _this.location) || other.location == _this.location)&&(identical(other.price, _this.price) || other.price == _this.price)&&(identical(other.rating, _this.rating) || other.rating == _this.rating)&&(identical(other.reviewsCount, _this.reviewsCount) || other.reviewsCount == _this.reviewsCount)&&(identical(other.initials, _this.initials) || other.initials == _this.initials)&&(identical(other.licenseNumber, _this.licenseNumber) || other.licenseNumber == _this.licenseNumber)&&(identical(other.active, _this.active) || other.active == _this.active)&&(identical(other.bio, _this.bio) || other.bio == _this.bio)&&(identical(other.image, _this.image) || other.image == _this.image)&&const DeepCollectionEquality().equals(other.services, _this.services));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as Doctor;
  return Object.hash(runtimeType,_this.id,_this.name,_this.role,_this.category,_this.clinic,_this.location,_this.price,_this.rating,_this.reviewsCount,_this.initials,_this.licenseNumber,_this.active,_this.bio,_this.image,const DeepCollectionEquality().hash(_this.services));
}

@override
String toString() {
  final _this = this as Doctor;
  return 'Doctor(id: ${_this.id}, name: ${_this.name}, role: ${_this.role}, category: ${_this.category}, clinic: ${_this.clinic}, location: ${_this.location}, price: ${_this.price}, rating: ${_this.rating}, reviewsCount: ${_this.reviewsCount}, initials: ${_this.initials}, licenseNumber: ${_this.licenseNumber}, active: ${_this.active}, bio: ${_this.bio}, image: ${_this.image}, services: ${_this.services})';
}


}

/// @nodoc
abstract mixin class $DoctorCopyWith<$Res>  {
  factory $DoctorCopyWith(Doctor value, $Res Function(Doctor) _then) = _$DoctorCopyWithImpl;
@useResult
$Res call({
 String id, String name, String role, String category, String clinic, String location, double price, double rating, int reviewsCount, String initials, String licenseNumber, bool active, String? bio, String? image, List<Service> services
});




}
/// @nodoc
class _$DoctorCopyWithImpl<$Res>
    implements $DoctorCopyWith<$Res> {
  _$DoctorCopyWithImpl(this._self, this._then);

  final Doctor _self;
  final $Res Function(Doctor) _then;

/// Create a copy of Doctor
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? role = null,Object? category = null,Object? clinic = null,Object? location = null,Object? price = null,Object? rating = null,Object? reviewsCount = null,Object? initials = null,Object? licenseNumber = null,Object? active = null,Object? bio = freezed,Object? image = freezed,Object? services = null,}) {
  return _then(Doctor(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,clinic: null == clinic ? _self.clinic : clinic // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,reviewsCount: null == reviewsCount ? _self.reviewsCount : reviewsCount // ignore: cast_nullable_to_non_nullable
as int,initials: null == initials ? _self.initials : initials // ignore: cast_nullable_to_non_nullable
as String,licenseNumber: null == licenseNumber ? _self.licenseNumber : licenseNumber // ignore: cast_nullable_to_non_nullable
as String,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,bio: freezed == bio ? _self.bio : bio // ignore: cast_nullable_to_non_nullable
as String?,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as String?,services: null == services ? _self.services : services // ignore: cast_nullable_to_non_nullable
as List<Service>,
  ));
}

}


/// Adds pattern-matching-related methods to [Doctor].
extension DoctorPatterns on Doctor {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Doctor value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Doctor() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Doctor value)  $default,){
final _that = this;
switch (_that) {
case _Doctor():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Doctor value)?  $default,){
final _that = this;
switch (_that) {
case _Doctor() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String role,  String category,  String clinic,  String location,  double price,  double rating,  int reviewsCount,  String initials,  String licenseNumber,  bool active,  String? bio,  String? image,  List<Service> services)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Doctor() when $default != null:
return $default(_that.id,_that.name,_that.role,_that.category,_that.clinic,_that.location,_that.price,_that.rating,_that.reviewsCount,_that.initials,_that.licenseNumber,_that.active,_that.bio,_that.image,_that.services);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String role,  String category,  String clinic,  String location,  double price,  double rating,  int reviewsCount,  String initials,  String licenseNumber,  bool active,  String? bio,  String? image,  List<Service> services)  $default,) {final _that = this;
switch (_that) {
case _Doctor():
return $default(_that.id,_that.name,_that.role,_that.category,_that.clinic,_that.location,_that.price,_that.rating,_that.reviewsCount,_that.initials,_that.licenseNumber,_that.active,_that.bio,_that.image,_that.services);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String role,  String category,  String clinic,  String location,  double price,  double rating,  int reviewsCount,  String initials,  String licenseNumber,  bool active,  String? bio,  String? image,  List<Service> services)?  $default,) {final _that = this;
switch (_that) {
case _Doctor() when $default != null:
return $default(_that.id,_that.name,_that.role,_that.category,_that.clinic,_that.location,_that.price,_that.rating,_that.reviewsCount,_that.initials,_that.licenseNumber,_that.active,_that.bio,_that.image,_that.services);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Doctor implements Doctor {
  const _Doctor({required this.id, required this.name, required this.role, required this.category, required this.clinic, required this.location, required this.price, required this.rating, required this.reviewsCount, required this.initials, required this.licenseNumber, required this.active, this.bio, this.image,  List<Service> services = const []}): _services = services;
  factory _Doctor.fromJson(Map<String, dynamic> json) => _$DoctorFromJson(json);

@override final  String id;
@override final  String name;
@override final  String role;
@override final  String category;
@override final  String clinic;
@override final  String location;
@override final  double price;
@override final  double rating;
@override final  int reviewsCount;
@override final  String initials;
@override final  String licenseNumber;
@override final  bool active;
@override final  String? bio;
@override final  String? image;
 final  List<Service> _services;
@override@JsonKey() List<Service> get services {
  if (_services is EqualUnmodifiableListView) return _services;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_services);
}


/// Create a copy of Doctor
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DoctorCopyWith<_Doctor> get copyWith => __$DoctorCopyWithImpl<_Doctor>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DoctorToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Doctor&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.role, role) || other.role == role)&&(identical(other.category, category) || other.category == category)&&(identical(other.clinic, clinic) || other.clinic == clinic)&&(identical(other.location, location) || other.location == location)&&(identical(other.price, price) || other.price == price)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.reviewsCount, reviewsCount) || other.reviewsCount == reviewsCount)&&(identical(other.initials, initials) || other.initials == initials)&&(identical(other.licenseNumber, licenseNumber) || other.licenseNumber == licenseNumber)&&(identical(other.active, active) || other.active == active)&&(identical(other.bio, bio) || other.bio == bio)&&(identical(other.image, image) || other.image == image)&&const DeepCollectionEquality().equals(other.services, _services));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,name,role,category,clinic,location,price,rating,reviewsCount,initials,licenseNumber,active,bio,image,const DeepCollectionEquality().hash(_services));
}

@override
String toString() {
    return 'Doctor(id: $id, name: $name, role: $role, category: $category, clinic: $clinic, location: $location, price: $price, rating: $rating, reviewsCount: $reviewsCount, initials: $initials, licenseNumber: $licenseNumber, active: $active, bio: $bio, image: $image, services: $services)';
}


}

/// @nodoc
abstract mixin class _$DoctorCopyWith<$Res> implements $DoctorCopyWith<$Res> {
  factory _$DoctorCopyWith(_Doctor value, $Res Function(_Doctor) _then) = __$DoctorCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String role, String category, String clinic, String location, double price, double rating, int reviewsCount, String initials, String licenseNumber, bool active, String? bio, String? image, List<Service> services
});




}
/// @nodoc
class __$DoctorCopyWithImpl<$Res>
    implements _$DoctorCopyWith<$Res> {
  __$DoctorCopyWithImpl(this._self, this._then);

  final _Doctor _self;
  final $Res Function(_Doctor) _then;

/// Create a copy of Doctor
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? role = null,Object? category = null,Object? clinic = null,Object? location = null,Object? price = null,Object? rating = null,Object? reviewsCount = null,Object? initials = null,Object? licenseNumber = null,Object? active = null,Object? bio = freezed,Object? image = freezed,Object? services = null,}) {
  return _then(_Doctor(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,clinic: null == clinic ? _self.clinic : clinic // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as double,reviewsCount: null == reviewsCount ? _self.reviewsCount : reviewsCount // ignore: cast_nullable_to_non_nullable
as int,initials: null == initials ? _self.initials : initials // ignore: cast_nullable_to_non_nullable
as String,licenseNumber: null == licenseNumber ? _self.licenseNumber : licenseNumber // ignore: cast_nullable_to_non_nullable
as String,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,bio: freezed == bio ? _self.bio : bio // ignore: cast_nullable_to_non_nullable
as String?,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as String?,services: null == services ? _self._services : services // ignore: cast_nullable_to_non_nullable
as List<Service>,
  ));
}


}

// dart format on
