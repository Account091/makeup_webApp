import '../datasources/service_remote_datasource.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/repositories/i_service_repository.dart';

class ServiceRepositoryImpl implements IServiceRepository {
  final ServiceRemoteDataSource? remoteDataSource;

  ServiceRepositoryImpl({this.remoteDataSource});

  final List<ServiceEntity> _services = const [
    ServiceEntity(
      id: 'srv_bridal',
      title: 'Bridal Makeover & Styling',
      category: 'Bridal',
      description:
          'Comprehensive luxury bridal look with long-lasting HD/Airbrush finish, hair styling, poshak draping, and royal jewelry setting.',
      priceMode: PriceMode.startingAt,
      startingPrice: 15000,
      duration: '3.5 - 4 Hours',
      inclusions: [
        'HD / Airbrush Makeup',
        'Traditional Rajasthani Poshak & Dupatta Draping',
        'Hair Styling & Accessories Placement',
        'Lashes & Touch-up Kit Included',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      isFeatured: true,
    ),
    ServiceEntity(
      id: 'srv_engagement',
      title: 'Pre-Wedding & Engagement Glam',
      category: 'Engagement',
      description:
          'Soft, romantic, and dewy glam customized for engagement ceremonies, sangeet, and pre-wedding shoots.',
      priceMode: PriceMode.startingAt,
      startingPrice: 8000,
      duration: '2.5 Hours',
      inclusions: [
        'Dewy / Soft Glam Makeup',
        'Designer Hair Styling',
        'Eyelashes & Setting Spray',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      isFeatured: true,
    ),
    ServiceEntity(
      id: 'srv_party',
      title: 'Party & Festive Makeover',
      category: 'Party',
      description:
          'Elegant makeup for bridesmaids, family members, and festive celebrations.',
      priceMode: PriceMode.startingAt,
      startingPrice: 3500,
      duration: '1.5 Hours',
      inclusions: [
        'Party Makeup',
        'Standard Hairstyling',
        'Dupatta Setting',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
    ),
    ServiceEntity(
      id: 'srv_outstation',
      title: 'Destination & Outstation Bridal',
      category: 'Destination',
      description:
          'Full-day or multi-day bridal makeup team travel across Rajasthan and India.',
      priceMode: PriceMode.priceOnRequest,
      startingPrice: 0,
      duration: 'Multi-Day',
      inclusions: [
        'Bridal + Reception Looks',
        'On-venue Travel Assistance',
        'Dedicated Touch-up Sessions',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      isFeatured: true,
    ),
  ];

  @override
  Future<List<ServiceEntity>> getServices() async {
    if (remoteDataSource != null) {
      try {
        final remote = await remoteDataSource!.fetchServices();
        if (remote.isNotEmpty) return remote;
      } catch (_) {}
    }
    await Future.delayed(const Duration(milliseconds: 300));
    return _services;
  }

  @override
  Future<List<PackageEntity>> getPackagesForService(String serviceId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return [
      PackageEntity(
        id: 'pkg_royal_bridal',
        serviceId: 'srv_bridal',
        packageName: 'Royal Rajasthani Signature Package',
        description: 'Complete luxury bridal experience with Poshak draping.',
        amount: 22000,
        priceMode: PriceMode.startingAt,
        inclusions: const [
          'Airbrush Bridal Makeup',
          'Heavy Jewelry & Poshak Draping',
          'Premium Hair Extensions Placement',
          'Complimentary Mini Touch-up Kit'
        ],
        addOns: const ['Extra Look Change', 'Bridesmaid Makeup'],
        idealFor: 'Royal Rajasthan Wedding',
        isFeatured: true,
      ),
    ];
  }
}
