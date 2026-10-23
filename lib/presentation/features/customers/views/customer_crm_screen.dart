import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../../domain/entities/booking_entity.dart';
import '../../../../domain/services/customer_aggregation.dart';
import '../../../common/widgets/admin_widgets.dart';
import '../../bookings/booking_actions.dart';
import '../../bookings/bookings_screen.dart';

/// Customers derived live from `bookings`, grouped by phone.
class CustomerCrmScreen extends StatefulWidget {
  const CustomerCrmScreen({super.key});

  @override
  State<CustomerCrmScreen> createState() => _CustomerCrmScreenState();
}

class _CustomerCrmScreenState extends State<CustomerCrmScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    return LiveStreamBuilder<List<BookingEntity>>(
      create: repos.bookings.watchAll,
      loading: (_) => const SkeletonList(withHeader: true),
      builder: (context, bookings) {
        final all = aggregateCustomers(bookings);
        final q = _query.trim().toLowerCase();
        final customers = all
            .where(
              (c) =>
                  q.isEmpty ||
                  c.name.toLowerCase().contains(q) ||
                  c.phone.contains(q) ||
                  c.email.toLowerCase().contains(q),
            )
            .toList();
        final collected = all.fold<double>(0, (s, c) => s + c.totalPaid);
        return LayoutBuilder(
          builder: (context, c) {
            final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
            final cols = c.maxWidth >= 1100 ? 2 : 1;
            return Column(
              children: [
                Padding(
                  padding: EdgeInsets.fromLTRB(pad, 4, pad, 8),
                  child: SearchField(
                    hint: 'Search name, phone or email',
                    onChanged: (v) => setState(() => _query = v),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(pad, 4, pad, 12),
                  child: Row(
                    children: [
                      StatusChip(
                        label:
                            '${all.length} customer${all.length == 1 ? '' : 's'}',
                        color: BrandColors.plum,
                      ),
                      const SizedBox(width: 8),
                      StatusChip(
                        label: '${formatInr(collected)} collected',
                        color: BrandColors.gold,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: customers.isEmpty
                      ? EmptyState(
                          icon: Icons.people_alt_outlined,
                          title: bookings.isEmpty
                              ? 'No customers yet'
                              : 'No matches',
                          message: bookings.isEmpty
                              ? 'Customers appear once they book on the website.'
                              : 'No customers match your search.',
                        )
                      : RefreshIndicator(
                          color: BrandColors.plum,
                          onRefresh: () =>
                              Future.delayed(const Duration(milliseconds: 600)),
                          child: GridView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: EdgeInsets.fromLTRB(pad, 0, pad, 28),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: cols,
                                  mainAxisSpacing: 10,
                                  crossAxisSpacing: 12,
                                  mainAxisExtent: 96,
                                ),
                            itemCount: customers.length,
                            itemBuilder: (context, i) => FadeSlideIn(
                              key: ValueKey(customers[i].phone),
                              index: i,
                              child: _CustomerTile(customer: customers[i]),
                            ),
                          ),
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

class _CustomerTile extends StatelessWidget {
  final CustomerSummary customer;
  const _CustomerTile({required this.customer});

  @override
  Widget build(BuildContext context) {
    final c = customer;
    final theme = Theme.of(context);
    return AppCard(
      semanticLabel: 'Customer ${c.name}',
      onTap: () {
        tapHaptic();
        showCustomerProfile(context, c);
      },
      padding: const EdgeInsets.fromLTRB(14, 12, 16, 12),
      child: Row(
        children: [
          InitialsAvatar(name: c.name, size: 48),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  c.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 2),
                Text(c.phone, style: theme.textTheme.bodySmall),
                const SizedBox(height: 4),
                Text(
                  [
                    '${c.bookingCount} booking${c.bookingCount == 1 ? '' : 's'}',
                    if (c.lastEventDate != null)
                      'last ${formatDateKeyShort(c.lastEventDate!)}',
                  ].join(' · '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: BrandColors.muted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatInr(c.totalPaid),
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text('paid', style: theme.textTheme.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}

/// Customer profile with contact actions and their bookings.
Future<void> showCustomerProfile(BuildContext context, CustomerSummary c) {
  return showAdaptivePanel<void>(
    context,
    width: 520,
    builder: (ctx) => _CustomerProfile(customer: c, showClose: true),
  );
}

class _CustomerProfile extends StatelessWidget {
  final CustomerSummary customer;
  final bool showClose;
  const _CustomerProfile({required this.customer, required this.showClose});

  @override
  Widget build(BuildContext context) {
    final c = customer;
    final theme = Theme.of(context);
    final latest = c.bookings.isEmpty ? null : c.bookings.first;
    return ListView(
      padding: EdgeInsets.fromLTRB(20, showClose ? 12 : 0, 20, 28),
      children: [
        if (showClose)
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              tooltip: 'Close',
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.close_rounded),
            ),
          ),
        Center(child: InitialsAvatar(name: c.name, size: 76)),
        const SizedBox(height: 12),
        Text(
          c.name,
          textAlign: TextAlign.center,
          style: AppTheme.serif(size: 26),
        ),
        Text(
          [c.phone, if (c.email.isNotEmpty) c.email].join(' · '),
          textAlign: TextAlign.center,
          style: theme.textTheme.bodySmall,
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (c.phone.isNotEmpty && c.phone != '(no phone)') ...[
              FilledButton.tonalIcon(
                onPressed: () => callCustomer(context, c.phone),
                icon: const Icon(Icons.call_rounded, size: 18),
                label: const Text('Call'),
              ),
              const SizedBox(width: 8),
              if (latest != null)
                FilledButton.tonalIcon(
                  onPressed: () => whatsappCustomer(context, latest),
                  icon: const Icon(Icons.chat_rounded, size: 18),
                  label: const Text('WhatsApp'),
                ),
            ],
            if (c.email.isNotEmpty) ...[
              const SizedBox(width: 8),
              IconButton.filledTonal(
                tooltip: 'Email',
                onPressed: () =>
                    launchUrl(Uri(scheme: 'mailto', path: c.email)),
                icon: const Icon(Icons.mail_outline_rounded, size: 18),
              ),
            ],
          ],
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            _Stat(label: 'Bookings', value: '${c.bookingCount}'),
            const SizedBox(width: 10),
            _Stat(label: 'Total paid', value: formatInr(c.totalPaid)),
            const SizedBox(width: 10),
            _Stat(
              label: 'Last event',
              value: c.lastEventDate == null
                  ? '—'
                  : formatDateKeyShort(c.lastEventDate!),
            ),
          ],
        ),
        const SectionTitle('Bookings'),
        for (var i = 0; i < c.bookings.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: FadeSlideIn(
              index: i,
              child: BookingTile(booking: c.bookings[i]),
            ),
          ),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: AppCard(
        shadow: false,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        child: Column(
          children: [
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(label, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
