enum ArtistRole { owner, admin, manager, makeupArtist, hairArtist, drapingArtist, contentManager, accountant, support }
enum ArtistSkill { bridalMakeup, partyMakeup, airbrush, rajasthaniPoshak, hairStyling, draping, sariDraping }

class ArtistEntity {
  final String artistId;
  final String name;
  final String profilePhoto;
  final String bio;
  final ArtistRole role;
  final List<ArtistSkill> skills;
  final List<String> supportedLocations;
  final double basePricing;
  final double rating;
  final int experienceYears;
  final bool isActive;

  const ArtistEntity({
    required this.artistId,
    required this.name,
    required this.profilePhoto,
    required this.bio,
    required this.role,
    required this.skills,
    required this.supportedLocations,
    required this.basePricing,
    required this.rating,
    required this.experienceYears,
    required this.isActive,
  });
}

class BookingAssignmentEntity {
  final String assignmentId;
  final String bookingId;
  final String artistId;
  final String artistName;
  final String serviceTitle;
  final ArtistRole assignedRole;
  final DateTime startTime;
  final DateTime endTime;
  final String status; // PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
  final double commissionAmount;
  final String? notes;

  const BookingAssignmentEntity({
    required this.assignmentId,
    required this.bookingId,
    required this.artistId,
    required this.artistName,
    required this.serviceTitle,
    required this.assignedRole,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.commissionAmount,
    this.notes,
  });
}

class StudioResourceEntity {
  final String resourceId;
  final String resourceName;
  final String resourceType; // ROOM | MAKEUP_STATION | HAIR_STATION | EQUIPMENT
  final int capacity;
  final String location;
  final bool isAvailable;

  const StudioResourceEntity({
    required this.resourceId,
    required this.resourceName,
    required this.resourceType,
    required this.capacity,
    required this.location,
    required this.isAvailable,
  });
}
