import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/services/hugging_face_ai_service.dart';

class AutomationRule {
  final String id;
  final String name;
  final String trigger;
  final String condition;
  final String action;
  final String templateName;
  bool isEnabled;

  AutomationRule({
    required this.id,
    required this.name,
    required this.trigger,
    required this.condition,
    required this.action,
    required this.templateName,
    this.isEnabled = true,
  });
}

class WhatsappDashboardScreen extends StatefulWidget {
  const WhatsappDashboardScreen({super.key});

  @override
  State<WhatsappDashboardScreen> createState() =>
      _WhatsappDashboardScreenState();
}

class _WhatsappDashboardScreenState extends State<WhatsappDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const Color antiqueBronze = Color(0xFF8C6D23);
  static const Color royalGoldDark = Color(0xFF4A3710);
  static const Color goldBorder = Color(0x33D4AF37);

  final List<AutomationRule> _rules = [
    AutomationRule(
      id: 'rule_01',
      name: 'Booking Advance Receipt & Portal Onboarding',
      trigger: 'DEPOSIT_CONFIRMED',
      condition: 'deposit_status == "PAID"',
      action: 'Send Verified WhatsApp Receipt + "My Wedding" Hub Magic Link',
      templateName: 'booking_confirmed_v4',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_02',
      name: 'Palace Suite 5-Point Readiness Checklist',
      trigger: 'T_MINUS_7_DAYS',
      condition: 'event_type == "DESTINATION_PALACE"',
      action: 'Send Power, Mirror & Natural Light Checklist to Bride & Event Coordinator',
      templateName: 'venue_readiness_v2',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_03',
      name: '48-Hour Skincare & Hair Protocol',
      trigger: 'T_MINUS_48_HOURS',
      condition: 'days_remaining <= 2',
      action: 'Send "No New Chemical Treatments" Warning & Hydration Routine',
      templateName: 'skincare_countdown_48h',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_04',
      name: 'Wedding-Day ETA & Artist Live Tracking',
      trigger: 'ARTIST_DISPATCHED',
      condition: 'dispatch_status == "IN_TRANSIT"',
      action: 'Send WhatsApp message with Lead Artist ETA & contact card',
      templateName: 'artist_dispatch_eta_v1',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_05',
      name: 'Post-Wedding Blessings & DPDP Consent Feedback',
      trigger: 'EVENT_COMPLETED',
      condition: 'status == "COMPLETED"',
      action: 'Request Bridal Review & DPDP Photo Sharing Consent Form',
      templateName: 'post_event_feedback_dpdp',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_06',
      name: 'VIP Destination Lead Ops Escalation',
      trigger: 'HIGH_VALUE_INQUIRY',
      condition: 'gross_amount >= 50000 && city in ["Jodhpur", "Udaipur", "Jaipur"]',
      action: 'Alert Senior Operations Lead on Slack & assign VIP Concierge',
      templateName: 'vip_ops_alert_internal',
      isEnabled: true,
    ),
    AutomationRule(
      id: 'rule_07',
      name: 'Aging Balance Gentle WhatsApp Reminder',
      trigger: 'BALANCE_OVERDUE_48H',
      condition: 'balance_due > 0 && days_remaining <= 5',
      action: 'Send Razorpay Escrow balance settlement link with Section 269ST compliance notice',
      templateName: 'balance_reminder_escrow',
      isEnabled: false,
    ),
  ];

  final List<Map<String, dynamic>> _fallbackLogs = [
    {
      'id': 'evt_01',
      'trigger': 'DEPOSIT_CONFIRMED',
      'client': 'Radhika Jodhpur (+91 98290 12345)',
      'status': 'Read',
      'time': '10 mins ago',
      'template': 'booking_confirmed_v4',
    },
    {
      'id': 'evt_02',
      'trigger': 'T_MINUS_7_DAYS',
      'client': 'Ananya Rathore (+91 94140 67890)',
      'status': 'Delivered',
      'time': '2 hours ago',
      'template': 'venue_readiness_v2',
    },
    {
      'id': 'evt_03',
      'trigger': 'T_MINUS_48_HOURS',
      'client': 'Kavita Mehta (+91 97850 54321)',
      'status': 'Sent',
      'time': '5 hours ago',
      'template': 'skincare_countdown_48h',
    },
    {
      'id': 'evt_04',
      'trigger': 'EVENT_COMPLETED',
      'client': 'Sunita Shekhawat (+91 98280 99887)',
      'status': 'Read',
      'time': 'Yesterday',
      'template': 'post_event_feedback_dpdp',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showAddRuleDialog() {
    final nameCtrl = TextEditingController();
    String selectedTrigger = 'DEPOSIT_CONFIRMED';
    String condition = 'amount > 25000';
    String action = 'Send WhatsApp template & create receipt';
    String template = 'bridal_welcome_v4';

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: AppColors.champagne,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: goldBorder),
              ),
              title: Row(
                children: [
                  const Icon(Icons.flash_on, color: antiqueBronze, size: 22),
                  const SizedBox(width: 8),
                  Text(
                    'Create Automation Rule',
                    style: AppTextStyles.headingTitle.copyWith(
                      color: royalGoldDark,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
              content: SizedBox(
                width: 460,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('RULE NAME', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: nameCtrl,
                        decoration: InputDecoration(
                          hintText: 'e.g. 24h Bridal Ready-Time Check',
                          hintStyle: const TextStyle(fontSize: 12),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 14),

                      Text('EVENT TRIGGER', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      DropdownButtonFormField<String>(
                        initialValue: selectedTrigger,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'DEPOSIT_CONFIRMED', child: Text('Deposit Confirmed (Advance Received)')),
                          DropdownMenuItem(value: 'T_MINUS_7_DAYS', child: Text('7 Days Before Wedding Day')),
                          DropdownMenuItem(value: 'T_MINUS_48_HOURS', child: Text('48 Hours Before Call Time')),
                          DropdownMenuItem(value: 'ARTIST_DISPATCHED', child: Text('Artist On The Way (Live ETA)')),
                          DropdownMenuItem(value: 'EVENT_COMPLETED', child: Text('Wedding Event Completed')),
                          DropdownMenuItem(value: 'BALANCE_OVERDUE_48H', child: Text('Balance Payment Overdue')),
                        ],
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedTrigger = val);
                        },
                      ),
                      const SizedBox(height: 14),

                      Text('CONDITION RULE (EXPRESSION)', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: condition,
                        onChanged: (val) => condition = val,
                        decoration: InputDecoration(
                          hintText: 'e.g. balance_due > 0 && is_destination == true',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 14),

                      Text('ACTION DISPATCH', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: action,
                        onChanged: (val) => action = val,
                        decoration: InputDecoration(
                          hintText: 'Action details...',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 14),

                      Text('WHATSAPP TEMPLATE', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: template,
                        onChanged: (val) => template = val,
                        decoration: InputDecoration(
                          hintText: 'e.g. bridal_ready_v1',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.deepPlum,
                    foregroundColor: AppColors.roseGold,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {
                    if (nameCtrl.text.trim().isEmpty) return;
                    setState(() {
                      _rules.add(
                        AutomationRule(
                          id: 'rule_${DateTime.now().millisecondsSinceEpoch}',
                          name: nameCtrl.text.trim(),
                          trigger: selectedTrigger,
                          condition: condition,
                          action: action,
                          templateName: template,
                          isEnabled: true,
                        ),
                      );
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Rule "${nameCtrl.text.trim()}" activated successfully!'),
                        backgroundColor: AppColors.emeraldGreen,
                      ),
                    );
                  },
                  child: const Text('Save & Activate Rule'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showTemplatePreview(String templateName) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.champagne,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.chat, color: Color(0xFF25D366), size: 24),
                      const SizedBox(width: 8),
                      Text(
                        'Template Preview: $templateName',
                        style: AppTextStyles.headingTitle.copyWith(fontSize: 16),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCF8C6),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Makeovers by Prachi — Official Notification',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF075E54)),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Namaste {{1}}! ✨\n\n'
                      'We have registered your upcoming wedding booking for {{2}} at {{3}}.\n\n'
                      'Your personal Bridal Command Center is ready. You can inspect your reverse-timing schedule, palace suite checklist, and facial countdown anytime:\n'
                      '🔗 https://makeoversbyprachi.com/my-wedding\n\n'
                      'With Royal Warmth,\nTeam Makeovers by Prachi 👑',
                      style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.black87),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: const [
                        Text('11:42 AM', style: TextStyle(fontSize: 10, color: Colors.black54)),
                        SizedBox(width: 4),
                        Icon(Icons.done_all, color: Colors.blue, size: 14),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.send_outlined, size: 16),
                      label: const Text('Send Test to Admin WhatsApp'),
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Test WhatsApp template dispatched to +91 98290 12345'),
                            backgroundColor: Color(0xFF075E54),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showHfAutoPilotModal() {
    String brideName = 'Radhika Jodhpur';
    String brideMsg = 'Hi Prachi! Can you tell me what package includes 2 draping artists and airbrush?';
    String generatedReply = '';
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              backgroundColor: AppColors.champagne,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: goldBorder),
              ),
              title: Row(
                children: [
                  const Icon(Icons.psychology, color: antiqueBronze, size: 24),
                  const SizedBox(width: 8),
                  Text(
                    'Hugging Face AI Auto-Pilot',
                    style: AppTextStyles.headingTitle.copyWith(
                      color: royalGoldDark,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
              content: SizedBox(
                width: 500,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.deepPlum.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: goldBorder),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.bolt, color: antiqueBronze, size: 16),
                            SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Powered by free Hugging Face Inference API (Qwen 2.5 / Mistral 7B) with zero-cost automation.',
                                style: TextStyle(fontSize: 11, color: royalGoldDark),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text('BRIDE / CLIENT', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: brideName,
                        onChanged: (val) => brideName = val,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text('INCOMING INQUIRY', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: brideMsg,
                        maxLines: 2,
                        onChanged: (val) => brideMsg = val,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (isLoading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(color: antiqueBronze),
                          ),
                        )
                      else if (generatedReply.isNotEmpty) ...[
                        Text('GENERATED AI RESPONSE (WHATSAPP READY)', style: AppTextStyles.bodySecondary.copyWith(fontSize: 11, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCF8C6),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.4)),
                          ),
                          child: SelectableText(
                            generatedReply,
                            style: const TextStyle(fontSize: 12, color: Colors.black87, height: 1.4),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Close', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.deepPlum,
                    foregroundColor: AppColors.roseGold,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.auto_awesome, size: 16),
                  label: const Text('Generate with HF AI'),
                  onPressed: () async {
                    setModalState(() => isLoading = true);
                    final result = await HuggingFaceAiService().generateWhatsAppReply(
                      customerName: brideName,
                      message: brideMsg,
                      city: 'Jodhpur',
                    );
                    setModalState(() {
                      isLoading = false;
                      generatedReply = result['result'] ?? 'Namaste! Reply generated.';
                    });
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Row(
          children: [
            const Icon(Icons.auto_fix_high, color: AppColors.roseGold, size: 20),
            const SizedBox(width: 8),
            Text(
              'No-Code Automation & WhatsApp Cloud Engine',
              style: AppTextStyles.headingTitle
                  .copyWith(color: AppColors.roseGold, fontSize: 16),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Hugging Face AI Auto-Pilot',
            icon: const Icon(Icons.psychology, color: AppColors.roseGold),
            onPressed: _showHfAutoPilotModal,
          ),
          IconButton(
            tooltip: 'Add Automation Rule',
            icon: const Icon(Icons.add_circle_outline, color: AppColors.roseGold),
            onPressed: _showAddRuleDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.roseGold,
          indicatorWeight: 3,
          labelColor: AppColors.roseGold,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.rule_folder_outlined, size: 18), text: 'Automation Rules Studio'),
            Tab(icon: Icon(Icons.mark_chat_read_outlined, size: 18), text: 'Live Delivery Logs & Templates'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRulesStudioTab(),
          _buildDeliveryLogsTab(),
        ],
      ),
    );
  }

  Widget _buildRulesStudioTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Event-Driven Automation Rules',
                        style: AppTextStyles.headingDisplay.copyWith(fontSize: 20),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Configure Trigger ➔ Condition ➔ Action workflows executed in real time by Cloud Functions.',
                        style: AppTextStyles.bodySecondary,
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.deepPlum,
                      foregroundColor: AppColors.roseGold,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add Rule'),
                    onPressed: _showAddRuleDialog,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Rules List
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _rules.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final rule = _rules[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: rule.isEnabled ? goldBorder : AppColors.lightBorder,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.deepPlum.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: goldBorder),
                                    ),
                                    child: Text(
                                      rule.trigger,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: royalGoldDark,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      rule.name,
                                      style: AppTextStyles.sectionHeader.copyWith(
                                        fontSize: 15,
                                        color: royalGoldDark,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Switch(
                              value: rule.isEnabled,
                              activeThumbColor: AppColors.deepPlum,
                              activeTrackColor: AppColors.roseGold.withValues(alpha: 0.4),
                              onChanged: (val) {
                                setState(() => rule.isEnabled = val);
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Logic Card
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.champagne,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.lightBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('IF: ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
                                  Expanded(
                                    child: Text(
                                      rule.condition,
                                      style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.indigo),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('THEN: ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.grey)),
                                  Expanded(
                                    child: Text(
                                      rule.action,
                                      style: const TextStyle(fontSize: 12, color: Colors.black87),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Footer Actions
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            InkWell(
                              onTap: () => _showTemplatePreview(rule.templateName),
                              child: Row(
                                children: [
                                  const Icon(Icons.remove_red_eye_outlined, size: 14, color: antiqueBronze),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Template: ${rule.templateName}',
                                    style: const TextStyle(fontSize: 11, color: antiqueBronze, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            TextButton.icon(
                              icon: const Icon(Icons.play_arrow_outlined, size: 15),
                              label: const Text('Run HF Automation', style: TextStyle(fontSize: 11)),
                              onPressed: () async {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Executing "${rule.name}" via free Hugging Face Inference...'),
                                    backgroundColor: AppColors.deepPlum,
                                  ),
                                );
                                final aiResponse = await HuggingFaceAiService().generateWhatsAppReply(
                                  customerName: 'Radhika Jodhpur',
                                  message: 'Simulated trigger for ${rule.trigger}',
                                );
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('HF AI Dispatched (${aiResponse['model'] ?? 'Qwen 2.5'}): ${(aiResponse['result'] as String).substring(0, 50)}...'),
                                      backgroundColor: AppColors.emeraldGreen,
                                    ),
                                  );
                                }
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeliveryLogsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Statistics Bar
              LayoutBuilder(
                builder: (context, constraints) {
                  final isNarrow = constraints.maxWidth < 420;
                  return Row(
                    children: [
                      Expanded(
                        child: _buildStatTile('Dispatched', '1,248', Colors.blue, isNarrow: isNarrow),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildStatTile('Delivered', '1,194', AppColors.emeraldGreen, isNarrow: isNarrow),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildStatTile('Read', '983', antiqueBronze, isNarrow: isNarrow),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildStatTile('Response Rate', '82%', AppColors.deepPlum, isNarrow: isNarrow),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),

              Text('Live Message Delivery Stream',
                  style: AppTextStyles.headingTitle.copyWith(fontSize: 18)),
              const SizedBox(height: 4),
              Text(
                'Sub-second audit logs dispatched via Meta WhatsApp Cloud API with delivery acknowledgments.',
                style: AppTextStyles.bodySecondary,
              ),
              const SizedBox(height: 12),

              StreamBuilder<QuerySnapshot>(
                stream: FirebaseFirestore.instance
                    .collection('automationEvents')
                    .snapshots(),
                builder: (context, snapshot) {
                  List<Map<String, dynamic>> logs = [];

                  if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
                    logs = snapshot.data!.docs.map((doc) {
                      final data = doc.data() as Map<String, dynamic>? ?? {};
                      return {
                        'id': doc.id,
                        'trigger': data['trigger'] ??
                            data['templateName'] ??
                            'WhatsApp Cloud Notification',
                        'client': data['client'] ??
                            data['customerPhone'] ??
                            'Client',
                        'status': data['status'] ?? 'Delivered',
                        'time': 'Live Event',
                        'template': data['templateName'] ?? 'generic_v1',
                      };
                    }).toList();
                  }

                  if (logs.isEmpty) {
                    logs = _fallbackLogs;
                  }

                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: logs.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final log = logs[index];
                      final isRead = log['status'] == 'Read';
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.lightBorder),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        log['trigger'].toString(),
                                        style: AppTextStyles.sectionHeader.copyWith(fontSize: 13),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        '(${log['template']})',
                                        style: const TextStyle(fontSize: 10, color: Colors.grey, fontFamily: 'monospace'),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    log['client'].toString(),
                                    style: AppTextStyles.bodySecondary.copyWith(fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Chip(
                              backgroundColor: isRead
                                  ? AppColors.roseGold.withValues(alpha: 0.15)
                                  : Colors.blue.withValues(alpha: 0.12),
                              side: BorderSide(
                                color: isRead ? goldBorder : Colors.blue.withValues(alpha: 0.3),
                              ),
                              label: Text(
                                '${log['status']} • ${log['time']}',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isRead ? royalGoldDark : Colors.blue.shade800,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatTile(String label, String count, Color color, {bool isNarrow = false}) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 12, horizontal: isNarrow ? 6 : 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        children: [
          Text(
            count,
            style: TextStyle(
              fontSize: isNarrow ? 15 : 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.bodySecondary.copyWith(fontSize: isNarrow ? 10 : 12),
          ),
        ],
      ),
    );
  }
}
