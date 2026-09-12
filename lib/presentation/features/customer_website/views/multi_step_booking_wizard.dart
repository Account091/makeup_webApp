import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../booking/bloc/booking_bloc.dart';
import '../../booking/bloc/booking_event.dart';

class MultiStepBookingWizard extends StatefulWidget {
  const MultiStepBookingWizard({super.key});

  @override
  State<MultiStepBookingWizard> createState() => _MultiStepBookingWizardState();
}

class _MultiStepBookingWizardState extends State<MultiStepBookingWizard> {
  int _currentStep = 0;

  // Step 1: Service
  String _selectedService = 'Signature Bridal Makeover';
  // Step 2: Package
  String _selectedPackage = 'Royal Rajasthani Poshak Package';
  // Step 3: Date
  DateTime _eventDate = DateTime.now().add(const Duration(days: 30));
  // Step 4: Venue & City
  final _venueController = TextEditingController(text: 'Gorbandh Palace');
  final _cityController = TextEditingController(text: 'Jodhpur');
  // Step 5: Guest Count & Time
  int _guestCount = 1;
  final String _readyByTime = '16:00';
  // Step 6: Inspiration Photos
  final String _inspirationNote = 'Traditional Rajasthani royal look with heavy eye makeup.';
  // Step 7: Contact Info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _instagramController = TextEditingController();

  final List<String> _services = [
    'Signature Bridal Makeover',
    'Pre-Wedding & Engagement Glam',
    'Party & Festive Makeover',
    'Destination Bridal Package'
  ];

  final List<String> _packages = [
    'Royal Rajasthani Poshak Package',
    'Airbrush Glam Package',
    'Soft Dewy Engagement Package'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Book Date | Step ${_currentStep + 1} of 7',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: Column(
        children: [
          // Step Progress Bar
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
          // Navigation Bottom Bar
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
                  label: _currentStep == 6 ? 'Submit Inquiry' : 'Next Step',
                  icon: _currentStep == 6 ? Icons.send : Icons.arrow_forward,
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
        return _buildStep1Service();
      case 1:
        return _buildStep2Package();
      case 2:
        return _buildStep3Date();
      case 3:
        return _buildStep4Venue();
      case 4:
        return _buildStep5Guests();
      case 5:
        return _buildStep6Inspiration();
      case 6:
        return _buildStep7Contact();
      default:
        return Container();
    }
  }

  Widget _buildStep1Service() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 1: Choose Beauty Service', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 12),
        ..._services.map(
          (s) => ListTile(
            title: Text(s, style: AppTextStyles.sectionHeader),
            leading: Icon(
              _selectedService == s ? Icons.radio_button_checked : Icons.radio_button_off,
              color: AppColors.roseGold,
            ),
            onTap: () => setState(() => _selectedService = s),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2Package() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 2: Choose Signature Package', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 12),
        ..._packages.map(
          (p) => ListTile(
            title: Text(p, style: AppTextStyles.sectionHeader),
            leading: Icon(
              _selectedPackage == p ? Icons.radio_button_checked : Icons.radio_button_off,
              color: AppColors.roseGold,
            ),
            onTap: () => setState(() => _selectedPackage = p),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3Date() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 3: Select Event Date', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        CalendarDatePicker(
          initialDate: _eventDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          onDateChanged: (date) => setState(() => _eventDate = date),
        ),
      ],
    );
  }

  Widget _buildStep4Venue() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 4: Venue & City Location', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        TextField(
          controller: _venueController,
          decoration: const InputDecoration(labelText: 'Venue Name / Hotel Address', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _cityController,
          decoration: const InputDecoration(labelText: 'City (Jodhpur / Destination)', border: OutlineInputBorder()),
        ),
      ],
    );
  }

  Widget _buildStep5Guests() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 5: Party Size & Ready Time', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Number of People:', style: TextStyle(fontSize: 16)),
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

  Widget _buildStep6Inspiration() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 6: Inspiration & Reference Notes', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.lightBorder),
          ),
          child: Column(
            children: [
              const Icon(Icons.cloud_upload_outlined, size: 36, color: AppColors.roseGold),
              const SizedBox(height: 8),
              Text('Upload Reference Photos (Optional)', style: AppTextStyles.sectionHeader),
              Text('Inspiration images for makeup, hairstyle, or Poshak draping.', style: AppTextStyles.bodySecondary),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStep7Contact() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Step 7: Contact & Confirm', style: AppTextStyles.headingDisplay.copyWith(fontSize: 22)),
        const SizedBox(height: 16),
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(labelText: 'Full Name *', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: 'Phone / WhatsApp Number *', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _instagramController,
          decoration: const InputDecoration(labelText: 'Instagram Handle (Optional)', border: OutlineInputBorder()),
        ),
      ],
    );
  }

  void _onNextPressed() {
    if (_currentStep < 6) {
      setState(() => _currentStep++);
    } else {
      _submitWizard();
    }
  }

  void _submitWizard() {
    if (_nameController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Name and Phone Number.')),
      );
      return;
    }

    final booking = BookingEntity(
      id: 'BK-${DateTime.now().millisecondsSinceEpoch}',
      customer: CustomerDetails(
        fullName: _nameController.text,
        phone: _phoneController.text,
        email: _emailController.text.isNotEmpty ? _emailController.text : 'guest@example.com',
        instagramHandle: _instagramController.text,
      ),
      event: EventDetails(
        eventType: _selectedService,
        eventDate: _eventDate,
        readyByTime: _readyByTime,
        venueLocation: _venueController.text,
        city: _cityController.text,
        guestCount: _guestCount,
      ),
      serviceTitle: _selectedService,
      packageName: _selectedPackage,
      commercials: const CommercialDetails(
        basePrice: 18000,
        depositRequired: 5000,
      ),
      status: BookingStatus.awaitingApproval,
      notes: _inspirationNote,
      createdAt: DateTime.now(),
    );

    context.read<BookingBloc>().add(SubmitBookingInquiryEvent(booking));

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: Text('Booking Inquiry Received! 🎉', style: AppTextStyles.headingTitle),
        content: const Text(
          'Your inquiry has been submitted. Prachi will review your date and venue requirements and send a customized quote.',
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Back to Home'),
          ),
        ],
      ),
    );
  }
}
