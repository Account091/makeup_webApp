import 'package:equatable/equatable.dart';

enum PriceMode {
  startingAt,
  fixedPrice,
  priceOnRequest,
  customQuote,
}

class ServiceEntity extends Equatable {
  final String id;
  final String title;
  final String category;
  final String description;
  final PriceMode priceMode;
  final double startingPrice;
  final String duration;
  final List<String> inclusions;
  final String imageUrl;
  final bool isFeatured;

  const ServiceEntity({
    required this.id,
    required this.title,
    required this.category,
    required this.description,
    required this.priceMode,
    required this.startingPrice,
    required this.duration,
    required this.inclusions,
    required this.imageUrl,
    this.isFeatured = false,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        category,
        description,
        priceMode,
        startingPrice,
        duration,
        inclusions,
        imageUrl,
        isFeatured,
      ];
}

class PackageEntity extends Equatable {
  final String id;
  final String serviceId;
  final String packageName;
  final String description;
  final double amount;
  final PriceMode priceMode;
  final List<String> inclusions;
  final List<String> addOns;
  final String idealFor;
  final bool isFeatured;

  const PackageEntity({
    required this.id,
    required this.serviceId,
    required this.packageName,
    required this.description,
    required this.amount,
    required this.priceMode,
    required this.inclusions,
    required this.addOns,
    required this.idealFor,
    this.isFeatured = false,
  });

  @override
  List<Object?> get props => [
        id,
        serviceId,
        packageName,
        description,
        amount,
        priceMode,
        inclusions,
        addOns,
        idealFor,
        isFeatured,
      ];
}
