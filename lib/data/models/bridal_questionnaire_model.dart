import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/bridal_questionnaire_entity.dart';

class BridalQuestionnaireModel extends BridalQuestionnaireEntity {
  const BridalQuestionnaireModel({
    required super.id,
    required super.customerId,
    super.weddingId,
    super.version,
    required super.skinType,
    required super.desiredFinish,
    required super.coverage,
    required super.eyeStyle,
    required super.lipPreference,
    required super.hairPreference,
    required super.drapingPreference,
    required super.allergies,
    super.canUsePhotosInPortfolio,
    super.status,
    required super.updatedBy,
    required super.changeReason,
    required super.createdAt,
  });

  factory BridalQuestionnaireModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    QuestionnaireStatus parseStatus(String? val) {
      switch (val) {
        case 'APPROVED_FINAL':
          return QuestionnaireStatus.approvedFinal;
        case 'DRAFT':
          return QuestionnaireStatus.draft;
        default:
          return QuestionnaireStatus.submitted;
      }
    }

    return BridalQuestionnaireModel(
      id: doc.id,
      customerId: data['customerId'] ?? '',
      weddingId: data['weddingId'],
      version: (data['version'] as num?)?.toInt() ?? 1,
      skinType: data['skinType'] ?? 'Normal',
      desiredFinish: data['desiredFinish'] ?? 'Natural',
      coverage: data['coverage'] ?? 'HD Airbrush',
      eyeStyle: data['eyeStyle'] ?? 'Soft Smokey',
      lipPreference: data['lipPreference'] ?? 'Nude Rose',
      hairPreference: data['hairPreference'] ?? 'Royal Bun',
      drapingPreference: data['drapingPreference'] ?? 'Double Dupatta',
      allergies: List<String>.from(data['allergies'] ?? []),
      canUsePhotosInPortfolio: data['canUsePhotosInPortfolio'] ?? false,
      status: parseStatus(data['status']),
      updatedBy: data['updatedBy'] ?? 'Customer',
      changeReason: data['changeReason'] ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'customerId': customerId,
      'weddingId': weddingId,
      'version': version,
      'skinType': skinType,
      'desiredFinish': desiredFinish,
      'coverage': coverage,
      'eyeStyle': eyeStyle,
      'lipPreference': lipPreference,
      'hairPreference': hairPreference,
      'drapingPreference': drapingPreference,
      'allergies': allergies,
      'canUsePhotosInPortfolio': canUsePhotosInPortfolio,
      'status': status == QuestionnaireStatus.approvedFinal ? 'APPROVED_FINAL' : (status == QuestionnaireStatus.draft ? 'DRAFT' : 'SUBMITTED'),
      'updatedBy': updatedBy,
      'changeReason': changeReason,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
