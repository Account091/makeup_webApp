import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../common/widgets/custom_button.dart';
import '../../../../domain/entities/calendar_slot_entity.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedMonth = DateTime.now();

  // Mock Calendar Availability Slots with Slot Granularity
  final Map<String, Map<DaySlotType, String>> _dateSlots = {
    '2026-09-15': {
      DaySlotType.morning: 'Confirmed',
      DaySlotType.afternoon: 'Available',
      DaySlotType.evening: 'Deposit Pending',
    },
    '2026-09-20': {
      DaySlotType.morning: 'Available',
      DaySlotType.afternoon: 'Confirmed (Bridal)',
      DaySlotType.evening: 'Available',
    },
    '2026-09-22': {
      DaySlotType.morning: 'Travel Buffer (Outstation)',
      DaySlotType.afternoon: 'Travel Buffer (Outstation)',
      DaySlotType.evening: 'Travel Buffer (Outstation)',
    },
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Master Availability & Capacity Calendar',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusLegend(),
            const SizedBox(height: 16),

            // Month Header Navigation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_monthName(_focusedMonth.month)} ${_focusedMonth.year}',
                  style: AppTextStyles.headingDisplay.copyWith(fontSize: 20),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: () {
                        setState(() {
                          _focusedMonth = DateTime(
                              _focusedMonth.year, _focusedMonth.month - 1);
                        });
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: () {
                        setState(() {
                          _focusedMonth = DateTime(
                              _focusedMonth.year, _focusedMonth.month + 1);
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Calendar Days Grid
            _buildCalendarGrid(),
            const SizedBox(height: 24),

            // Action Buttons Bar
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    label: 'Block Date Slot',
                    icon: Icons.block,
                    onPressed: _showBlockSlotDialog,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: CustomButton(
                    label: 'Manual Override',
                    isSecondary: true,
                    icon: Icons.admin_panel_settings,
                    onPressed: _showManualOverrideDialog,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusLegend() {
    final statuses = [
      {'label': 'Morning Slot 🟢', 'color': AppColors.statusConfirmed.withValues(alpha: 0.3)},
      {'label': 'Afternoon Slot 🟡', 'color': AppColors.statusAwaitingApproval},
      {'label': 'Evening Slot 🔵', 'color': AppColors.statusDepositPending},
      {'label': 'Travel Buffer ✈️', 'color': AppColors.statusCompleted},
      {'label': 'Capacity Reached 🔴', 'color': AppColors.statusDeclined},
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: statuses
          .map(
            (s) => Chip(
              backgroundColor: s['color'] as Color,
              label: Text(
                s['label'] as String,
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCalendarGrid() {
    final daysInMonth = DateUtils.getDaysInMonth(_focusedMonth.year, _focusedMonth.month);

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        childAspectRatio: 0.85,
        crossAxisSpacing: 6,
        mainAxisSpacing: 6,
      ),
      itemCount: daysInMonth,
      itemBuilder: (context, index) {
        final day = index + 1;
        final dateKey = '${_focusedMonth.year}-${_focusedMonth.month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
        final slots = _dateSlots[dateKey] ?? {
          DaySlotType.morning: 'Available',
          DaySlotType.afternoon: 'Available',
          DaySlotType.evening: 'Available',
        };

        final isTravel = slots.values.any((v) => v.contains('Travel Buffer'));
        final isBooked = slots.values.any((v) => v.contains('Confirmed'));

        Color cardBg = Colors.white;
        Color textColor = AppColors.deepPlum;

        if (isTravel) {
          cardBg = AppColors.statusCompleted;
          textColor = Colors.white;
        } else if (isBooked) {
          cardBg = AppColors.statusConfirmed.withValues(alpha: 0.85);
          textColor = Colors.white;
        }

        return InkWell(
          onTap: () => _onDateTapped(day, dateKey, slots),
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$day',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: textColor,
                  ),
                ),
                Column(
                  children: [
                    _buildSlotDot(slots[DaySlotType.morning], 'M'),
                    const SizedBox(height: 1),
                    _buildSlotDot(slots[DaySlotType.afternoon], 'A'),
                    const SizedBox(height: 1),
                    _buildSlotDot(slots[DaySlotType.evening], 'E'),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSlotDot(String? status, String label) {
    Color dotColor = Colors.green;
    if (status != null && status != 'Available') {
      if (status.contains('Confirmed')) {
        dotColor = Colors.redAccent;
      } else if (status.contains('Pending')) {
        dotColor = Colors.amber;
      } else if (status.contains('Travel')) {
        dotColor = Colors.purpleAccent;
      }
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 5,
          height: 5,
          decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 3),
        Text(label, style: TextStyle(fontSize: 8, color: dotColor, fontWeight: FontWeight.bold)),
      ],
    );
  }

  void _onDateTapped(int day, String dateKey, Map<DaySlotType, String> slots) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Slot Capacity & Conflict View: $dateKey', style: AppTextStyles.headingTitle),
            const SizedBox(height: 12),
            _buildSlotRow('Morning (08:00 - 12:00)', slots[DaySlotType.morning] ?? 'Available'),
            _buildSlotRow('Afternoon (13:00 - 17:00)', slots[DaySlotType.afternoon] ?? 'Available'),
            _buildSlotRow('Evening (18:00 - 22:00)', slots[DaySlotType.evening] ?? 'Available'),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Close Details',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlotRow(String title, String status) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          Text(status, style: TextStyle(color: status == 'Available' ? Colors.green : AppColors.statusAwaitingApproval, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }

  void _showBlockSlotDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Block Time Slot'),
        content: const Text('Reserve or block a specific Morning, Afternoon, or Evening slot for preparation or personal schedule.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Block Slot'),
          ),
        ],
      ),
    );
  }

  void _showManualOverrideDialog() {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Admin Manual Capacity Override'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Prachi, apply manual override to accept an additional booking beyond standard daily capacity. Audit log will record this action.',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Override Reason',
                hintText: 'e.g. Assistant artist available for parallel party makeup',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton.icon(
            icon: const Icon(Icons.security, size: 16),
            label: const Text('Override & Accept'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.statusAwaitingApproval),
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Manual Override applied & audit log recorded.')),
              );
            },
          ),
        ],
      ),
    );
  }

  String _monthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}
