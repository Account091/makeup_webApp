import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/analytics_validation_entity.dart';
import '../../../../domain/entities/destination_wedding_entity.dart';
import '../../../../domain/entities/location_entity.dart';
import '../../../common/widgets/custom_button.dart';

class LocationManagementScreen extends StatefulWidget {
  const LocationManagementScreen({super.key});

  @override
  State<LocationManagementScreen> createState() =>
      _LocationManagementScreenState();
}

class _LocationManagementScreenState extends State<LocationManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  // Selected Hub & Data
  late List<LocationEntity> _locations;
  late LocationEntity _selectedLocation;
  late DataHealthReport _dataHealth;
  late List<DestinationWeddingEntity> _destinationWeddings;

  // Destination Quote Form State
  final _brideNameController = TextEditingController(text: 'Priya Rathore');
  final _destinationCityController = TextEditingController(text: 'Udaipur');
  final _venueController = TextEditingController(text: 'Taj Lake Palace');
  String _selectedTravelMode = 'Flight';
  double _calculatedQuoteTotal = 87000.0;
  bool _isQuoteGenerated = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadLocationData();
  }

  void _loadLocationData() {
    _locations = [
      const LocationEntity(
        locationId: 'loc_jodhpur',
        name: 'Makeovers by Prachi — Main Flagship Studio',
        city: 'Jodhpur',
        state: 'Rajasthan',
        country: 'India',
        timezone: 'Asia/Kolkata',
        address: 'Shastri Nagar, Jodhpur, Rajasthan 342003',
        isActive: true,
        cityTier: 'TIER_2',
        defaultBaseTravelFee: 0.0,
        cityPricingMap: {
          'serv_1': 18000.0,
          'serv_2': 12000.0,
        },
      ),
      const LocationEntity(
        locationId: 'loc_jaipur',
        name: 'Makeovers by Prachi — Pink City Studio Hub',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        timezone: 'Asia/Kolkata',
        address: 'C-Scheme, Jaipur, Rajasthan 302001',
        isActive: true,
        cityTier: 'TIER_1',
        defaultBaseTravelFee: 4000.0,
        cityPricingMap: {
          'serv_1': 20000.0,
          'serv_2': 14000.0,
        },
      ),
      const LocationEntity(
        locationId: 'loc_udaipur',
        name: 'Makeovers by Prachi — Lake City Studio Hub',
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        timezone: 'Asia/Kolkata',
        address: 'Fateh Sagar Lake Road, Udaipur 313001',
        isActive: true,
        cityTier: 'TIER_1',
        defaultBaseTravelFee: 5000.0,
        cityPricingMap: {
          'serv_1': 22000.0,
          'serv_2': 15000.0,
        },
      ),
    ];

    _selectedLocation = _locations[0];

    _dataHealth = const DataHealthReport(
      healthScorePercent: 99.7,
      totalRecordsEvaluated: 1420,
      anomaliesFoundCount: 2,
      freshnessTimestamp: '2026-09-12 14:14',
      anomalies: [
        DataAnomaly(
          collectionName: 'bookings',
          documentId: 'bk_998',
          anomalyType: 'MISSING_FIELDS',
          description: 'Inquiry missing phone contact field.',
          severity: 'WARNING',
        ),
      ],
      metricTypeLabels: {
        'actual': 'Actual Measured Data',
        'projected': 'Projected Trend',
        'forecast': 'Moving Average Forecast',
        'estimated': 'Estimated Multiplier',
      },
    );

    _destinationWeddings = [
      DestinationWeddingEntity(
        weddingId: 'dest_1',
        customerId: 'cust_101',
        brideName: 'Rhea Kapoor',
        originCity: 'Jodhpur',
        destinationCity: 'Udaipur',
        venueName: 'The Leela Palace Udaipur',
        startDate: DateTime.now().add(const Duration(days: 45)),
        endDate: DateTime.now().add(const Duration(days: 47)),
        assignedTeamIds: const ['art_1', 'art_2'],
        travelMode: 'Flight',
        travelDurationHours: 3,
        accommodationDetails: 'Luxury Heritage Suite',
        travelFee: 24000.0,
        stayFee: 18000.0,
        outstationBufferDays: 1,
        totalQuote: 107000.0,
        status: 'CONFIRMED',
      ),
    ];
  }

  @override
  void dispose() {
    _tabController.dispose();
    _brideNameController.dispose();
    _destinationCityController.dispose();
    _venueController.dispose();
    super.dispose();
  }

  void _calculateDestinationQuote() {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(milliseconds: 500), () {
      setState(() {
        _isLoading = false;
        double baseTravel = _selectedTravelMode == 'Flight' ? 24000.0 : 8000.0;
        double stay = 18000.0;
        double serviceBase = 45000.0;
        _calculatedQuoteTotal = serviceBase + baseTravel + stay;
        _isQuoteGenerated = true;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Multi-City & Destination Weddings',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V7.0 Location Management & Travel Quote Engine',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.roseGold,
          labelColor: AppColors.roseGold,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Studio Hubs'),
            Tab(text: 'Destination Quote'),
            Tab(text: 'Data Health Audit'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.roseGold),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildStudioHubsTab(),
                _buildDestinationQuoteTab(),
                _buildDataHealthTab(),
              ],
            ),
    );
  }

  Widget _buildStudioHubsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Select Active Studio Location Hub', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _locations.map((loc) {
                final isSelected = loc.locationId == _selectedLocation.locationId;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isSelected,
                    label: Text('${loc.city} (${loc.cityTier})'),
                    selectedColor: AppColors.roseGold,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.deepPlum : Colors.black87,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (_) {
                      setState(() {
                        _selectedLocation = loc;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // Location Details Card
          Card(
            elevation: 3,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppColors.roseGold),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_selectedLocation.name, style: AppTextStyles.sectionHeader),
                      Chip(
                        label: Text(_selectedLocation.isActive ? 'ACTIVE' : 'INACTIVE'),
                        backgroundColor: AppColors.emeraldGreen.withValues(alpha: 0.15),
                        labelStyle: const TextStyle(color: AppColors.emeraldGreen, fontSize: 10),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Address: ${_selectedLocation.address}', style: AppTextStyles.bodySecondary),
                  Text('State / Country: ${_selectedLocation.state}, ${_selectedLocation.country}', style: AppTextStyles.bodySecondary),
                  Text('Base Travel Fee: ${AppFormatters.formatCurrency(_selectedLocation.defaultBaseTravelFee)}', style: AppTextStyles.bodySecondary),
                  const Divider(),
                  Text('Regional Price Matrix Overrides', style: AppTextStyles.sectionHeader),
                  const SizedBox(height: 8),
                  ..._selectedLocation.cityPricingMap.entries.map(
                    (entry) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Service ID (${entry.key}):', style: AppTextStyles.bodySecondary),
                          Text(AppFormatters.formatCurrency(entry.value), style: AppTextStyles.sectionHeader.copyWith(color: AppColors.deepPlum)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDestinationQuoteTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Destination Wedding Quote Calculator', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 12),
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: _brideNameController,
                    decoration: const InputDecoration(labelText: 'Bride / Client Name'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _destinationCityController,
                    decoration: const InputDecoration(labelText: 'Destination City (e.g. Udaipur, Jaipur, Goa)'),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _venueController,
                    decoration: const InputDecoration(labelText: 'Palace / Resort Venue Name'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedTravelMode,
                    decoration: const InputDecoration(labelText: 'Travel Mode'),
                    items: ['Flight', 'Train', 'Luxury Cab']
                        .map((mode) => DropdownMenuItem(value: mode, child: Text(mode)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedTravelMode = val);
                    },
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    label: 'Calculate Destination Quote',
                    onPressed: _calculateDestinationQuote,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          if (_isQuoteGenerated)
            Card(
              elevation: 3,
              color: AppColors.deepPlum,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Authoritative Quote Generated',
                      style: AppTextStyles.sectionHeader.copyWith(color: AppColors.roseGold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Destination: ${_destinationCityController.text} (${_venueController.text})',
                      style: AppTextStyles.bodySecondary.copyWith(color: Colors.white),
                    ),
                    Text(
                      'Travel Mode: $_selectedTravelMode (Outstation Travel Buffer: 1 Day)',
                      style: AppTextStyles.bodySecondary.copyWith(color: Colors.white70),
                    ),
                    const Divider(color: Colors.white24),
                    Text(
                      'Total Authoritative Quote: ${AppFormatters.formatCurrency(_calculatedQuoteTotal)}',
                      style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 18),
                    ),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 20),
          Text('Active Destination Bookings', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 8),
          ..._destinationWeddings.map(
            (dest) => Card(
              child: ListTile(
                leading: const Icon(Icons.flight_takeoff, color: AppColors.deepPlum),
                title: Text('${dest.brideName} — ${dest.destinationCity}'),
                subtitle: Text('Venue: ${dest.venueName} | Total: ${AppFormatters.formatCurrency(dest.totalQuote)}'),
                trailing: Text(dest.status, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.emeraldGreen)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataHealthTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Health Score Header Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.emeraldGreen.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.emeraldGreen),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_user, color: AppColors.emeraldGreen, size: 36),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Data Health: ${_dataHealth.healthScorePercent}% Healthy',
                      style: AppTextStyles.headingTitle.copyWith(color: AppColors.emeraldGreen, fontSize: 18),
                    ),
                    Text(
                      '${_dataHealth.totalRecordsEvaluated} Transactional Records Evaluated',
                      style: AppTextStyles.bodySecondary,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text('Analytics Metric Classifications', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 8),
          ..._dataHealth.metricTypeLabels.entries.map(
            (e) => ListTile(
              dense: true,
              leading: const Icon(Icons.label, color: AppColors.roseGold, size: 18),
              title: Text(e.key.toUpperCase(), style: AppTextStyles.sectionHeader.copyWith(fontSize: 12)),
              subtitle: Text(e.value, style: AppTextStyles.bodySecondary),
            ),
          ),
          const SizedBox(height: 20),

          Text('Detected Data Quality Warnings (${_dataHealth.anomaliesFoundCount})', style: AppTextStyles.sectionHeader),
          const SizedBox(height: 8),
          ..._dataHealth.anomalies.map(
            (anomaly) => Card(
              child: ListTile(
                leading: const Icon(Icons.warning, color: AppColors.statusAwaitingApproval),
                title: Text('[${anomaly.collectionName}] ${anomaly.anomalyType}'),
                subtitle: Text(anomaly.description),
                trailing: Text(anomaly.severity, style: const TextStyle(color: AppColors.statusAwaitingApproval, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
