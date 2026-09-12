import '../entities/service_entity.dart';

abstract class IServiceRepository {
  Future<List<ServiceEntity>> getServices();
  Future<List<PackageEntity>> getPackagesForService(String serviceId);
}
