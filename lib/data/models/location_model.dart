import '../../domain/entities/location_entity.dart';

class LocationModel extends LocationEntity {
  const LocationModel({
    required super.locationId,
    required super.name,
    required super.city,
    required super.state,
    required super.country,
    required super.timezone,
    required super.address,
    required super.isActive,
    required super.cityTier,
    required super.defaultBaseTravelFee,
    required super.cityPricingMap,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      locationId: json['locationId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      country: json['country'] as String? ?? 'India',
      timezone: json['timezone'] as String? ?? 'Asia/Kolkata',
      address: json['address'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      cityTier: json['cityTier'] as String? ?? 'TIER_2',
      defaultBaseTravelFee: (json['defaultBaseTravelFee'] as num?)?.toDouble() ?? 0.0,
      cityPricingMap: (json['cityPricingMap'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, (v as num).toDouble())) ??
          {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'locationId': locationId,
      'name': name,
      'city': city,
      'state': state,
      'country': country,
      'timezone': timezone,
      'address': address,
      'isActive': isActive,
      'cityTier': cityTier,
      'defaultBaseTravelFee': defaultBaseTravelFee,
      'cityPricingMap': cityPricingMap,
    };
  }
}
