import 'package:equatable/equatable.dart';

class BridalConsultationEntity extends Equatable {
  final String id;
  final String customerId;
  final String skinType; // e.g. "Sensitive / Dry"
  final String coveragePreference; // e.g. "Full Coverage HD Airbrush"
  final String eyeStylePreference; // e.g. "Soft Smokey Gold Cut Crease"
  final String lipPreference; // e.g. "Nude Mauve Rose"
  final String hairPreference; // e.g. "Traditional Royal Bun with Fresh Flowers"
  final String drapingStyle; // e.g. "Double Dupatta Rajasthani Poshak Draping"
  final List<String> allergies;
  final bool patchTestCompleted;
  final String consultationNotes;

  const BridalConsultationEntity({
    required this.id,
    required this.customerId,
    required this.skinType,
    required this.coveragePreference,
    required this.eyeStylePreference,
    required this.lipPreference,
    required this.hairPreference,
    required this.drapingStyle,
    required this.allergies,
    this.patchTestCompleted = false,
    required this.consultationNotes,
  });

  @override
  List<Object?> get props => [
        id,
        customerId,
        skinType,
        coveragePreference,
        eyeStylePreference,
        lipPreference,
        hairPreference,
        drapingStyle,
        allergies,
        patchTestCompleted,
        consultationNotes,
      ];
}
