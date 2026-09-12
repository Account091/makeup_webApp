import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../domain/entities/event_day_entity.dart';

class EventDayModeScreen extends StatefulWidget {
  const EventDayModeScreen({super.key});

  @override
  State<EventDayModeScreen> createState() => _EventDayModeScreenState();
}

class _EventDayModeScreenState extends State<EventDayModeScreen> {
  late EventDaySession _session;

  @override
  void initState() {
    super.initState();
    _loadSampleSession();
  }

  void _loadSampleSession() {
    _session = EventDaySession(
      sessionId: 'evt_1001',
      bookingId: 'bk_rajputi_99',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98290 11223',
      eventType: 'Royal Wedding',
      venueLocation: 'Umaid Bhawan Palace, Jodhpur',
      readyByTime: '01:00 PM',
      currentStatus: 'MAKEUP_STARTED',
      assignedArtistNames: const ['Prachi (Head Artist)', 'Ritu (Hair)', 'Anita (Draping)'],
      checklist: [
        const ChecklistItem(id: 'chk_1', taskName: 'Skin Prep & Hydration Gel', isCompleted: true, completedBy: 'Prachi'),
        const ChecklistItem(id: 'chk_2', taskName: 'Airbrush HD Base Foundation', isCompleted: true, completedBy: 'Prachi'),
        const ChecklistItem(id: 'chk_3', taskName: 'Rajputi Eye Accent & Lashes', isCompleted: false),
        const ChecklistItem(id: 'chk_4', taskName: 'Royal Crown Hairstyling & Mathapatti', isCompleted: false),
        const ChecklistItem(id: 'chk_5', taskName: 'Zardosi Poshak & Dupatta Draping', isCompleted: false),
        const ChecklistItem(id: 'chk_6', taskName: 'Final Touch-up & Portfolio Shots', isCompleted: false),
      ],
      updatedAt: DateTime.now(),
    );
  }

  void _updateStatus(String newStatus) {
    setState(() {
      _session = EventDaySession(
        sessionId: _session.sessionId,
        bookingId: _session.bookingId,
        customerName: _session.customerName,
        customerPhone: _session.customerPhone,
        eventType: _session.eventType,
        venueLocation: _session.venueLocation,
        readyByTime: _session.readyByTime,
        currentStatus: newStatus,
        checklist: _session.checklist,
        assignedArtistNames: _session.assignedArtistNames,
        notes: _session.notes,
        updatedAt: DateTime.now(),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✨ Status updated to: $newStatus'),
        backgroundColor: AppColors.emeraldGreen,
      ),
    );
  }

  void _toggleChecklist(int index) {
    final list = List<ChecklistItem>.from(_session.checklist);
    final item = list[index];
    list[index] = ChecklistItem(
      id: item.id,
      taskName: item.taskName,
      isCompleted: !item.isCompleted,
      completedBy: !item.isCompleted ? 'Prachi' : null,
    );

    setState(() {
      _session = EventDaySession(
        sessionId: _session.sessionId,
        bookingId: _session.bookingId,
        customerName: _session.customerName,
        customerPhone: _session.customerPhone,
        eventType: _session.eventType,
        venueLocation: _session.venueLocation,
        readyByTime: _session.readyByTime,
        currentStatus: _session.currentStatus,
        checklist: list,
        assignedArtistNames: _session.assignedArtistNames,
        notes: _session.notes,
        updatedAt: DateTime.now(),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final stages = [
      'ARRIVED',
      'MAKEUP_STARTED',
      'HAIR_STARTED',
      'DRAPING_STARTED',
      'READY',
      'COMPLETED'
    ];

    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Event-Day Operations Console',
              style: AppTextStyles.headingTitle.copyWith(
                color: AppColors.roseGold,
                fontSize: 18,
              ),
            ),
            Text(
              'V10.0 Real-Time Event Execution & SOP Checklist',
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
            // Active Bride Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.deepPlum,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.deepPlum.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _session.customerName,
                        style: AppTextStyles.headingTitle.copyWith(
                          color: AppColors.roseGold,
                          fontSize: 20,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.emeraldGreen,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _session.currentStatus,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white70, size: 16),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          _session.venueLocation,
                          style: AppTextStyles.bodySecondary.copyWith(color: Colors.white70, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.roseGold, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Target Ready-By: ${_session.readyByTime}',
                        style: AppTextStyles.bodySecondary.copyWith(color: AppColors.roseGold, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Text('Live Event Stage Progression', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: stages.map((stage) {
                  final isSelected = stage == _session.currentStatus;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(stage.replaceAll('_', ' ')),
                      selected: isSelected,
                      selectedColor: AppColors.roseGold,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.deepPlum,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                      onSelected: (val) {
                        if (val) _updateStatus(stage);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),
            Text('SOP Service Checklist (${_session.checklist.where((c) => c.isCompleted).length}/${_session.checklist.length} Completed)', style: AppTextStyles.sectionHeader),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _session.checklist.length,
              itemBuilder: (context, index) {
                final item = _session.checklist[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: CheckboxListTile(
                    activeColor: AppColors.emeraldGreen,
                    title: Text(
                      item.taskName,
                      style: AppTextStyles.bodyPrimary.copyWith(
                        decoration: item.isCompleted ? TextDecoration.lineThrough : null,
                        fontWeight: item.isCompleted ? FontWeight.normal : FontWeight.bold,
                      ),
                    ),
                    subtitle: item.isCompleted && item.completedBy != null
                        ? Text('Completed by ${item.completedBy}', style: const TextStyle(fontSize: 10, color: AppColors.emeraldGreen))
                        : null,
                    value: item.isCompleted,
                    onChanged: (_) => _toggleChecklist(index),
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
