import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/admin/admin_repositories.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../../domain/services/customer_aggregation.dart';
import '../../common/widgets/admin_widgets.dart';

/// Shared admin actions on a booking. Each shows a success SnackBar only
/// after the Firestore write completes, or the real error.

Future<bool> approvePaymentFlow(
  BuildContext context,
  AdminRepositories repos,
  AdminSession session,
  BookingEntity b, {
  bool celebrate = true,
}) async {
  final ok = await confirmDialog(
    context,
    title: 'Approve payment?',
    message:
        'Confirm ${displayName(b)}\'s booking ${b.id} for ${formatDateKey(b.event.dateKey)}.\n'
        'Deposit recorded as paid: ${formatInr(b.commercials.depositRequired)}.\n'
        'The date will be marked BOOKED.',
    confirmLabel: 'Approve',
    icon: Icons.verified_rounded,
  );
  if (!ok || !context.mounted) return false;
  final done = await runWithFeedback(
    context,
    () => repos.bookings.approvePayment(b.id, actor: session.actor),
    success: 'Booking ${b.id} confirmed',
  );
  if (done && celebrate && context.mounted) {
    tapHaptic();
    showCelebration(
      context,
      title: 'Booking confirmed',
      subtitle:
          '${displayName(b)} · ${formatDateKeyShort(b.event.dateKey)} is now booked',
    );
  }
  return done;
}

Future<bool> rejectPaymentFlow(
  BuildContext context,
  AdminRepositories repos,
  BookingEntity b,
) async {
  final wide = MediaQuery.sizeOf(context).width >= 700;
  final String? reason;
  if (wide) {
    reason = await showDialog<String>(
      context: context,
      builder: (_) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: RejectReasonForm(booking: b),
        ),
      ),
    );
  } else {
    reason = await showAppSheet<String>(
      context,
      builder: (_) => RejectReasonForm(booking: b),
    );
  }
  if (reason == null || !context.mounted) return false;
  return runWithFeedback(
    context,
    () => repos.bookings.rejectPayment(b.id, reason: reason!),
    success: 'Payment for ${b.id} rejected; date released',
  );
}

Future<bool> cancelBookingFlow(
  BuildContext context,
  AdminRepositories repos,
  BookingEntity b,
) async {
  final ok = await confirmDialog(
    context,
    title: 'Cancel booking?',
    message:
        'Cancel ${b.id} (${displayName(b)}, ${formatDateKey(b.event.dateKey)}). '
        'The date will be freed on the calendar. This cannot be undone from the app.',
    confirmLabel: 'Cancel booking',
    destructive: true,
  );
  if (!ok || !context.mounted) return false;
  return runWithFeedback(
    context,
    () => repos.bookings.cancelBooking(b.id),
    success: 'Booking ${b.id} cancelled',
  );
}

Future<bool> completeBookingFlow(
  BuildContext context,
  AdminRepositories repos,
  BookingEntity b,
) async {
  final ok = await confirmDialog(
    context,
    title: 'Mark completed?',
    message: 'Mark ${b.id} (${displayName(b)}) as completed.',
    confirmLabel: 'Mark completed',
    icon: Icons.task_alt_rounded,
  );
  if (!ok || !context.mounted) return false;
  final done = await runWithFeedback(
    context,
    () => repos.bookings.completeBooking(b.id),
    success: 'Booking ${b.id} marked completed',
  );
  if (done) tapHaptic();
  return done;
}

Future<void> callCustomer(BuildContext context, String phone) =>
    _launch(context, Uri(scheme: 'tel', path: '+91${normalizePhone(phone)}'));

Future<void> whatsappCustomer(BuildContext context, BookingEntity b) {
  final text = 'Hi ${b.customer.fullName}, regarding your booking ${b.id}';
  return _launch(
    context,
    Uri.https('wa.me', '/91${normalizePhone(b.customer.phone)}', {
      'text': text,
    }),
  );
}

Future<void> _launch(BuildContext context, Uri uri) async {
  try {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      showErrorSnack(context, 'Could not open $uri');
    }
  } catch (e) {
    if (context.mounted) showErrorSnack(context, e);
  }
}

/// Quick-pick rejection reasons (shown to the customer).
const kRejectReasons = [
  "Amount doesn't match",
  'UTR not found in bank statement',
  'Screenshot unclear',
  'Paid to a different UPI ID',
];

/// Reason picker: quick-pick chips plus an editable text field. Pops the
/// trimmed reason.
class RejectReasonForm extends StatefulWidget {
  final BookingEntity booking;
  const RejectReasonForm({super.key, required this.booking});

  @override
  State<RejectReasonForm> createState() => _RejectReasonFormState();
}

class _RejectReasonFormState extends State<RejectReasonForm> {
  final _form = GlobalKey<FormState>();
  final _ctrl = TextEditingController();
  String? _picked;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _pick(String r) {
    tapHaptic();
    setState(() {
      _picked = _picked == r ? null : r;
      _ctrl.text = _picked ?? '';
      _ctrl.selection = TextSelection.collapsed(offset: _ctrl.text.length);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final b = widget.booking;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
      child: Form(
        key: _form,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                IconTile(
                  icon: Icons.block_rounded,
                  color: theme.colorScheme.error,
                  size: 44,
                  iconSize: 22,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Reject payment', style: AppTheme.serif(size: 22)),
                      Text(
                        '${displayName(b)} · ${b.id}',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              'Why are you rejecting it?',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final r in kRejectReasons)
                  FilterPill(
                    label: r,
                    selected: _picked == r,
                    onTap: () => _pick(r),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _ctrl,
              maxLines: 3,
              minLines: 2,
              onChanged: (v) {
                if (_picked != null && v != _picked) {
                  setState(() => _picked = null);
                }
              },
              decoration: const InputDecoration(
                labelText: 'Reason (shown to the customer)',
                hintText: 'Pick one above or write your own',
                alignLabelWithHint: true,
              ),
              validator: (v) => (v == null || v.trim().length < 3)
                  ? 'Please enter a reason'
                  : null,
            ),
            const SizedBox(height: 8),
            Text(
              'The date is released so others can book it. The customer can submit a new payment.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: theme.colorScheme.error,
                    ),
                    onPressed: () {
                      if (_form.currentState!.validate()) {
                        tapHaptic();
                        Navigator.pop(context, _ctrl.text.trim());
                      }
                    },
                    icon: const Icon(Icons.block_rounded, size: 18),
                    label: const Text('Reject payment'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
