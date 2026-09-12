import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../bloc/booking_bloc.dart';
import '../bloc/booking_event.dart';

class BookingInquiryScreen extends StatefulWidget {
  const BookingInquiryScreen({super.key});

  @override
  State<BookingInquiryScreen> createState() => _BookingInquiryScreenState();
}

class _BookingInquiryScreenState extends State<BookingInquiryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _venueController = TextEditingController();
  final _cityController = TextEditingController(text: 'Jodhpur');

  String _selectedEventType = 'Bridal';
  String _selectedService = 'Signature Bridal Makeover';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 14));
  final String _readyByTime = '15:00';
  final int _guestCount = 1;

  final List<String> _eventTypes = [
    'Bridal',
    'Pre-Wedding / Engagement',
    'Party Glam',
    'Reception',
    'Destination Wedding'
  ];

  final List<String> _services = [
    'Signature Bridal Makeover',
    'Pre-Wedding & Engagement Glam',
    'Party & Festive Makeover',
    'Destination Bridal Package'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Book Your Date | Makeovers by Prachi',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Request Event Slot',
                style: AppTextStyles.headingDisplay,
              ),
              const SizedBox(height: 4),
              Text(
                'Submit your date and event details. Prachi will review availability and send a customized quote.',
                style: AppTextStyles.bodySecondary,
              ),
              const SizedBox(height: 24),

              // 1. Personal Info
              _buildSectionTitle('1. Contact Information'),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nameController,
                validator: (v) => v!.isEmpty ? 'Full name is required' : null,
                decoration: const InputDecoration(
                  labelText: 'Full Name *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? 'Phone number is required' : null,
                decoration: const InputDecoration(
                  labelText: 'Phone / WhatsApp Number *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),

              // 2. Event Info
              _buildSectionTitle('2. Event & Venue Details'),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _selectedEventType,
                items: _eventTypes
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedEventType = v!),
                decoration: const InputDecoration(
                  labelText: 'Event Type *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _selectedService,
                items: _services
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedService = v!),
                decoration: const InputDecoration(
                  labelText: 'Service Selection *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                tileColor: Colors.white,
                shape: RoundedRectangleBorder(
                  side: const BorderSide(color: AppColors.mutedGray),
                  borderRadius: BorderRadius.circular(4),
                ),
                title: const Text('Event Date *'),
                subtitle: Text(
                    '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}'),
                trailing: const Icon(Icons.calendar_today,
                    color: AppColors.roseGold),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) setState(() => _selectedDate = picked);
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _venueController,
                validator: (v) => v!.isEmpty ? 'Venue is required' : null,
                decoration: const InputDecoration(
                  labelText: 'Venue Name / Address *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'City *',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: CustomButton(
                  label: 'Submit Booking Request',
                  icon: Icons.send,
                  onPressed: _submitForm,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.sectionHeader.copyWith(color: AppColors.deepPlum),
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final newBooking = BookingEntity(
        id: 'BK-${DateTime.now().millisecondsSinceEpoch}',
        customer: CustomerDetails(
          fullName: _nameController.text,
          phone: _phoneController.text,
          email: _emailController.text.isNotEmpty
              ? _emailController.text
              : 'guest@example.com',
        ),
        event: EventDetails(
          eventType: _selectedEventType,
          eventDate: _selectedDate,
          readyByTime: _readyByTime,
          venueLocation: _venueController.text,
          city: _cityController.text,
          guestCount: _guestCount,
        ),
        serviceTitle: _selectedService,
        commercials: const CommercialDetails(
          basePrice: 15000,
          depositRequired: 5000,
        ),
        status: BookingStatus.awaitingApproval,
        createdAt: DateTime.now(),
      );

      context.read<BookingBloc>().add(SubmitBookingInquiryEvent(newBooking));

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Inquiry submitted! Prachi will review and contact you shortly.'),
          backgroundColor: AppColors.emeraldGreen,
        ),
      );

      Navigator.pop(context);
    }
  }
}
