import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../booking/bloc/booking_bloc.dart';
import '../../booking/bloc/booking_event.dart';
import '../../payment/views/upi_qr_payment_dialog.dart';

class ServiceOptionItem {
  final String title;
  final double price;
  final String duration;
  final String description;
  final List<String> inclusions;

  const ServiceOptionItem({
    required this.title,
    required this.price,
    required this.duration,
    required this.description,
    required this.inclusions,
  });
}

class MultiStepBookingWizard extends StatefulWidget {
  const MultiStepBookingWizard({super.key});

  @override
  State<MultiStepBookingWizard> createState() => _MultiStepBookingWizardState();
}

class _MultiStepBookingWizardState extends State<MultiStepBookingWizard> {
  int _currentStep = 0;

  // Step 1: Service
  String _selectedService = 'Signature Bridal Makeover';
  double _servicePrice = 25000;

  // Step 2: Package
  String _selectedPackage = 'Royal Rajasthani Poshak & Jewelry Package';

  // Step 3: Date & Time
  DateTime _eventDate = DateTime.now().add(const Duration(days: 30));
  String _readyByTime = '16:00';

  // Step 4: Venue & City
  final _venueController = TextEditingController(text: 'Gorbandh Palace');
  final _cityController = TextEditingController(text: 'Jodhpur');

  // Step 5: Guest Count
  int _guestCount = 1;

  // Step 6: Contact Info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  final List<ServiceOptionItem> _servicesList = const [
    ServiceOptionItem(
      title: 'Signature Bridal Makeover',
      price: 25000,
      duration: '4.0 Hours',
      description: 'Full Royal Rajasthani Bridal Artistry by Prachi',
      inclusions: [
        'HD Airbrush / Glass-Skin Base',
        'Custom Lash Extensions & Eye Design',
        'Poshak & Dupatta Draping',
        'Bridal Hair Styling & Flowers',
        'Touch-Up Kit Provided',
      ],
    ),
    ServiceOptionItem(
      title: 'Pre-Wedding & Engagement Glam',
      price: 15000,
      duration: '2.5 Hours',
      description: 'Elegant Glam for Ring Ceremony & Sangeet',
      inclusions: [
        'HD Long-Wear Makeup',
        'Soft Glam Hair Styling',
        'Lehenga Draping',
        'Lash Application',
      ],
    ),
    ServiceOptionItem(
      title: 'Party & Festive Makeover',
      price: 8500,
      duration: '1.5 Hours',
      description: 'Radiant look for bridesmaids, sisters, & relatives',
      inclusions: [
        'Flawless Base & Eye Look',
        'Blowdry / Curls Hair Styling',
        'Basic Draping',
      ],
    ),
    ServiceOptionItem(
      title: 'Destination Bridal Package',
      price: 45000,
      duration: 'Full Day Event Coverage',
      description: 'Multi-function coverage for Royal Palace Weddings',
      inclusions: [
        'Main Wedding + Sangeet Makeovers',
        'Dedicated On-Venue Artist Station',
        'Senior Assistant Included',
        'Custom Look Consultations',
      ],
    ),
  ];

  final List<Map<String, dynamic>> _packagesList = const [
    {
      'title': 'Royal Rajasthani Poshak & Jewelry Package',
      'extra': 'Included',
      'details': 'Traditional heavy Dupatta setting, Borla placement, and authentic Rajasthani bridal finish.',
    },
    {
      'title': 'Airbrush & Glass Skin HD Glam Package',
      'extra': '+ ₹3,000',
      'details': '16-hour sweat-proof waterproof airbrushing ideal for summer/outdoor palace venues.',
    },
    {
      'title': 'Soft Dewy Minimalist Engagement Package',
      'extra': 'Standard',
      'details': 'Subtle glowing nude finish with soft waves for cocktail & ring ceremonies.',
    },
  ];

  double get _calculatedTravelFee {
    final city = _cityController.text.trim().toLowerCase();
    if (city.isEmpty || city == 'jodhpur') return 0;
    if (city == 'jaipur' || city == 'udaipur') return 3500;
    return 8500;
  }

  double get _calculatedTotal => _servicePrice + _calculatedTravelFee;

  double get _calculatedDeposit => (_calculatedTotal * 0.3).roundToDouble();

  void _onNextPressed() {
    if (_currentStep < 6) {
      setState(() => _currentStep++);
    } else {
      _submitInquiryAndPay();
    }
  }

  void _submitInquiryAndPay() {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (name.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your Full Name and WhatsApp Phone Number.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final bookingId = 'BK-${DateTime.now().millisecondsSinceEpoch}';

    // Dispatch to Bloc
    final newBooking = BookingEntity(
      id: bookingId,
      customer: CustomerDetails(
        fullName: name,
        phone: phone,
        email: _emailController.text.trim().isNotEmpty
            ? _emailController.text.trim()
            : 'guest@makeoversbyprachi.com',
        instagramHandle: '@bride',
      ),
      event: EventDetails(
        eventType: _selectedService,
        eventDate: _eventDate,
        readyByTime: _readyByTime,
        venueLocation: _venueController.text.trim(),
        city: _cityController.text.trim(),
        isOutstation: _calculatedTravelFee > 0,
      ),
      serviceTitle: _selectedService,
      packageName: _selectedPackage,
      commercials: CommercialDetails(
        basePrice: _servicePrice,
        travelFee: _calculatedTravelFee,
        depositRequired: _calculatedDeposit,
        depositPaid: 0,
      ),
      status: BookingStatus.awaitingApproval,
      createdAt: DateTime.now(),
    );

    context.read<BookingBloc>().add(SubmitBookingInquiryEvent(newBooking));

    // Show UPI QR Payment Dialog directly
    UpiQrPaymentDialog.show(
      context,
      amount: _calculatedDeposit,
      bookingId: bookingId,
      serviceName: '$_selectedService (30% Deposit)',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Book Date | Step ${_currentStep + 1} of 7',
          style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: Column(
        children: [
          LinearProgressIndicator(
            value: (_currentStep + 1) / 7,
            backgroundColor: AppColors.softRose,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.roseGold),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildStepContent(),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.lightBorder)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentStep > 0)
                  TextButton(
                    onPressed: () => setState(() => _currentStep--),
                    child: const Text('Back'),
                  )
                else
                  const SizedBox(),
                CustomButton(
                  label: _currentStep == 6 ? 'Confirm & Pay Deposit via UPI' : 'Next Step',
                  icon: _currentStep == 6 ? Icons.qr_code_scanner : Icons.arrow_forward,
                  onPressed: _onNextPressed,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1ServiceDetails();
      case 1:
        return _buildStep2PackageDetails();
      case 2:
        return _buildStep3DateAndTime();
      case 3:
        return _buildStep4VenueAndLocation();
      case 4:
        return _buildStep5GuestCount();
      case 5:
        return _buildStep6ContactDetails();
      case 6:
        return _buildStep7SummaryAndPayment();
      default:
        return Container();
    }
  }

  // Step 1: Rich Beauty Service Selection Card List
  Widget _buildStep1ServiceDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 1: Choose Beauty Service', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text('Select from our luxury bridal and occasion artistry offerings', style: AppTextStyles.bodySecondary),
        const SizedBox(height: 16),
        ..._servicesList.map((s) {
          final isSelected = _selectedService == s.title;

          return InkWell(
            onTap: () {
              setState(() {
                _selectedService = s.title;
                _servicePrice = s.price;
              });
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.blushPink : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.roseGold : AppColors.lightBorder,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          s.title,
                          style: AppTextStyles.sectionHeader.copyWith(
                            color: isSelected ? AppColors.deepPlum : Colors.black87,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(
                        '₹${s.price.toStringAsFixed(0)}',
                        style: AppTextStyles.headingTitle.copyWith(
                          color: AppColors.deepPlum,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 14, color: AppColors.mutedGray),
                      const SizedBox(width: 4),
                      Text('Duration: ${s.duration}', style: AppTextStyles.bodySecondary),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(s.description, style: AppTextStyles.bodyPrimary),
                  const SizedBox(height: 10),
                  const Text('Inclusions:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: s.inclusions
                        .map(
                          (inc) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.roseGold.withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              '✓ $inc',
                              style: const TextStyle(fontSize: 11, color: AppColors.deepPlum),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // Step 2: Package Selection
  Widget _buildStep2PackageDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 2: Select Styling Package', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text('Customized finishing for outfits, draping, and jewelry', style: AppTextStyles.bodySecondary),
        const SizedBox(height: 16),
        ..._packagesList.map((p) {
          final isSelected = _selectedPackage == p['title'];

          return InkWell(
            onTap: () => setState(() => _selectedPackage = p['title']),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.blushPink : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.roseGold : AppColors.lightBorder,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          p['title'],
                          style: AppTextStyles.sectionHeader.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.deepPlum,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          p['extra'],
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(p['details'], style: AppTextStyles.bodyPrimary),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // Step 3: Date & Time Picker
  Widget _buildStep3DateAndTime() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 3: Event Date & Time', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        CalendarDatePicker(
          initialDate: _eventDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          onDateChanged: (date) => setState(() => _eventDate = date),
        ),
        const SizedBox(height: 16),
        Text('Required Ready-By Time:', style: AppTextStyles.sectionHeader),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _readyByTime,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          items: const [
            DropdownMenuItem(value: '10:00', child: Text('10:00 AM (Morning Function)')),
            DropdownMenuItem(value: '13:00', child: Text('01:00 PM (Afternoon Function)')),
            DropdownMenuItem(value: '16:00', child: Text('04:00 PM (Evening Reception)')),
            DropdownMenuItem(value: '19:00', child: Text('07:00 PM (Night Barat / Phera)')),
          ],
          onChanged: (val) {
            if (val != null) setState(() => _readyByTime = val);
          },
        ),
      ],
    );
  }

  // Step 4: Venue & City Location
  Widget _buildStep4VenueAndLocation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 4: Venue & City Location', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        TextField(
          controller: _venueController,
          decoration: const InputDecoration(
            labelText: 'Venue Name / Hotel Address *',
            hintText: 'Gorbandh Palace, Jodhpur',
            prefixIcon: Icon(Icons.location_city),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _cityController,
          onChanged: (_) => setState(() {}),
          decoration: const InputDecoration(
            labelText: 'City *',
            hintText: 'Jodhpur / Jaipur / Udaipur',
            prefixIcon: Icon(Icons.map_outlined),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.blushPink,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, color: AppColors.deepPlum),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _calculatedTravelFee == 0
                      ? 'Local Jodhpur Studio Venue — No Travel Surcharge.'
                      : 'Outstation Location detected — Travel Surcharge: ₹${_calculatedTravelFee.toStringAsFixed(0)}',
                  style: AppTextStyles.bodyPrimary.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Step 5: Guest Count
  Widget _buildStep5GuestCount() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 5: Party Size', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Total Makeovers Needed:', style: TextStyle(fontSize: 16)),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  onPressed: () {
                    if (_guestCount > 1) setState(() => _guestCount--);
                  },
                ),
                Text('$_guestCount', style: AppTextStyles.headingTitle),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: () => setState(() => _guestCount++),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // Step 6: Contact Information
  Widget _buildStep6ContactDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 6: Contact Details', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Full Name *',
            prefixIcon: Icon(Icons.person),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'WhatsApp Phone Number *',
            prefixIcon: Icon(Icons.phone),
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Email Address',
            prefixIcon: Icon(Icons.email),
            border: OutlineInputBorder(),
          ),
        ),
      ],
    );
  }

  // Step 7: Commercial Quote Summary & Direct Payment Trigger
  Widget _buildStep7SummaryAndPayment() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 7: Commercial Quote & Payment', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Base Service Quote:'),
                  Text('₹${_servicePrice.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Travel / Outstation Surcharge:'),
                  Text('₹${_calculatedTravelFee.toStringAsFixed(0)}'),
                ],
              ),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Grand Total Quote:', style: AppTextStyles.sectionHeader),
                  Text('₹${_calculatedTotal.toStringAsFixed(0)}', style: AppTextStyles.headingTitle),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('30% Advance Deposit Required:'),
                  Text('₹${_calculatedDeposit.toStringAsFixed(0)}',
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
