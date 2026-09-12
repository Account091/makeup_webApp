import '../../domain/entities/artist_entity.dart';

class ArtistModel extends ArtistEntity {
  const ArtistModel({
    required super.artistId,
    required super.name,
    required super.profilePhoto,
    required super.bio,
    required super.role,
    required super.skills,
    required super.supportedLocations,
    required super.basePricing,
    required super.rating,
    required super.experienceYears,
    required super.isActive,
  });

  factory ArtistModel.fromJson(Map<String, dynamic> json, String id) {
    return ArtistModel(
      artistId: id,
      name: json['name'] ?? '',
      profilePhoto: json['profilePhoto'] ?? '',
      bio: json['bio'] ?? '',
      role: ArtistRole.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['role'] ?? '').toString().toLowerCase(),
        orElse: () => ArtistRole.makeupArtist,
      ),
      skills: (json['skills'] as List<dynamic>? ?? []).map((s) {
        return ArtistSkill.values.firstWhere(
          (e) => e.name.toLowerCase() == s.toString().toLowerCase(),
          orElse: () => ArtistSkill.bridalMakeup,
        );
      }).toList(),
      supportedLocations: List<String>.from(json['supportedLocations'] ?? []),
      basePricing: (json['basePricing'] ?? 0).toDouble(),
      rating: (json['rating'] ?? 5.0).toDouble(),
      experienceYears: json['experienceYears'] ?? 1,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'artistId': artistId,
      'name': name,
      'profilePhoto': profilePhoto,
      'bio': bio,
      'role': role.name,
      'skills': skills.map((s) => s.name).toList(),
      'supportedLocations': supportedLocations,
      'basePricing': basePricing,
      'rating': rating,
      'experienceYears': experienceYears,
      'isActive': isActive,
    };
  }
}
