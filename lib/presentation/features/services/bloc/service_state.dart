import 'package:equatable/equatable.dart';
import '../../../../domain/entities/service_entity.dart';

abstract class ServiceState extends Equatable {
  const ServiceState();

  @override
  List<Object?> get props => [];
}

class ServiceInitialState extends ServiceState {}

class ServiceLoadingState extends ServiceState {}

class ServicesLoadedState extends ServiceState {
  final List<ServiceEntity> services;
  const ServicesLoadedState(this.services);

  @override
  List<Object?> get props => [services];
}

class ServiceErrorState extends ServiceState {
  final String errorMessage;
  const ServiceErrorState(this.errorMessage);

  @override
  List<Object?> get props => [errorMessage];
}
