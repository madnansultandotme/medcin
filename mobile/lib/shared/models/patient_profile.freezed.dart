// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'patient_profile.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$EmergencyContact {

 String get name; String get relationship; String get phone;
/// Create a copy of EmergencyContact
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EmergencyContactCopyWith<EmergencyContact> get copyWith => _$EmergencyContactCopyWithImpl<EmergencyContact>(this as EmergencyContact, _$identity);

  /// Serializes this EmergencyContact to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as EmergencyContact;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EmergencyContact&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.relationship, _this.relationship) || other.relationship == _this.relationship)&&(identical(other.phone, _this.phone) || other.phone == _this.phone));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as EmergencyContact;
  return Object.hash(runtimeType,_this.name,_this.relationship,_this.phone);
}

@override
String toString() {
  final _this = this as EmergencyContact;
  return 'EmergencyContact(name: ${_this.name}, relationship: ${_this.relationship}, phone: ${_this.phone})';
}


}

/// @nodoc
abstract mixin class $EmergencyContactCopyWith<$Res>  {
  factory $EmergencyContactCopyWith(EmergencyContact value, $Res Function(EmergencyContact) _then) = _$EmergencyContactCopyWithImpl;
@useResult
$Res call({
 String name, String relationship, String phone
});




}
/// @nodoc
class _$EmergencyContactCopyWithImpl<$Res>
    implements $EmergencyContactCopyWith<$Res> {
  _$EmergencyContactCopyWithImpl(this._self, this._then);

  final EmergencyContact _self;
  final $Res Function(EmergencyContact) _then;

/// Create a copy of EmergencyContact
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? name = null,Object? relationship = null,Object? phone = null,}) {
  return _then(EmergencyContact(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,relationship: null == relationship ? _self.relationship : relationship // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [EmergencyContact].
extension EmergencyContactPatterns on EmergencyContact {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EmergencyContact value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EmergencyContact() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EmergencyContact value)  $default,){
final _that = this;
switch (_that) {
case _EmergencyContact():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EmergencyContact value)?  $default,){
final _that = this;
switch (_that) {
case _EmergencyContact() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String name,  String relationship,  String phone)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EmergencyContact() when $default != null:
return $default(_that.name,_that.relationship,_that.phone);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String name,  String relationship,  String phone)  $default,) {final _that = this;
switch (_that) {
case _EmergencyContact():
return $default(_that.name,_that.relationship,_that.phone);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String name,  String relationship,  String phone)?  $default,) {final _that = this;
switch (_that) {
case _EmergencyContact() when $default != null:
return $default(_that.name,_that.relationship,_that.phone);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _EmergencyContact implements EmergencyContact {
  const _EmergencyContact({required this.name, required this.relationship, required this.phone});
  factory _EmergencyContact.fromJson(Map<String, dynamic> json) => _$EmergencyContactFromJson(json);

@override final  String name;
@override final  String relationship;
@override final  String phone;

/// Create a copy of EmergencyContact
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EmergencyContactCopyWith<_EmergencyContact> get copyWith => __$EmergencyContactCopyWithImpl<_EmergencyContact>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$EmergencyContactToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _EmergencyContact&&(identical(other.name, name) || other.name == name)&&(identical(other.relationship, relationship) || other.relationship == relationship)&&(identical(other.phone, phone) || other.phone == phone));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,name,relationship,phone);
}

@override
String toString() {
    return 'EmergencyContact(name: $name, relationship: $relationship, phone: $phone)';
}


}

/// @nodoc
abstract mixin class _$EmergencyContactCopyWith<$Res> implements $EmergencyContactCopyWith<$Res> {
  factory _$EmergencyContactCopyWith(_EmergencyContact value, $Res Function(_EmergencyContact) _then) = __$EmergencyContactCopyWithImpl;
@override @useResult
$Res call({
 String name, String relationship, String phone
});




}
/// @nodoc
class __$EmergencyContactCopyWithImpl<$Res>
    implements _$EmergencyContactCopyWith<$Res> {
  __$EmergencyContactCopyWithImpl(this._self, this._then);

  final _EmergencyContact _self;
  final $Res Function(_EmergencyContact) _then;

/// Create a copy of EmergencyContact
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? name = null,Object? relationship = null,Object? phone = null,}) {
  return _then(_EmergencyContact(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,relationship: null == relationship ? _self.relationship : relationship // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$PatientProfile {

 String get id; String get name; String get email; String get phone; String get location; String get initials; String? get photo; String? get preferredLanguage; EmergencyContact? get emergencyContact; String? get medicalNotes; String? get insuranceProvider; String? get insurancePolicyNumber;
/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PatientProfileCopyWith<PatientProfile> get copyWith => _$PatientProfileCopyWithImpl<PatientProfile>(this as PatientProfile, _$identity);

  /// Serializes this PatientProfile to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as PatientProfile;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PatientProfile&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.email, _this.email) || other.email == _this.email)&&(identical(other.phone, _this.phone) || other.phone == _this.phone)&&(identical(other.location, _this.location) || other.location == _this.location)&&(identical(other.initials, _this.initials) || other.initials == _this.initials)&&(identical(other.photo, _this.photo) || other.photo == _this.photo)&&(identical(other.preferredLanguage, _this.preferredLanguage) || other.preferredLanguage == _this.preferredLanguage)&&(identical(other.emergencyContact, _this.emergencyContact) || other.emergencyContact == _this.emergencyContact)&&(identical(other.medicalNotes, _this.medicalNotes) || other.medicalNotes == _this.medicalNotes)&&(identical(other.insuranceProvider, _this.insuranceProvider) || other.insuranceProvider == _this.insuranceProvider)&&(identical(other.insurancePolicyNumber, _this.insurancePolicyNumber) || other.insurancePolicyNumber == _this.insurancePolicyNumber));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as PatientProfile;
  return Object.hash(runtimeType,_this.id,_this.name,_this.email,_this.phone,_this.location,_this.initials,_this.photo,_this.preferredLanguage,_this.emergencyContact,_this.medicalNotes,_this.insuranceProvider,_this.insurancePolicyNumber);
}

@override
String toString() {
  final _this = this as PatientProfile;
  return 'PatientProfile(id: ${_this.id}, name: ${_this.name}, email: ${_this.email}, phone: ${_this.phone}, location: ${_this.location}, initials: ${_this.initials}, photo: ${_this.photo}, preferredLanguage: ${_this.preferredLanguage}, emergencyContact: ${_this.emergencyContact}, medicalNotes: ${_this.medicalNotes}, insuranceProvider: ${_this.insuranceProvider}, insurancePolicyNumber: ${_this.insurancePolicyNumber})';
}


}

/// @nodoc
abstract mixin class $PatientProfileCopyWith<$Res>  {
  factory $PatientProfileCopyWith(PatientProfile value, $Res Function(PatientProfile) _then) = _$PatientProfileCopyWithImpl;
@useResult
$Res call({
 String id, String name, String email, String phone, String location, String initials, String? photo, String? preferredLanguage, EmergencyContact? emergencyContact, String? medicalNotes, String? insuranceProvider, String? insurancePolicyNumber
});


$EmergencyContactCopyWith<$Res>? get emergencyContact;

}
/// @nodoc
class _$PatientProfileCopyWithImpl<$Res>
    implements $PatientProfileCopyWith<$Res> {
  _$PatientProfileCopyWithImpl(this._self, this._then);

  final PatientProfile _self;
  final $Res Function(PatientProfile) _then;

/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? email = null,Object? phone = null,Object? location = null,Object? initials = null,Object? photo = freezed,Object? preferredLanguage = freezed,Object? emergencyContact = freezed,Object? medicalNotes = freezed,Object? insuranceProvider = freezed,Object? insurancePolicyNumber = freezed,}) {
  return _then(PatientProfile(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,initials: null == initials ? _self.initials : initials // ignore: cast_nullable_to_non_nullable
as String,photo: freezed == photo ? _self.photo : photo // ignore: cast_nullable_to_non_nullable
as String?,preferredLanguage: freezed == preferredLanguage ? _self.preferredLanguage : preferredLanguage // ignore: cast_nullable_to_non_nullable
as String?,emergencyContact: freezed == emergencyContact ? _self.emergencyContact : emergencyContact // ignore: cast_nullable_to_non_nullable
as EmergencyContact?,medicalNotes: freezed == medicalNotes ? _self.medicalNotes : medicalNotes // ignore: cast_nullable_to_non_nullable
as String?,insuranceProvider: freezed == insuranceProvider ? _self.insuranceProvider : insuranceProvider // ignore: cast_nullable_to_non_nullable
as String?,insurancePolicyNumber: freezed == insurancePolicyNumber ? _self.insurancePolicyNumber : insurancePolicyNumber // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}
/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmergencyContactCopyWith<$Res>? get emergencyContact {
    if (_self.emergencyContact == null) {
    return null;
  }

  return $EmergencyContactCopyWith<$Res>(_self.emergencyContact!, (value) {
    return _then(_self.copyWith(emergencyContact: value));
  });
}
}


/// Adds pattern-matching-related methods to [PatientProfile].
extension PatientProfilePatterns on PatientProfile {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PatientProfile value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PatientProfile() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PatientProfile value)  $default,){
final _that = this;
switch (_that) {
case _PatientProfile():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PatientProfile value)?  $default,){
final _that = this;
switch (_that) {
case _PatientProfile() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String email,  String phone,  String location,  String initials,  String? photo,  String? preferredLanguage,  EmergencyContact? emergencyContact,  String? medicalNotes,  String? insuranceProvider,  String? insurancePolicyNumber)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PatientProfile() when $default != null:
return $default(_that.id,_that.name,_that.email,_that.phone,_that.location,_that.initials,_that.photo,_that.preferredLanguage,_that.emergencyContact,_that.medicalNotes,_that.insuranceProvider,_that.insurancePolicyNumber);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String email,  String phone,  String location,  String initials,  String? photo,  String? preferredLanguage,  EmergencyContact? emergencyContact,  String? medicalNotes,  String? insuranceProvider,  String? insurancePolicyNumber)  $default,) {final _that = this;
switch (_that) {
case _PatientProfile():
return $default(_that.id,_that.name,_that.email,_that.phone,_that.location,_that.initials,_that.photo,_that.preferredLanguage,_that.emergencyContact,_that.medicalNotes,_that.insuranceProvider,_that.insurancePolicyNumber);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String email,  String phone,  String location,  String initials,  String? photo,  String? preferredLanguage,  EmergencyContact? emergencyContact,  String? medicalNotes,  String? insuranceProvider,  String? insurancePolicyNumber)?  $default,) {final _that = this;
switch (_that) {
case _PatientProfile() when $default != null:
return $default(_that.id,_that.name,_that.email,_that.phone,_that.location,_that.initials,_that.photo,_that.preferredLanguage,_that.emergencyContact,_that.medicalNotes,_that.insuranceProvider,_that.insurancePolicyNumber);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PatientProfile implements PatientProfile {
  const _PatientProfile({required this.id, required this.name, required this.email, required this.phone, required this.location, required this.initials, this.photo, this.preferredLanguage, this.emergencyContact, this.medicalNotes, this.insuranceProvider, this.insurancePolicyNumber});
  factory _PatientProfile.fromJson(Map<String, dynamic> json) => _$PatientProfileFromJson(json);

@override final  String id;
@override final  String name;
@override final  String email;
@override final  String phone;
@override final  String location;
@override final  String initials;
@override final  String? photo;
@override final  String? preferredLanguage;
@override final  EmergencyContact? emergencyContact;
@override final  String? medicalNotes;
@override final  String? insuranceProvider;
@override final  String? insurancePolicyNumber;

/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PatientProfileCopyWith<_PatientProfile> get copyWith => __$PatientProfileCopyWithImpl<_PatientProfile>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PatientProfileToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _PatientProfile&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.email, email) || other.email == email)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.location, location) || other.location == location)&&(identical(other.initials, initials) || other.initials == initials)&&(identical(other.photo, photo) || other.photo == photo)&&(identical(other.preferredLanguage, preferredLanguage) || other.preferredLanguage == preferredLanguage)&&(identical(other.emergencyContact, emergencyContact) || other.emergencyContact == emergencyContact)&&(identical(other.medicalNotes, medicalNotes) || other.medicalNotes == medicalNotes)&&(identical(other.insuranceProvider, insuranceProvider) || other.insuranceProvider == insuranceProvider)&&(identical(other.insurancePolicyNumber, insurancePolicyNumber) || other.insurancePolicyNumber == insurancePolicyNumber));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,name,email,phone,location,initials,photo,preferredLanguage,emergencyContact,medicalNotes,insuranceProvider,insurancePolicyNumber);
}

@override
String toString() {
    return 'PatientProfile(id: $id, name: $name, email: $email, phone: $phone, location: $location, initials: $initials, photo: $photo, preferredLanguage: $preferredLanguage, emergencyContact: $emergencyContact, medicalNotes: $medicalNotes, insuranceProvider: $insuranceProvider, insurancePolicyNumber: $insurancePolicyNumber)';
}


}

/// @nodoc
abstract mixin class _$PatientProfileCopyWith<$Res> implements $PatientProfileCopyWith<$Res> {
  factory _$PatientProfileCopyWith(_PatientProfile value, $Res Function(_PatientProfile) _then) = __$PatientProfileCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String email, String phone, String location, String initials, String? photo, String? preferredLanguage, EmergencyContact? emergencyContact, String? medicalNotes, String? insuranceProvider, String? insurancePolicyNumber
});


@override $EmergencyContactCopyWith<$Res>? get emergencyContact;

}
/// @nodoc
class __$PatientProfileCopyWithImpl<$Res>
    implements _$PatientProfileCopyWith<$Res> {
  __$PatientProfileCopyWithImpl(this._self, this._then);

  final _PatientProfile _self;
  final $Res Function(_PatientProfile) _then;

/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? email = null,Object? phone = null,Object? location = null,Object? initials = null,Object? photo = freezed,Object? preferredLanguage = freezed,Object? emergencyContact = freezed,Object? medicalNotes = freezed,Object? insuranceProvider = freezed,Object? insurancePolicyNumber = freezed,}) {
  return _then(_PatientProfile(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,initials: null == initials ? _self.initials : initials // ignore: cast_nullable_to_non_nullable
as String,photo: freezed == photo ? _self.photo : photo // ignore: cast_nullable_to_non_nullable
as String?,preferredLanguage: freezed == preferredLanguage ? _self.preferredLanguage : preferredLanguage // ignore: cast_nullable_to_non_nullable
as String?,emergencyContact: freezed == emergencyContact ? _self.emergencyContact : emergencyContact // ignore: cast_nullable_to_non_nullable
as EmergencyContact?,medicalNotes: freezed == medicalNotes ? _self.medicalNotes : medicalNotes // ignore: cast_nullable_to_non_nullable
as String?,insuranceProvider: freezed == insuranceProvider ? _self.insuranceProvider : insuranceProvider // ignore: cast_nullable_to_non_nullable
as String?,insurancePolicyNumber: freezed == insurancePolicyNumber ? _self.insurancePolicyNumber : insurancePolicyNumber // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

/// Create a copy of PatientProfile
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EmergencyContactCopyWith<$Res>? get emergencyContact {
    if (_self.emergencyContact == null) {
    return null;
  }

  return $EmergencyContactCopyWith<$Res>(_self.emergencyContact!, (value) {
    return _then(_self.copyWith(emergencyContact: value));
  });
}
}

// dart format on
