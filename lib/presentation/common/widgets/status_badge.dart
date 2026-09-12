import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../domain/entities/booking_entity.dart';

class StatusBadge extends StatelessWidget {
  final BookingStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    String label;

    switch (status) {
      case BookingStatus.awaitingApproval:
        bg = AppColors.statusAwaitingApproval;
        label = 'Awaiting Approval';
        break;
      case BookingStatus.depositPending:
        bg = AppColors.statusDepositPending;
        label = 'Deposit Pending';
        break;
      case BookingStatus.confirmed:
        bg = AppColors.statusConfirmed;
        label = 'Confirmed';
        break;
      case BookingStatus.completed:
        bg = AppColors.statusCompleted;
        label = 'Completed';
        break;
      case BookingStatus.declined:
        bg = AppColors.statusDeclined;
        label = 'Declined';
        break;
      case BookingStatus.cancelled:
        bg = AppColors.mutedGray;
        label = 'Cancelled';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: bg, width: 1),
      ),
      child: Text(
        label,
        style: AppTextStyles.badgeText.copyWith(color: bg),
      ),
    );
  }
}
