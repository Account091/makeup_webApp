class LocationEntity {
  final String locationId;
  final String name;
  final String city;
  final String state;
  final String country;
  final String timezone;
  final String address;
  final bool isActive;
  final String cityTier; // TIER_1, TIER_2, DESTINATION
  final double defaultBaseTravelFee;
  final Map<String, double> cityPricingMap; // serviceId -> price

  const LocationEntity({
    required this.locationId,
    required this.name,
    required this.city,
    required this.state,
    required this.country,
    required this.timezone,
    required this.address,
    required this.isActive,
    required this.cityTier,
    required this.defaultBaseTravelFee,
    required this.cityPricingMap,
  });
}
