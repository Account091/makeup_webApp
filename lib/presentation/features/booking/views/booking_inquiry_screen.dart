import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/booking_date_service.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../bloc/booking_bloc.dart';
import '../bloc/booking_event.dart';
import '../../../../core/services/firebase_messaging_service.dart';

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
  DateAvailabilityResult? _dateStatus;
  final String _readyByTime = '15:00';
  final int _guestCount = 1;

  @override
  void initState() {
    super.initState();
    _checkInitialDate();
  }

  Future<void> _checkInitialDate() async {
    final res = await BookingDateService.checkDateAvailability(_selectedDate);
    if (mounted) setState(() => _dateStatus = res);
  }

  void _showLockedDialog(DateAvailabilityResult result) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.lock, color: Colors.red.shade900),
            const SizedBox(width: 8),
            const Text('Date Unavailable & Locked'),
          ],
        ),
        content: Text(
          'The date ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year} is already confirmed and reserved by the studio for an exclusive royal wedding.\n\nPrachi accepts only 1 bride per day to guarantee exclusivity. Please choose an alternate date.',
          style: const TextStyle(height: 1.4),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.deepPlum,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Choose Alternate Date'),
          ),
        ],
      ),
    );
  }

  void _showInQueueDialog(DateAvailabilityResult result) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.hourglass_top, color: Colors.amber.shade900),
            const SizedBox(width: 8),
            const Text('Date in Verification Queue'),
          ],
        ),
        content: Text(
          'An inquiry is currently in queue for ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year} awaiting payment verification.\n\nYou can still submit this inquiry as a Priority Waitlist candidate. If the pending booking expires or cancels, your inquiry takes immediate precedence.',
          style: const TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Select Another Date'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber.shade800,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Proceed as Waitlist'),
          ),
        ],
      ),
    );
  }

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
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
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
                  if (picked != null) {
                    final res = await BookingDateService.checkDateAvailability(picked);
                    if (res.isLocked) {
                      _showLockedDialog(res);
                    } else {
                      if (res.isInQueue) {
                        _showInQueueDialog(res);
                      }
                      setState(() {
                        _selectedDate = picked;
                        _dateStatus = res;
                      });
                    }
                  }
                },
              ),
              if (_dateStatus != null) ...[
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _dateStatus!.isLocked
                        ? Colors.red.shade50
                        : (_dateStatus!.isInQueue ? Colors.amber.shade50 : Colors.green.shade50),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: _dateStatus!.isLocked
                          ? Colors.red.shade300
                          : (_dateStatus!.isInQueue ? Colors.amber.shade300 : Colors.green.shade300),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _dateStatus!.isLocked
                            ? Icons.lock
                            : (_dateStatus!.isInQueue ? Icons.hourglass_top : Icons.check_circle),
                        size: 14,
                        color: _dateStatus!.isLocked
                            ? Colors.red.shade900
                            : (_dateStatus!.isInQueue ? Colors.amber.shade900 : Colors.green.shade800),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _dateStatus!.isLocked
                              ? 'Date Locked: This date is officially confirmed for another client.'
                              : (_dateStatus!.isInQueue
                                  ? 'Date in Queue: Another client is pending verification (Waitlist Request).'
                                  : 'Date Available: Open for reservation!'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _dateStatus!.isLocked
                                ? Colors.red.shade900
                                : (_dateStatus!.isInQueue ? Colors.amber.shade900 : Colors.green.shade800),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
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

  void _submitForm() async {
    if (_dateStatus?.isLocked == true) {
      _showLockedDialog(_dateStatus!);
      return;
    }

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

      // 1. Dispatch FCM push notification alert to Admin
      FirebaseMessagingService.instance.sendAdminBookingNotification(booking: newBooking);

      // 2. Register customer device token
      FirebaseMessagingService.instance.registerCustomerToken(
        phone: _phoneController.text,
        bookingId: newBooking.id,
        customerName: _nameController.text,
      );

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
