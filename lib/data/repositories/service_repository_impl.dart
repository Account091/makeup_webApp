import '../datasources/service_remote_datasource.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/repositories/i_service_repository.dart';

/// Legacy read-only service repository (parked screens). Reads the live
/// `services` collection only; errors propagate.
class ServiceRepositoryImpl implements IServiceRepository {
  final ServiceRemoteDataSource remoteDataSource;

  ServiceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<ServiceEntity>> getServices() => remoteDataSource.fetchServices();

  @override
  Future<List<PackageEntity>> getPackagesForService(String serviceId) async =>
      const [];
}
