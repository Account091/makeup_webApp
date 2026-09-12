class OrganizationEntity {
  final String organizationId;
  final String name;
  final String ownerId;
  final String type; // STUDIO, INDIVIDUAL_ARTIST, SPECIALIST
  final String verificationStatus; // PENDING, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED
  final String city;
  final double rating;
  final int reviewCount;
  final double commissionRatePercent;

  const OrganizationEntity({
    required this.organizationId,
    required this.name,
    required this.ownerId,
    required this.type,
    required this.verificationStatus,
    required this.city,
    required this.rating,
    required this.reviewCount,
    required this.commissionRatePercent,
  });
}

class OrganizationMembership {
  final String membershipId;
  final String orgId;
  final String uid;
  final String role; // OWNER, ARTIST, ASSISTANT, ADMIN
  final List<String> permissions;

  const OrganizationMembership({
    required this.membershipId,
    required this.orgId,
    required this.uid,
    required this.role,
    required this.permissions,
  });
}
