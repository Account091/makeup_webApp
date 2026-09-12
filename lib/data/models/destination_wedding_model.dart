import '../../domain/entities/destination_wedding_entity.dart';

class DestinationWeddingModel extends DestinationWeddingEntity {
  const DestinationWeddingModel({
    required super.weddingId,
    required super.customerId,
    required super.brideName,
    required super.originCity,
    required super.destinationCity,
    required super.venueName,
    required super.startDate,
    required super.endDate,
    required super.assignedTeamIds,
    required super.travelMode,
    required super.travelDurationHours,
    required super.accommodationDetails,
    required super.travelFee,
    required super.stayFee,
    required super.outstationBufferDays,
    required super.totalQuote,
    required super.status,
  });

  factory DestinationWeddingModel.fromJson(Map<String, dynamic> json) {
    return DestinationWeddingModel(
      weddingId: json['weddingId'] as String? ?? '',
      customerId: json['customerId'] as String? ?? '',
      brideName: json['brideName'] as String? ?? '',
      originCity: json['originCity'] as String? ?? 'Jodhpur',
      destinationCity: json['destinationCity'] as String? ?? '',
      venueName: json['venueName'] as String? ?? '',
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'].toString())
          : DateTime.now(),
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'].toString())
          : DateTime.now().add(const Duration(days: 2)),
      assignedTeamIds: (json['assignedTeamIds'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      travelMode: json['travelMode'] as String? ?? 'Flight',
      travelDurationHours: json['travelDurationHours'] as int? ?? 4,
      accommodationDetails: json['accommodationDetails'] as String? ?? '',
      travelFee: (json['travelFee'] as num?)?.toDouble() ?? 0.0,
      stayFee: (json['stayFee'] as num?)?.toDouble() ?? 0.0,
      outstationBufferDays: json['outstationBufferDays'] as int? ?? 1,
      totalQuote: (json['totalQuote'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'QUOTE_DRAFT',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'weddingId': weddingId,
      'customerId': customerId,
      'brideName': brideName,
      'originCity': originCity,
      'destinationCity': destinationCity,
      'venueName': venueName,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'assignedTeamIds': assignedTeamIds,
      'travelMode': travelMode,
      'travelDurationHours': travelDurationHours,
      'accommodationDetails': accommodationDetails,
      'travelFee': travelFee,
      'stayFee': stayFee,
      'outstationBufferDays': outstationBufferDays,
      'totalQuote': totalQuote,
      'status': status,
    };
  }
}
