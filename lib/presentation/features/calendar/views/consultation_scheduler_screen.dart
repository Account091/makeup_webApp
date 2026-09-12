import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/consultation_appointment_entity.dart';

class ConsultationSchedulerScreen extends StatefulWidget {
  const ConsultationSchedulerScreen({super.key});

  @override
  State<ConsultationSchedulerScreen> createState() => _ConsultationSchedulerScreenState();
}

class _ConsultationSchedulerScreenState extends State<ConsultationSchedulerScreen> {
  late List<ConsultationAppointment> _appointments;

  @override
  void initState() {
    super.initState();
    _loadSampleAppointments();
  }

  void _loadSampleAppointments() {
    _appointments = [
      ConsultationAppointment(
        appointmentId: 'csl_101',
        customerId: 'cust_priya',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98290 11223',
        consultationType: 'VIRTUAL_CONSULTATION',
        scheduledTime: DateTime.now().add(const Duration(hours: 2)),
        durationMinutes: 30,
        assignedArtistName: 'Prachi',
        status: 'CONFIRMED',
        notes: 'Pre-wedding skin analysis & package selection.',
      ),
      ConsultationAppointment(
        appointmentId: 'csl_102',
        customerId: 'cust_ananya',
        customerName: 'Ananya Rathore',
        customerPhone: '+91 98290 88776',
        consultationType: 'IN_PERSON_CONSULTATION',
        scheduledTime: DateTime.now().add(const Duration(days: 1)),
        durationMinutes: 45,
        assignedArtistName: 'Prachi',
        status: 'CONFIRMED',
        notes: 'Studio visit for Poshak draping & hair accessory matching.',
      ),
    ];
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
              'Universal Consultation Scheduler',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.1 Virtual, In-Person & Trial Consultations',
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Scheduled Consultations (${_appointments.length})', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _appointments.length,
              itemBuilder: (context, index) {
                final app = _appointments[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.softRose,
                      child: Icon(
                        app.consultationType == 'VIRTUAL_CONSULTATION' ? Icons.videocam : Icons.person_pin,
                        color: AppColors.deepPlum,
                      ),
                    ),
                    title: Text('${app.customerName} (${app.consultationType.replaceAll('_', ' ')})', style: AppTextStyles.sectionHeader.copyWith(fontSize: 13)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('Phone: ${app.customerPhone} | Duration: ${app.durationMinutes} mins', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11)),
                        Text('Notes: ${app.notes ?? "N/A"}', style: AppTextStyles.bodySecondary.copyWith(fontSize: 10)),
                      ],
                    ),
                    trailing: Chip(
                      backgroundColor: AppColors.emeraldGreen,
                      label: Text(app.status, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
