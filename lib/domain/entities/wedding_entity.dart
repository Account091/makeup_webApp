import 'package:equatable/equatable.dart';

class WeddingEntity extends Equatable {
  final String id;
  final String customerId;
  final String brideName;
  final String? groomName;
  final DateTime weddingDate;
  final String city;
  final List<String> functionIds;
  final DateTime createdAt;

  const WeddingEntity({
    required this.id,
    required this.customerId,
    required this.brideName,
    this.groomName,
    required this.weddingDate,
    required this.city,
    required this.functionIds,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, customerId, brideName, groomName, weddingDate, city, functionIds, createdAt];
}
