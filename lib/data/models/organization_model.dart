import '../../domain/entities/organization_entity.dart';

class OrganizationModel extends OrganizationEntity {
  const OrganizationModel({
    required super.organizationId,
    required super.name,
    required super.ownerId,
    required super.type,
    required super.verificationStatus,
    required super.city,
    required super.rating,
    required super.reviewCount,
    required super.commissionRatePercent,
  });

  factory OrganizationModel.fromJson(Map<String, dynamic> json) {
    return OrganizationModel(
      organizationId: json['organizationId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      ownerId: json['ownerId'] as String? ?? '',
      type: json['type'] as String? ?? 'INDIVIDUAL_ARTIST',
      verificationStatus: json['verificationStatus'] as String? ?? 'PENDING',
      city: json['city'] as String? ?? 'Jodhpur',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['reviewCount'] as int? ?? 0,
      commissionRatePercent: (json['commissionRatePercent'] as num?)?.toDouble() ?? 10.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'organizationId': organizationId,
      'name': name,
      'ownerId': ownerId,
      'type': type,
      'verificationStatus': verificationStatus,
      'city': city,
      'rating': rating,
      'reviewCount': reviewCount,
      'commissionRatePercent': commissionRatePercent,
    };
  }
}

class OrganizationMembershipModel extends OrganizationMembership {
  const OrganizationMembershipModel({
    required super.membershipId,
    required super.orgId,
    required super.uid,
    required super.role,
    required super.permissions,
  });

  factory OrganizationMembershipModel.fromJson(Map<String, dynamic> json) {
    return OrganizationMembershipModel(
      membershipId: json['membershipId'] as String? ?? '',
      orgId: json['orgId'] as String? ?? '',
      uid: json['uid'] as String? ?? '',
      role: json['role'] as String? ?? 'ARTIST',
      permissions: (json['permissions'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['READ_BOOKINGS', 'RESPOND_INQUIRIES'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'membershipId': membershipId,
      'orgId': orgId,
      'uid': uid,
      'role': role,
      'permissions': permissions,
    };
  }
}
