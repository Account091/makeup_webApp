import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/admin/admin_models.dart';
import '../../../../data/admin/admin_repositories.dart';
import '../../../common/widgets/admin_widgets.dart';

StudioService _copy(StudioService s, {bool? active, int? sortOrder}) =>
    StudioService(
      id: s.id,
      title: s.title,
      description: s.description,
      price: s.price,
      category: s.category,
      durationMinutes: s.durationMinutes,
      imageUrl: s.imageUrl,
      active: active ?? s.active,
      sortOrder: sortOrder ?? s.sortOrder,
    );

/// Opens the add/edit form sheet and saves on submit. [all] is used for
/// category suggestions and to append new services at the end.
Future<void> showServiceEditor(
  BuildContext context, {
  StudioService? existing,
  List<StudioService>? all,
}) async {
  final repos = context.read<AdminRepositories>();
  var services = all;
  if (services == null) {
    try {
      services = await repos.services.watchAll().first;
    } catch (_) {
      services = const [];
    }
    if (!context.mounted) return;
  }
  final result = await showAppSheet<_EditorResult>(
    context,
    maxWidth: 640,
    builder: (_) => _ServiceForm(existing: existing, all: services!),
  );
  if (result == null || !context.mounted) return;
  if (result.delete && existing != null) {
    await _deleteService(context, repos, existing);
    return;
  }
  final s = result.service!;
  final ok = await runWithFeedback(
    context,
    () =>
        existing == null ? repos.services.create(s) : repos.services.update(s),
    success: existing == null ? '"${s.title}" added' : '"${s.title}" updated',
  );
  if (ok) tapHaptic();
}

Future<void> _deleteService(
  BuildContext context,
  AdminRepositories repos,
  StudioService s,
) async {
  final ok = await confirmDialog(
    context,
    title: 'Delete "${s.title}"?',
    message:
        'The service is removed from the website. Existing bookings keep their copy of the title and price. '
        'Tip: switch it off instead if you may offer it again.',
    confirmLabel: 'Delete',
    destructive: true,
  );
  if (!ok || !context.mounted) return;
  await runWithFeedback(
    context,
    () => repos.services.delete(s.id),
    success: 'Service deleted',
  );
}

/// CRUD for the `services` collection (live), with drag-to-reorder.
class AdminServicesScreen extends StatefulWidget {
  const AdminServicesScreen({super.key});

  @override
  State<AdminServicesScreen> createState() => _AdminServicesScreenState();
}

class _AdminServicesScreenState extends State<AdminServicesScreen> {
  /// Optimistic local order (ids) after a drag, until the stream catches up.
  List<String>? _order;

  /// Optimistic active toggles.
  final Map<String, bool> _active = {};
  List<StudioService> _latest = const [];

  List<StudioService> _apply(List<StudioService> live) {
    _latest = live;
    final byId = {for (final s in live) s.id: s};
    var list = live;
    final order = _order;
    if (order != null) {
      final ordered = [
        for (final id in order)
          if (byId.containsKey(id)) byId[id]!,
        ...live.where((s) => !order.contains(s.id)),
      ];
      final liveIds = live.map((s) => s.id).toList();
      final orderedIds = ordered.map((s) => s.id).toList();
      if (_listEq(liveIds, orderedIds)) {
        _order = null; // stream caught up
      } else {
        list = ordered;
      }
    }
    _active.removeWhere((id, v) => byId[id]?.active == v);
    return [
      for (final s in list)
        _active.containsKey(s.id) ? _copy(s, active: _active[s.id]) : s,
    ];
  }

  static bool _listEq(List<String> a, List<String> b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  Future<void> _reorder(
    List<StudioService> shown,
    int oldIndex,
    int newIndex,
  ) async {
    if (newIndex > oldIndex) newIndex -= 1;
    final list = [...shown];
    final moved = list.removeAt(oldIndex);
    list.insert(newIndex, moved);
    setState(() => _order = list.map((s) => s.id).toList());
    tapHaptic();
    final repos = context.read<AdminRepositories>();
    try {
      final byId = {for (final s in _latest) s.id: s};
      await Future.wait([
        for (var i = 0; i < list.length; i++)
          if ((byId[list[i].id]?.sortOrder ?? -1) != i)
            repos.services.update(
              _copy(byId[list[i].id] ?? list[i], sortOrder: i),
            ),
      ]);
    } catch (e) {
      if (mounted) {
        setState(() => _order = null);
        showErrorSnack(context, e);
      }
    }
  }

  Future<void> _toggle(StudioService s, bool value) async {
    tapHaptic();
    setState(() => _active[s.id] = value);
    final repos = context.read<AdminRepositories>();
    final base = _latest.firstWhere((x) => x.id == s.id, orElse: () => s);
    try {
      await repos.services.update(_copy(base, active: value));
      if (!mounted) return;
      showSuccessSnack(
        context,
        value
            ? '"${s.title}" is live on the website'
            : '"${s.title}" hidden from the website',
        actionLabel: 'Undo',
        onAction: () => _toggle(s, !value),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _active.remove(s.id));
        showErrorSnack(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final repos = context.read<AdminRepositories>();
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'add-service',
        onPressed: () {
          tapHaptic();
          showServiceEditor(context, all: _latest);
        },
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add service'),
      ),
      body: LiveStreamBuilder<List<StudioService>>(
        create: repos.services.watchAll,
        builder: (context, live) {
          final services = _apply(live);
          if (services.isEmpty) {
            return EmptyState(
              icon: Icons.auto_awesome_outlined,
              title: 'No services yet',
              message:
                  'Add your first service — active services are listed on the website.',
              action: FilledButton.icon(
                onPressed: () => showServiceEditor(context, all: live),
                icon: const Icon(Icons.add_rounded),
                label: const Text('Add service'),
              ),
            );
          }
          final activeCount = services.where((s) => s.active).length;
          return LayoutBuilder(
            builder: (context, c) {
              final pad = c.maxWidth >= 600 ? 28.0 : 16.0;
              final desktop = c.maxWidth >= 700;
              return Align(
                alignment: Alignment.topLeft,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 900),
                  child: ReorderableListView.builder(
                    buildDefaultDragHandles: false,
                    padding: EdgeInsets.fromLTRB(pad, 4, pad, 110),
                    header: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          StatusChip(
                            label: '$activeCount live',
                            color: StatusColors.confirmed,
                          ),
                          const SizedBox(width: 8),
                          if (services.length > activeCount)
                            StatusChip(
                              label: '${services.length - activeCount} hidden',
                              color: StatusColors.expired,
                            ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              desktop
                                  ? 'Drag the handle to reorder how services appear on the website'
                                  : 'Long-press a card to reorder',
                              style: Theme.of(context).textTheme.bodySmall,
                              maxLines: 2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    proxyDecorator: (child, index, anim) => AnimatedBuilder(
                      animation: anim,
                      builder: (context, child) => Transform.scale(
                        scale: lerpDouble(
                          1,
                          1.02,
                          Curves.easeOut.transform(anim.value),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          elevation: lerpDouble(0, 10, anim.value)!,
                          shadowColor: const Color(0x552C1320),
                          borderRadius: BorderRadius.circular(AppTheme.radius),
                          child: child,
                        ),
                      ),
                      child: child,
                    ),
                    onReorder: (o, n) => _reorder(services, o, n),
                    itemCount: services.length,
                    itemBuilder: (context, i) {
                      final s = services[i];
                      final card = _ServiceCard(
                        service: s,
                        index: i,
                        desktop: desktop,
                        onToggle: (v) => _toggle(s, v),
                        onEdit: () =>
                            showServiceEditor(context, existing: s, all: live),
                        onDelete: () => _deleteService(context, repos, s),
                      );
                      return Padding(
                        key: ValueKey(s.id),
                        padding: const EdgeInsets.only(bottom: 10),
                        child: FadeSlideIn(
                          index: i,
                          child: desktop
                              ? card
                              : ReorderableDelayedDragStartListener(
                                  index: i,
                                  child: card,
                                ),
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final StudioService service;
  final int index;
  final bool desktop;
  final ValueChanged<bool> onToggle;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ServiceCard({
    required this.service,
    required this.index,
    required this.desktop,
    required this.onToggle,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final s = service;
    final theme = Theme.of(context);
    return AppCard(
      semanticLabel: 'Service ${s.title}',
      onTap: onEdit,
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 12),
      child: AnimatedOpacity(
        duration: motion(context, const Duration(milliseconds: 200)),
        opacity: s.active ? 1 : 0.55,
        child: Row(
          children: [
            if (desktop)
              ReorderableDragStartListener(
                index: index,
                child: const MouseRegion(
                  cursor: SystemMouseCursors.grab,
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 10),
                    child: Icon(
                      Icons.drag_indicator_rounded,
                      color: Color(0xFFC9BBB0),
                    ),
                  ),
                ),
              )
            else
              const SizedBox(width: 6),
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                gradient: s.active
                    ? BrandColors.plumGradient
                    : const LinearGradient(
                        colors: [Color(0xFFB9ADB0), Color(0xFF9C8F93)],
                      ),
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Text(
                InitialsAvatar.initialsOf(s.title.isEmpty ? '?' : s.title),
                style: AppTheme.serif(
                  size: 17,
                  color: BrandColors.goldBright,
                  weight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    s.title.isEmpty ? '(untitled)' : s.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      if (s.category.isNotEmpty)
                        MetaChip(
                          icon: Icons.local_offer_outlined,
                          label: s.category,
                          color: BrandColors.gold,
                          background: BrandColors.goldSoft,
                        ),
                      if (s.durationMinutes != null)
                        MetaChip(
                          icon: Icons.schedule_rounded,
                          label: _duration(s.durationMinutes!),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              formatInr(s.price),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(width: 4),
            Tooltip(
              message: s.active ? 'Shown on website' : 'Hidden from website',
              child: Switch(value: s.active, onChanged: onToggle),
            ),
            PopupMenuButton<String>(
              tooltip: 'More',
              icon: const Icon(
                Icons.more_vert_rounded,
                color: BrandColors.muted,
              ),
              onSelected: (v) => v == 'edit' ? onEdit() : onDelete(),
              itemBuilder: (_) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: ListTile(
                    leading: Icon(Icons.edit_outlined),
                    title: Text('Edit'),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
                PopupMenuItem(
                  value: 'delete',
                  child: ListTile(
                    leading: Icon(
                      Icons.delete_outline_rounded,
                      color: theme.colorScheme.error,
                    ),
                    title: Text(
                      'Delete',
                      style: TextStyle(color: theme.colorScheme.error),
                    ),
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static String _duration(int m) {
    if (m < 60) return '$m min';
    final h = m ~/ 60;
    final r = m % 60;
    return r == 0 ? '$h h' : '$h h $r min';
  }
}

class _EditorResult {
  final StudioService? service;
  final bool delete;
  const _EditorResult.save(this.service) : delete = false;
  const _EditorResult.delete() : service = null, delete = true;
}

class _ServiceForm extends StatefulWidget {
  final StudioService? existing;
  final List<StudioService> all;
  const _ServiceForm({this.existing, required this.all});

  @override
  State<_ServiceForm> createState() => _ServiceFormState();
}

class _ServiceFormState extends State<_ServiceForm> {
  final _form = GlobalKey<FormState>();
  late final TextEditingController _title,
      _desc,
      _price,
      _category,
      _duration,
      _image;
  late bool _active;

  @override
  void initState() {
    super.initState();
    final s = widget.existing;
    _title = TextEditingController(text: s?.title ?? '');
    _desc = TextEditingController(text: s?.description ?? '');
    _price = TextEditingController(
      text: s == null ? '' : s.price.toStringAsFixed(s.price % 1 == 0 ? 0 : 2),
    );
    _category = TextEditingController(text: s?.category ?? '');
    _duration = TextEditingController(
      text: s?.durationMinutes?.toString() ?? '',
    );
    _image = TextEditingController(text: s?.imageUrl ?? '');
    _active = s?.active ?? true;
  }

  @override
  void dispose() {
    for (final c in [_title, _desc, _price, _category, _duration, _image]) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit() {
    if (!_form.currentState!.validate()) return;
    tapHaptic();
    final maxOrder = widget.all.fold<int>(
      -1,
      (m, s) => s.sortOrder > m ? s.sortOrder : m,
    );
    Navigator.pop(
      context,
      _EditorResult.save(
        StudioService(
          id: widget.existing?.id ?? '',
          title: _title.text.trim(),
          description: _desc.text.trim(),
          price: double.parse(_price.text.trim()),
          category: _category.text.trim(),
          durationMinutes: _duration.text.trim().isEmpty
              ? null
              : int.parse(_duration.text.trim()),
          imageUrl: _image.text.trim().isEmpty ? null : _image.text.trim(),
          active: _active,
          sortOrder: widget.existing?.sortOrder ?? maxOrder + 1,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const gap = SizedBox(height: 14);
    final categories = {
      for (final s in widget.all)
        if (s.category.trim().isNotEmpty) s.category.trim(),
    }.toList()..sort();
    final editing = widget.existing != null;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: Form(
              key: _form,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    editing ? 'Edit service' : 'New service',
                    style: AppTheme.serif(size: 24),
                  ),
                  Text(
                    'Active services are listed on the website for booking.',
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _title,
                    autofocus: !editing,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Title *',
                      hintText: 'e.g. Signature Bridal Makeup',
                    ),
                    validator: (v) => SettingsValidators.required(v, 'Title'),
                  ),
                  gap,
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _price,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: const InputDecoration(
                            labelText: 'Price *',
                            prefixText: '₹ ',
                          ),
                          validator: (v) {
                            final n = double.tryParse((v ?? '').trim());
                            if (n == null) return 'Enter a price';
                            if (n <= 0) return 'Must be more than 0';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _duration,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Duration',
                            suffixText: 'min',
                          ),
                          validator: (v) {
                            if (v == null || v.trim().isEmpty) return null;
                            final n = int.tryParse(v.trim());
                            return (n == null || n <= 0)
                                ? 'Whole minutes, > 0'
                                : null;
                          },
                        ),
                      ),
                    ],
                  ),
                  gap,
                  TextFormField(
                    controller: _category,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Category',
                      hintText: 'e.g. Bridal, Party',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  if (categories.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        for (final cat in categories)
                          FilterPill(
                            label: cat,
                            selected: _category.text.trim() == cat,
                            onTap: () => setState(() => _category.text = cat),
                          ),
                      ],
                    ),
                  ],
                  gap,
                  TextFormField(
                    controller: _desc,
                    maxLines: 3,
                    minLines: 2,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      alignLabelWithHint: true,
                    ),
                  ),
                  gap,
                  TextFormField(
                    controller: _image,
                    keyboardType: TextInputType.url,
                    decoration: const InputDecoration(
                      labelText: 'Image URL (optional)',
                      prefixIcon: Icon(Icons.image_outlined),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return null;
                      final u = Uri.tryParse(v.trim());
                      return (u == null || !u.isAbsolute)
                          ? 'Enter a full URL'
                          : null;
                    },
                  ),
                  gap,
                  AppCard(
                    shadow: false,
                    padding: const EdgeInsets.fromLTRB(16, 6, 8, 6),
                    child: SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        'Show on website',
                        style: theme.textTheme.titleSmall,
                      ),
                      subtitle: Text(
                        _active
                            ? 'Clients can book this service'
                            : 'Hidden — kept for your records',
                        style: theme.textTheme.bodySmall,
                      ),
                      value: _active,
                      onChanged: (v) => setState(() => _active = v),
                    ),
                  ),
                  if (editing) ...[
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        style: TextButton.styleFrom(
                          foregroundColor: theme.colorScheme.error,
                        ),
                        onPressed: () => Navigator.pop(
                          context,
                          const _EditorResult.delete(),
                        ),
                        icon: const Icon(Icons.delete_outline_rounded),
                        label: const Text('Delete service'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: BrandColors.outline)),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    onPressed: _submit,
                    child: Text(editing ? 'Save changes' : 'Add service'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
