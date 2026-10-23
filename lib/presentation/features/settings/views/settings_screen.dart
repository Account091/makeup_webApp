import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_models.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../common/widgets/admin_widgets.dart';

/// Edits `settings/business` (read by the website and its booking API).
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late Future<BusinessSettings?> _load;

  @override
  void initState() {
    super.initState();
    _load = context.read<AdminRepositories>().settings.load();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<BusinessSettings?>(
      future: _load,
      builder: (context, snap) {
        final Widget child;
        if (snap.hasError) {
          child = ErrorView(
            error: snap.error!,
            onRetry: () => setState(() {
              _load = context.read<AdminRepositories>().settings.load();
            }),
          );
        } else if (snap.connectionState != ConnectionState.done) {
          child = const SkeletonList(count: 4, itemHeight: 150);
        } else {
          child = _SettingsForm(initial: snap.data, exists: snap.data != null);
        }
        return SmoothSwitcher(
          child: KeyedSubtree(
            key: ValueKey(snap.connectionState == ConnectionState.done),
            child: child,
          ),
        );
      },
    );
  }
}

class _SettingsForm extends StatefulWidget {
  final BusinessSettings? initial;
  final bool exists;
  const _SettingsForm({required this.initial, required this.exists});

  @override
  State<_SettingsForm> createState() => _SettingsFormState();
}

class _SettingsFormState extends State<_SettingsForm> {
  final _form = GlobalKey<FormState>();
  final _c = <String, TextEditingController>{};
  Map<String, String> _baseline = const {};
  bool _saving = false;
  late bool _exists = widget.exists;

  TextEditingController _ctrl(String key) => _c[key]!;

  @override
  void initState() {
    super.initState();
    final s = widget.initial ?? const BusinessSettings();
    String fee(String k) {
      final v = s.travelFees[k];
      if (v == null) return '';
      return v % 1 == 0 ? v.toStringAsFixed(0) : v.toString();
    }

    _c.addAll({
      'businessName': TextEditingController(text: s.businessName),
      'upiId': TextEditingController(text: s.upiId),
      'payeeName': TextEditingController(text: s.payeeName),
      'whatsappNumber': TextEditingController(text: s.whatsappNumber),
      'phoneDisplay': TextEditingController(text: s.phoneDisplay),
      'email': TextEditingController(text: s.email),
      'studioAddress': TextEditingController(text: s.studioAddress),
      'depositPercent': TextEditingController(text: '${s.depositPercent}'),
      'holdMinutes': TextEditingController(text: '${s.holdMinutes}'),
      for (final k in BusinessSettings.travelFeeKeys)
        'fee_$k': TextEditingController(text: fee(k)),
    });
    _baseline = _snapshot();
    for (final c in _c.values) {
      c.addListener(_onChanged);
    }
  }

  Map<String, String> _snapshot() => {
    for (final e in _c.entries) e.key: e.value.text,
  };

  bool get _dirty {
    for (final e in _c.entries) {
      if (_baseline[e.key] != e.value.text) return true;
    }
    return false;
  }

  /// Rebuild so the save bar and the UPI preview follow the edits.
  void _onChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    for (final c in _c.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _discard() {
    tapHaptic();
    for (final e in _c.entries) {
      e.value.text = _baseline[e.key] ?? '';
    }
    _form.currentState?.reset();
    for (final e in _c.entries) {
      e.value.text = _baseline[e.key] ?? '';
    }
    setState(() {});
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) {
      showErrorSnack(context, 'Please fix the highlighted fields.');
      return;
    }
    final settings = BusinessSettings(
      businessName: _ctrl('businessName').text.trim(),
      upiId: _ctrl('upiId').text.trim(),
      payeeName: _ctrl('payeeName').text.trim(),
      whatsappNumber: _ctrl('whatsappNumber').text.trim(),
      phoneDisplay: _ctrl('phoneDisplay').text.trim(),
      email: _ctrl('email').text.trim(),
      studioAddress: _ctrl('studioAddress').text.trim(),
      depositPercent: int.parse(_ctrl('depositPercent').text.trim()),
      holdMinutes: int.parse(_ctrl('holdMinutes').text.trim()),
      travelFees: {
        for (final k in BusinessSettings.travelFeeKeys)
          k: double.parse(_ctrl('fee_$k').text.trim()),
      },
    );
    setState(() => _saving = true);
    final repos = context.read<AdminRepositories>();
    final ok = await runWithFeedback(
      context,
      () => repos.settings.save(settings),
      success: 'Settings saved — the website uses them right away',
    );
    if (!mounted) return;
    setState(() {
      _saving = false;
      if (ok) {
        tapHaptic();
        _baseline = _snapshot();
        _exists = true;
      }
    });
  }

  Widget _field(
    String key,
    String label, {
    String? Function(String?)? validator,
    TextInputType? keyboard,
    String? helper,
    String? prefix,
    String? suffix,
    IconData? icon,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: _ctrl(key),
        keyboardType: keyboard,
        maxLines: maxLines,
        autovalidateMode: AutovalidateMode.onUserInteraction,
        decoration: InputDecoration(
          labelText: label,
          helperText: helper,
          prefixText: prefix,
          suffixText: suffix,
          prefixIcon: icon == null ? null : Icon(icon, size: 20),
        ),
        validator: validator,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dirty = _dirty;

    final business = _Group(
      icon: Icons.storefront_outlined,
      title: 'Business',
      description: 'Shown on the website and in messages to clients.',
      children: [
        _field(
          'businessName',
          'Business name *',
          icon: Icons.badge_outlined,
          validator: (v) => SettingsValidators.required(v, 'Business name'),
        ),
        _field(
          'email',
          'Email',
          icon: Icons.mail_outline_rounded,
          keyboard: TextInputType.emailAddress,
          validator: SettingsValidators.email,
        ),
        _field(
          'phoneDisplay',
          'Phone (display)',
          icon: Icons.call_outlined,
          helper: 'Shown on the website, e.g. +91 98000 00000',
        ),
        _field(
          'whatsappNumber',
          'WhatsApp number *',
          icon: Icons.chat_outlined,
          keyboard: TextInputType.phone,
          helper: 'Country code + number, digits only (919800000000)',
          validator: SettingsValidators.whatsapp,
        ),
        _field(
          'studioAddress',
          'Studio address',
          icon: Icons.place_outlined,
          maxLines: 2,
        ),
      ],
    );

    final qr = _UpiPreview(
      upiId: _ctrl('upiId').text.trim(),
      payee: _ctrl('payeeName').text.trim(),
    );

    final payments = _Group(
      icon: Icons.qr_code_2_rounded,
      title: 'Payments · UPI',
      description:
          'Clients pay the deposit to this UPI ID. Double-check it — the QR on the website is built from it.',
      children: [
        _field(
          'upiId',
          'UPI ID *',
          icon: Icons.alternate_email_rounded,
          helper: 'e.g. studio@okicici',
          validator: SettingsValidators.upiId,
        ),
        _field(
          'payeeName',
          'Payee name *',
          icon: Icons.person_outline_rounded,
          helper: 'Name shown in the client’s UPI app',
          validator: (v) => SettingsValidators.required(v, 'Payee name'),
        ),
      ],
    );

    final rules = _Group(
      icon: Icons.rule_rounded,
      title: 'Booking rules',
      description: 'How the website takes a booking.',
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _field(
                'depositPercent',
                'Deposit *',
                suffix: '%',
                keyboard: TextInputType.number,
                helper: 'Share of total, 1–100',
                validator: (v) =>
                    SettingsValidators.intInRange(v, 'Deposit percent', 1, 100),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _field(
                'holdMinutes',
                'Hold time *',
                suffix: 'min',
                keyboard: TextInputType.number,
                helper: 'Date held while paying, 5–1440',
                validator: (v) =>
                    SettingsValidators.intInRange(v, 'Hold minutes', 5, 1440),
              ),
            ),
          ],
        ),
      ],
    );

    final travel = _Group(
      icon: Icons.directions_car_outlined,
      title: 'Travel fees',
      description: 'Added to the total for events in each city.',
      children: [
        LayoutBuilder(
          builder: (context, c) {
            final w = (c.maxWidth - 12) / 2;
            return Wrap(
              spacing: 12,
              children: [
                for (final k in BusinessSettings.travelFeeKeys)
                  SizedBox(
                    width: w,
                    child: _field(
                      'fee_$k',
                      '${k[0].toUpperCase()}${k.substring(1)} *',
                      prefix: '₹ ',
                      keyboard: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      validator: SettingsValidators.nonNegativeAmount,
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );

    return Stack(
      children: [
        Form(
          key: _form,
          child: LayoutBuilder(
            builder: (context, c) {
              final wide = c.maxWidth >= 1000;
              final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
              final notice = !_exists
                  ? Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: AppCard(
                        shadow: false,
                        color: BrandColors.goldSoft,
                        borderColor: const Color(0xFFEBD9B4),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.info_outline_rounded,
                              color: BrandColors.gold,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'settings/business does not exist yet. Fill in the form and save to create it — the website needs it to take bookings.',
                                style: theme.textTheme.bodyMedium,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : const SizedBox.shrink();
              final bottom = dirty ? 120.0 : 32.0;
              if (wide) {
                return SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(pad, 4, pad, bottom),
                  child: Align(
                    alignment: Alignment.topLeft,
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1100),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                notice,
                                business,
                                const SizedBox(height: 16),
                                payments,
                                const SizedBox(height: 16),
                                rules,
                                const SizedBox(height: 16),
                                travel,
                              ],
                            ),
                          ),
                          const SizedBox(width: 24),
                          SizedBox(width: 320, child: qr),
                        ],
                      ),
                    ),
                  ),
                );
              }
              return ListView(
                padding: EdgeInsets.fromLTRB(pad, 4, pad, bottom),
                children: [
                  notice,
                  business,
                  const SizedBox(height: 16),
                  payments,
                  const SizedBox(height: 12),
                  qr,
                  const SizedBox(height: 16),
                  rules,
                  const SizedBox(height: 16),
                  travel,
                ],
              );
            },
          ),
        ),
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: _SaveBar(
            visible: dirty || _saving,
            saving: _saving,
            onSave: _save,
            onDiscard: _discard,
          ),
        ),
      ],
    );
  }
}

class _Group extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final List<Widget> children;
  const _Group({
    required this.icon,
    required this.title,
    required this.description,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              IconTile(
                icon: icon,
                color: BrandColors.gold,
                size: 38,
                iconSize: 19,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: theme.textTheme.titleMedium),
                    Text(description, style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          ...children,
        ],
      ),
    );
  }
}

class _UpiPreview extends StatelessWidget {
  final String upiId;
  final String payee;
  const _UpiPreview({required this.upiId, required this.payee});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final valid = SettingsValidators.upiId(upiId) == null;
    final uri = Uri(
      scheme: 'upi',
      host: 'pay',
      queryParameters: {'pa': upiId, 'pn': payee, 'cu': 'INR'},
    ).toString();
    return Container(
      decoration: BoxDecoration(
        gradient: BrandColors.plumGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppShadows.lifted,
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(
                Icons.visibility_outlined,
                size: 16,
                color: BrandColors.goldBright,
              ),
              const SizedBox(width: 8),
              Text(
                'LIVE PREVIEW',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: BrandColors.goldBright,
                  letterSpacing: 1.6,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: AnimatedSwitcher(
              duration: motion(context, const Duration(milliseconds: 250)),
              child: valid
                  ? QrImageView(
                      key: ValueKey(uri),
                      data: uri,
                      size: 168,
                      padding: EdgeInsets.zero,
                      eyeStyle: const QrEyeStyle(
                        eyeShape: QrEyeShape.circle,
                        color: BrandColors.plumInk,
                      ),
                      dataModuleStyle: const QrDataModuleStyle(
                        dataModuleShape: QrDataModuleShape.circle,
                        color: BrandColors.plum,
                      ),
                    )
                  : SizedBox(
                      key: const ValueKey('invalid'),
                      width: 168,
                      height: 168,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.qr_code_2_rounded,
                            size: 48,
                            color: Color(0xFFD8CABC),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Enter a valid UPI ID',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            payee.isEmpty ? 'Payee name' : payee,
            textAlign: TextAlign.center,
            style: AppTheme.serif(size: 20, color: Colors.white),
          ),
          const SizedBox(height: 4),
          Text(
            upiId.isEmpty ? 'yourname@bank' : upiId,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.75),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'This is how clients see you in their UPI app.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.55),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _SaveBar extends StatelessWidget {
  final bool visible;
  final bool saving;
  final VoidCallback onSave;
  final VoidCallback onDiscard;
  const _SaveBar({
    required this.visible,
    required this.saving,
    required this.onSave,
    required this.onDiscard,
  });

  @override
  Widget build(BuildContext context) {
    final d = motion(context, const Duration(milliseconds: 280));
    return IgnorePointer(
      ignoring: !visible,
      child: AnimatedSlide(
        duration: d,
        curve: Curves.easeOutCubic,
        offset: visible ? Offset.zero : const Offset(0, 1.2),
        child: AnimatedOpacity(
          duration: d,
          opacity: visible ? 1 : 0,
          child: SafeArea(
            top: false,
            child: Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 640),
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                padding: const EdgeInsets.fromLTRB(18, 10, 10, 10),
                decoration: BoxDecoration(
                  color: BrandColors.plumInk,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: AppShadows.lifted,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: BrandColors.goldBright,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'Unsaved changes',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: saving ? null : onDiscard,
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.white70,
                      ),
                      child: const Text('Discard'),
                    ),
                    const SizedBox(width: 6),
                    FilledButton(
                      onPressed: saving ? null : onSave,
                      style: FilledButton.styleFrom(
                        backgroundColor: BrandColors.goldBright,
                        foregroundColor: BrandColors.plumDeep,
                        minimumSize: const Size(96, 42),
                      ),
                      child: saving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: BrandColors.plumDeep,
                              ),
                            )
                          : const Text('Save'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
