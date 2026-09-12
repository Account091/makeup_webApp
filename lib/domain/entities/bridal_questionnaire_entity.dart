import 'package:equatable/equatable.dart';

enum QuestionnaireStatus { draft, submitted, approvedFinal }

class BridalQuestionnaireEntity extends Equatable {
  final String id;
  final String customerId;
  final String? weddingId;
  final int version;
  final String skinType; // Dry | Normal | Combination | Oily
  final String desiredFinish; // Dewy | Natural | Matte | Radiant
  final String coverage; // Light | Medium | Full | HD Airbrush
  final String eyeStyle; // Soft | Defined | Smokey | Traditional
  final String lipPreference; // Nude | Pink | Red | Custom
  final String hairPreference; // Open | Bun | Braids | Traditional
  final String drapingPreference; // Poshak | Dupatta | Saree | Custom
  final List<String> allergies;
  final bool canUsePhotosInPortfolio; // Explicit photography consent
  final QuestionnaireStatus status;
  final String updatedBy;
  final String changeReason;
  final DateTime createdAt;

  const BridalQuestionnaireEntity({
    required this.id,
    required this.customerId,
    this.weddingId,
    this.version = 1,
    required this.skinType,
    required this.desiredFinish,
    required this.coverage,
    required this.eyeStyle,
    required this.lipPreference,
    required this.hairPreference,
    required this.drapingPreference,
    required this.allergies,
    this.canUsePhotosInPortfolio = false,
    this.status = QuestionnaireStatus.submitted,
    required this.updatedBy,
    required this.changeReason,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        customerId,
        weddingId,
        version,
        skinType,
        desiredFinish,
        coverage,
        eyeStyle,
        lipPreference,
        hairPreference,
        drapingPreference,
        allergies,
        canUsePhotosInPortfolio,
        status,
        updatedBy,
        changeReason,
        createdAt,
      ];
}
