import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/service_entity.dart';

class ServiceModel extends ServiceEntity {
  const ServiceModel({
    required super.id,
    required super.title,
    required super.category,
    required super.description,
    required super.priceMode,
    required super.startingPrice,
    required super.duration,
    required super.inclusions,
    required super.imageUrl,
    super.isFeatured,
  });

  factory ServiceModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    return ServiceModel(
      id: doc.id,
      title: data['title'] ?? '',
      category: data['category'] ?? '',
      description: data['description'] ?? '',
      priceMode: _parsePriceMode(data['priceMode']),
      startingPrice: (data['startingPrice'] as num?)?.toDouble() ?? 0.0,
      duration: data['duration'] ?? '',
      inclusions: List<String>.from(data['inclusions'] ?? []),
      imageUrl: data['imageUrl'] ?? '',
      isFeatured: data['isFeatured'] ?? false,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'category': category,
      'description': description,
      'priceMode': priceMode.name,
      'startingPrice': startingPrice,
      'duration': duration,
      'inclusions': inclusions,
      'imageUrl': imageUrl,
      'isFeatured': isFeatured,
    };
  }

  static PriceMode _parsePriceMode(String? mode) {
    switch (mode) {
      case 'fixedPrice':
        return PriceMode.fixedPrice;
      case 'priceOnRequest':
        return PriceMode.priceOnRequest;
      case 'customQuote':
        return PriceMode.customQuote;
      case 'startingAt':
      default:
        return PriceMode.startingAt;
    }
  }
}
