import 'package:flutter/material.dart';
import '../../../domain/entities/booking_entity.dart';
import 'admin_widgets.dart';

/// Legacy wrapper kept for parked screens; delegates to [StatusChip].
class StatusBadge extends StatelessWidget {
  final BookingEntity booking;

  const StatusBadge({super.key, required this.booking});

  @override
  Widget build(BuildContext context) => StatusChip.forBooking(booking);
}
