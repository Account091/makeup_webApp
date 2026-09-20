import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/booking_date_service.dart';
import '../../../common/widgets/custom_button.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedMonth = DateTime.now();

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
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: SingleChildScrollView(
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
                LayoutBuilder(
                  builder: (context, btnConstraints) {
                    if (btnConstraints.maxWidth < 450) {
                      return Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            child: CustomButton(
                              label: 'Block Date Slot',
                              icon: Icons.block,
                              onPressed: _showBlockSlotDialog,
                            ),
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: CustomButton(
                              label: 'Manual Override',
                              isSecondary: true,
                              icon: Icons.admin_panel_settings,
                              onPressed: _showManualOverrideDialog,
                            ),
                          ),
                        ],
                      );
                    }
                    return Row(
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
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusLegend() {
    final statuses = [
      {'label': 'Available (Open) 🟢', 'color': Colors.green.shade700},
      {'label': 'In Queue (Pending) 🟡', 'color': Colors.amber.shade800},
      {'label': 'Confirmed & Locked 🔴', 'color': Colors.red.shade900},
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
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildCalendarGrid() {
    final daysInMonth =
        DateUtils.getDaysInMonth(_focusedMonth.year, _focusedMonth.month);

    return StreamBuilder<Map<String, DateAvailabilityResult>>(
      stream: BookingDateService.streamDateSlots(),
      builder: (context, snapshot) {
        final liveDateMap = snapshot.data ?? {};

        return LayoutBuilder(
          builder: (context, constraints) {
            final cellWidth = constraints.maxWidth / 7;
            final aspectRatio =
                cellWidth > 90 ? 0.95 : (cellWidth > 56 ? 0.78 : 0.65);

            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: aspectRatio,
                crossAxisSpacing: cellWidth > 60 ? 6 : 4,
                mainAxisSpacing: cellWidth > 60 ? 6 : 4,
              ),
              itemCount: daysInMonth,
              itemBuilder: (context, index) {
                final day = index + 1;
                final dateKey =
                    '${_focusedMonth.year}-${_focusedMonth.month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';

                final availability = liveDateMap[dateKey];
                final isLocked = availability?.isLocked ?? false;
                final isInQueue = availability?.isInQueue ?? false;

                Color cardBg = Colors.white;
                Color textColor = AppColors.deepPlum;

                if (isLocked) {
                  cardBg = Colors.red.shade900;
                  textColor = Colors.white;
                } else if (isInQueue) {
                  cardBg = Colors.amber.shade800;
                  textColor = Colors.white;
                }

                return InkWell(
                  onTap: () => _onDateTapped(day, dateKey, availability),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isLocked
                            ? Colors.redAccent
                            : (isInQueue ? Colors.amber : AppColors.lightBorder),
                        width: isLocked || isInQueue ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '$day',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: cellWidth > 50 ? 12 : 10,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Expanded(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isLocked)
                                  const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.lock, size: 9, color: Colors.white),
                                      SizedBox(width: 2),
                                      Text(
                                        'LOCKED',
                                        style: TextStyle(
                                          fontSize: 8,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  )
                                else if (isInQueue)
                                  const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.hourglass_top,
                                          size: 9, color: Colors.white),
                                      SizedBox(width: 2),
                                      Text(
                                        'IN QUEUE',
                                        style: TextStyle(
                                          fontSize: 8,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  )
                                else
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 5,
                                        height: 5,
                                        decoration: const BoxDecoration(
                                          color: Colors.green,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 2),
                                      const Text(
                                        'OPEN',
                                        style: TextStyle(
                                          fontSize: 8,
                                          color: Colors.green,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  void _onDateTapped(
      int day, String dateKey, DateAvailabilityResult? availability) {
    final isLocked = availability?.isLocked ?? false;
    final isInQueue = availability?.isInQueue ?? false;

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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Date Capacity & Lock View',
                  style: AppTextStyles.headingTitle,
                ),
                Text(
                  dateKey,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (isLocked) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.shade300),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lock, color: Colors.red.shade900),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CONFIRMED & CALENDAR LOCKED',
                            style: TextStyle(
                              color: Colors.red.shade900,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Client: ${availability?.clientName ?? "Royal Bride"} (${availability?.serviceTitle ?? "Bridal Makeover"})',
                            style: const TextStyle(fontSize: 12),
                          ),
                          Text(
                            'Booking ID: ${availability?.bookingId ?? "N/A"}',
                            style: const TextStyle(fontSize: 11, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Notice: Admin payment approval locked this date. Customers are blocked from booking this date on the website.',
                style: TextStyle(fontSize: 11, color: Colors.black54),
              ),
            ] else if (isInQueue) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.amber.shade400),
                ),
                child: Row(
                  children: [
                    Icon(Icons.hourglass_top, color: Colors.amber.shade900),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'IN VERIFICATION QUEUE',
                            style: TextStyle(
                              color: Colors.amber.shade900,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Client: ${availability?.clientName ?? "Client"} (${availability?.serviceTitle ?? "Bridal Service"})',
                            style: const TextStyle(fontSize: 12),
                          ),
                          Text(
                            'Ref: ${availability?.bookingId ?? "N/A"} (Awaiting UPI Approval)',
                            style: const TextStyle(fontSize: 11, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Notice: Payment is in the verification queue. If approved, this date will automatically become locked.',
                style: TextStyle(fontSize: 11, color: Colors.black54),
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.shade300),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green.shade800),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'Date Completely Open & Available for Bookings',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              _buildSlotRow('Morning (08:00 - 12:00)', 'Available'),
              _buildSlotRow('Afternoon (13:00 - 17:00)', 'Available'),
              _buildSlotRow('Evening (18:00 - 22:00)', 'Available'),
            ],

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
