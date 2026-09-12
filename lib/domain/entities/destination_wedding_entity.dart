class DestinationWeddingEntity {
  final String weddingId;
  final String customerId;
  final String brideName;
  final String originCity;
  final String destinationCity;
  final String venueName;
  final DateTime startDate;
  final DateTime endDate;
  final List<String> assignedTeamIds;
  final String travelMode; // Flight, Train, Luxury Cab
  final int travelDurationHours;
  final String accommodationDetails;
  final double travelFee;
  final double stayFee;
  final int outstationBufferDays;
  final double totalQuote;
  final String status; // QUOTE_DRAFT, CONFIRMED, COMPLETED

  const DestinationWeddingEntity({
    required this.weddingId,
    required this.customerId,
    required this.brideName,
    required this.originCity,
    required this.destinationCity,
    required this.venueName,
    required this.startDate,
    required this.endDate,
    required this.assignedTeamIds,
    required this.travelMode,
    required this.travelDurationHours,
    required this.accommodationDetails,
    required this.travelFee,
    required this.stayFee,
    required this.outstationBufferDays,
    required this.totalQuote,
    required this.status,
  });
}
