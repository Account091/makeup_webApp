import 'package:equatable/equatable.dart';

enum WeddingFunctionType { mehndi, haldi, sangeet, wedding, reception }

class WeddingFunctionEntity extends Equatable {
  final String id;
  final String weddingId;
  final WeddingFunctionType functionType;
  final DateTime date;
  final String readyByTime; // e.g. "04:30 PM"
  final String venue;
  final int guestCount;
  final String? selectedLookTitle;
  final String? hairStylePreference;
  final String? drapingPoshakStyle;
  final List<String> referenceImageUrls;
  final String notes;

  const WeddingFunctionEntity({
    required this.id,
    required this.weddingId,
    required this.functionType,
    required this.date,
    required this.readyByTime,
    required this.venue,
    this.guestCount = 1,
    this.selectedLookTitle,
    this.hairStylePreference,
    this.drapingPoshakStyle,
    required this.referenceImageUrls,
    this.notes = '',
  });

  @override
  List<Object?> get props => [
        id,
        weddingId,
        functionType,
        date,
        readyByTime,
        venue,
        guestCount,
        selectedLookTitle,
        hairStylePreference,
        drapingPoshakStyle,
        referenceImageUrls,
        notes,
      ];
}
