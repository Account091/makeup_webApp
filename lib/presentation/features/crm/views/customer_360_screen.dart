import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../core/services/hugging_face_ai_service.dart';

class Customer360Screen extends StatefulWidget {
  final String customerId;

  const Customer360Screen({super.key, this.customerId = 'MBP-2026-X8K9'});

  @override
  State<Customer360Screen> createState() => _Customer360ScreenState();
}

class _Customer360ScreenState extends State<Customer360Screen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isViewAsCustomer = false;

  // Booking & Commercial State
  final String _bookingId = 'MBP-2026-X8K9';
  final String _customerName = 'Radhika Jodhpur';
  final String _phone = '+91 98290 12345';
  int _grossPrice = 45000;
  int _discount = 2000;
  final int _depositPaid = 15000;
  String _status = 'CONFIRMED';
  final String _leadScore = '92 / 100 (Platinum)';
  final String _assignedArtist = 'Prachi (Lead), Anita (Draping), Ritu (Hair)';

  // Audit Log State
  final List<Map<String, String>> _auditLogs = [
    {
      'time': 'Today, 10:15 AM',
      'actor': 'Anita (Draping Specialist)',
      'action': 'CHECKLIST_UPDATE',
      'detail': 'Checked off: "Poshak & Heavy Dupatta Draping"',
    },
    {
      'time': 'Yesterday, 04:30 PM',
      'actor': 'Prachi (Head Artist)',
      'action': 'PRICE_OVERRIDE',
      'detail': 'Applied ₹2,000 Courtesy Discount. Reason: "Family wedding referral"',
    },
    {
      'time': '24 Oct 2026, 11:42 AM',
      'actor': 'Razorpay Webhook',
      'action': 'PAYMENT_VERIFIED',
      'detail': 'Advance deposit ₹15,000 verified. Receipt #RC-1094 generated.',
    },
    {
      'time': '24 Oct 2026, 11:35 AM',
      'actor': 'Client (Radhika J.)',
      'action': 'INQUIRY_CREATED',
      'detail': 'Inquiry submitted for 28 Nov 2026 (Night Muhurat Pheras).',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showOverrideModal() {
    final TextEditingController reasonController = TextEditingController();
    final TextEditingController amountController = TextEditingController(text: _grossPrice.toString());
    String selectedAction = 'APPLY_DISCOUNT';

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return AlertDialog(
              backgroundColor: AppPalette.surfaceDark,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.roseGold, width: 1.5),
              ),
              title: const Row(
                children: [
                  Icon(Icons.bolt, color: AppColors.roseGold),
                  SizedBox(width: 8),
                  Text(
                    'Admin Override Action',
                    style: TextStyle(color: AppColors.roseGold, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ],
              ),
              content: SizedBox(
                width: 440,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Every override modifies authoritative booking state and is permanently written to the audit log.',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                      const Text('Override Type', style: TextStyle(color: AppColors.warmGold, fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        dropdownColor: AppPalette.surfaceDark,
                        initialValue: selectedAction,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.black26,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'APPLY_DISCOUNT', child: Text('Apply Custom Discount / Price Adjustment')),
                          DropdownMenuItem(value: 'FORCE_CONFIRM', child: Text('Force-Confirm Booking Without Payment')),
                          DropdownMenuItem(value: 'REASSIGN_ARTIST', child: Text('Reassign / Change Lead Artist')),
                          DropdownMenuItem(value: 'MANUAL_PAYMENT', child: Text('Record Manual Bank Transfer / Cash (< ₹2L)')),
                          DropdownMenuItem(value: 'CANCEL_BOOKING', child: Text('Authorize Cancellation & Issue Refund')),
                        ],
                        onChanged: (val) {
                          if (val != null) setDialogState(() => selectedAction = val);
                        },
                      ),
                      const SizedBox(height: 16),
                      if (selectedAction == 'APPLY_DISCOUNT') ...[
                        const Text('Updated Total Amount (₹)', style: TextStyle(color: AppColors.warmGold, fontSize: 12, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: amountController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.black26,
                            prefixText: '₹ ',
                            prefixStyle: const TextStyle(color: AppColors.roseGold),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      const Text('Mandatory Reason (Required for Audit)', style: TextStyle(color: AppColors.warmGold, fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: reasonController,
                        maxLines: 2,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'e.g. VIP client referral / astrologer shifted wedding timing',
                          hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                          filled: true,
                          fillColor: Colors.black26,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        '⚠️ Discounts exceeding ₹5,000 require dual authorization by Studio Owner.',
                        style: TextStyle(color: Colors.orangeAccent, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.roseGold,
                    foregroundColor: AppColors.deepPlum,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {
                    final reason = reasonController.text.trim();
                    if (reason.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('A mandatory override reason is required.')),
                      );
                      return;
                    }

                    setState(() {
                      if (selectedAction == 'APPLY_DISCOUNT') {
                        final newAmt = int.tryParse(amountController.text) ?? _grossPrice;
                        _discount += (_grossPrice - newAmt);
                        _grossPrice = newAmt;
                      } else if (selectedAction == 'FORCE_CONFIRM') {
                        _status = 'CONFIRMED';
                      }

                      _auditLogs.insert(0, {
                        'time': 'Just now',
                        'actor': 'Admin (Prachi Console)',
                        'action': selectedAction,
                        'detail': 'Override executed. Reason: "$reason"',
                      });
                    });

                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Override recorded in audit log: "$selectedAction"')),
                    );
                  },
                  child: const Text('Confirm & Log Override', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _runHfAiLeadAudit() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(color: AppColors.roseGold),
      ),
    );

    final result = await HuggingFaceAiService().auditLeadScore(
      bookingId: _bookingId,
      customerName: _customerName,
      grossAmount: _grossPrice.toDouble(),
      city: 'Jodhpur',
      depositStatus: _status == 'CONFIRMED' ? 'PAID' : 'PENDING',
    );

    if (!mounted) return;
    Navigator.of(context).pop();

    final data = (result['data'] as Map<String, dynamic>?) ?? {};
    final score = data['score'] ?? 92;
    final tier = data['tier'] ?? 'PLATINUM';
    final flags = (data['riskFlags'] as List<dynamic>?) ?? ['No critical risk flags detected'];
    final action = data['recommendedAction'] ?? 'Assign Senior Concierge immediately.';
    final upsell = data['upsellOpportunity'] ?? 'Recommend Mother & Sister HD Styling package (+₹15,000).';

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppPalette.surfaceDark,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.roseGold),
          ),
          title: Row(
            children: [
              const Icon(Icons.auto_awesome, color: AppColors.roseGold, size: 22),
              const SizedBox(width: 8),
              const Text(
                'Hugging Face AI Lead & Risk Audit',
                style: TextStyle(color: AppPalette.textGold, fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: SizedBox(
            width: 480,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('COMPUTED AI SCORE', style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text('$score / 100', style: const TextStyle(color: AppPalette.textGold, fontSize: 22, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.greenAccent),
                          ),
                          child: Text(
                            '$tier TIER',
                            style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('RISK & COMPLIANCE FLAGS', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  ...flags.map((f) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('⚠️ ', style: TextStyle(fontSize: 12)),
                            Expanded(child: Text(f.toString(), style: const TextStyle(color: Colors.white, fontSize: 12))),
                          ],
                        ),
                      )),
                  const SizedBox(height: 14),
                  const Text('RECOMMENDED NEXT ACTION', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(action.toString(), style: const TextStyle(color: Colors.white, fontSize: 12)),
                  const SizedBox(height: 14),
                  const Text('COMMERCIAL UPSELL OPPORTUNITY', style: TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(upsell.toString(), style: const TextStyle(color: Colors.white70, fontSize: 12, fontStyle: FontStyle.italic)),
                ],
              ),
            ),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.roseGold,
                foregroundColor: AppColors.deepPlum,
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close Audit'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final balanceDue = _grossPrice - _depositPaid;
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 1024;

    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
        title: Row(
          children: [
            Text(
              'Booking #$_bookingId • $_customerName',
              style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: Colors.greenAccent, width: 0.8),
              ),
              child: Text(
                _status,
                style: const TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Hugging Face AI Lead & Risk Audit',
            icon: const Icon(Icons.auto_awesome, color: AppColors.roseGold),
            onPressed: _runHfAiLeadAudit,
          ),
          // View Mode Switcher
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.black38,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.roseGold.withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Text('Customer Preview:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(width: 8),
                Switch(
                  value: _isViewAsCustomer,
                  activeThumbColor: AppColors.roseGold,
                  onChanged: (val) => setState(() => _isViewAsCustomer = val),
                ),
              ],
            ),
          ),
          // Override Button
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ElevatedButton.icon(
              icon: const Icon(Icons.bolt, size: 16),
              label: const Text('Override', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.roseGold,
                foregroundColor: AppColors.deepPlum,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: _showOverrideModal,
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppColors.roseGold,
          labelColor: AppColors.roseGold,
          unselectedLabelColor: Colors.white60,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Details & Venue'),
            Tab(text: 'Commercials & Taxes'),
            Tab(text: 'Artists & SOP Status'),
            Tab(text: 'Skin, Allergies & Look'),
            Tab(text: 'Chat & Documents'),
            Tab(text: 'Audit Trail & Overrides'),
          ],
        ),
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Main Dynamic Content Area
          Expanded(
            flex: 3,
            child: _isViewAsCustomer
                ? _buildViewAsCustomerPane()
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildDetailsTab(),
                      _buildCommercialsTab(balanceDue),
                      _buildArtistsAndSopTab(),
                      _buildSkinAndLookTab(),
                      _buildChatAndDocsTab(),
                      _buildAuditTrailTab(),
                    ],
                  ),
          ),

          // Pinned Internal Summary Panel (Desktop view)
          if (isDesktop)
            Container(
              width: 320,
              decoration: const BoxDecoration(
                color: AppPalette.surfaceDark,
                border: Border(left: BorderSide(color: Colors.white12)),
              ),
              child: _buildInternalSummarySidebar(balanceDue),
            ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. "VIEW AS CUSTOMER" READ-ONLY PREVIEW PANE
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildViewAsCustomerPane() {
    return Container(
      color: const Color(0xFFFDFBF7),
      padding: const EdgeInsets.all(24),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade700),
              ),
              child: Row(
                children: [
                  Icon(Icons.visibility_outlined, color: Colors.amber.shade900, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'READ-ONLY CUSTOMER PREVIEW: This is the exact view Radhika J. sees on her "My Wedding" dashboard.',
                      style: TextStyle(color: Colors.amber.shade900, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Customer View Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF2A0845),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFD4AF37)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('👑 WELCOME RADHIKA', style: TextStyle(color: Color(0xFFD4AF37), fontSize: 11, fontWeight: FontWeight.bold)),
                  SizedBox(height: 6),
                  Text('Royal Rajputi Wedding Journey', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('Date: 28 Nov 2026 • Jodhpur Heritage Venue', style: TextStyle(color: Color(0xFFE8D3C7), fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Customer View Commercial Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE8D3C7)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Payment Summary', style: TextStyle(color: Color(0xFF2A0845), fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Package (Incl. 18% GST)', style: TextStyle(color: Color(0xFF4A3710), fontSize: 13)),
                      Text('₹${_grossPrice.toString()}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2A0845))),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Advance Deposit Paid', style: TextStyle(color: Colors.green, fontSize: 13)),
                      Text('₹${_depositPaid.toString()}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Remaining Balance Due', style: TextStyle(color: Color(0xFF2A0845), fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('₹${(_grossPrice - _depositPaid).toString()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF2A0845))),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TAB: DETAILS & VENUE
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildDetailsTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildInfoCard('EVENT SCHEDULE & VENUE DETAILS', [
          _buildInfoRow('Function Name', 'Royal Rajputi Pheras (Night Muhurat)'),
          _buildInfoRow('Event Date', '28 November 2026'),
          _buildInfoRow('Muhurat Ready-By Time', '10:30 PM (Artist Arrival: 06:30 PM)'),
          _buildInfoRow('Venue & Room', 'Gorbandh Palace Heritage Suite #402, Jodhpur'),
          _buildInfoRow('Guest Makeup Count', 'Bride + Mother + 2 Sisters (Family Draping)'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('FAMILY & EMERGENCY CONTACTS', [
          _buildInfoRow('Bride Phone', '$_phone (WhatsApp Primary)'),
          _buildInfoRow('Bride Email', 'radhika.jodhpur@gmail.com'),
          _buildInfoRow('Father Contact', 'Mahendra Jodhpur (+91 98290 88776)'),
          _buildInfoRow('Wedding Planner', 'Devraj Events Jodhpur (+91 94140 12345)'),
        ]),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. TAB: COMMERCIALS & TAXES
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildCommercialsTab(int balanceDue) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildInfoCard('FINANCIAL BREAKDOWN (GST 18% COMPLIANT)', [
          _buildInfoRow('Base Bridal Package', '₹38,000'),
          _buildInfoRow('Outstation Vanity Travel Fee', '₹0 (Local Jodhpur Hub)'),
          _buildInfoRow('18% Salon Cosmetic GST', '₹6,840 (SAC 9997)'),
          _buildInfoRow('Discounts / Adjustments', '-₹$_discount (Courtesy)'),
          _buildInfoRow('Gross Authoritative Total', '₹$_grossPrice'),
          _buildInfoRow('Deposit Received', '₹$_depositPaid (Razorpay #RC-1094)'),
          _buildInfoRow('Outstanding Balance Due', '₹$balanceDue (Due: 14 Nov 2026)'),
        ]),
        const SizedBox(height: 16),
        Row(
          children: [
            ElevatedButton.icon(
              icon: const Icon(Icons.receipt_long),
              label: const Text('Generate Formal GST Tax Invoice'),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.roseGold, foregroundColor: AppColors.deepPlum),
              onPressed: () {},
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.send),
              label: const Text('Resend Payment Link via WhatsApp'),
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.roseGold, side: const BorderSide(color: AppColors.roseGold)),
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TAB: ARTISTS & SOP STATUS
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildArtistsAndSopTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildInfoCard('ASSIGNED STUDIO ARTISTRY TEAM', [
          _buildInfoRow('Lead Makeup Artist', 'Prachi (Head Artist)'),
          _buildInfoRow('Hairstyling Specialist', 'Ritu (Senior Hair Artist)'),
          _buildInfoRow('Rajputi Poshak Drapist', 'Anita (Draping Specialist)'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('WEDDING DAY REAL-TIME SOP CHECKLIST', [
          _buildChecklistRow('1. Skin Prep & Hydration Barrier', true, 'Completed 06:45 PM'),
          _buildChecklistRow('2. Airbrush Foundation Base & HD Conceal', true, 'Completed 07:30 PM'),
          _buildChecklistRow('3. Eye Makeup, Lashes & Brow Architecture', true, 'Completed 08:15 PM'),
          _buildChecklistRow('4. Hairstyling & Fresh Flower Pinning', true, 'Completed 09:00 PM'),
          _buildChecklistRow('5. Rajputi Poshak & Heavy Dupatta Draping', true, 'Completed 09:45 PM'),
          _buildChecklistRow('6. Aad, Borla & Jewelry Setting', false, 'In Progress (Target: 10:15 PM)'),
          _buildChecklistRow('7. Final Touch-up & Setting Spray Lock', false, 'Pending (Target: 10:30 PM)'),
        ]),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. TAB: SKIN, ALLERGIES & LOOKBOOK
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildSkinAndLookTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildInfoCard('SKIN DIAGNOSIS & ALLERGIES (DPDP CONSENT VERIFIED)', [
          _buildInfoRow('Skin Type', 'Sensitive / Combination (Prone to dryness around nose)'),
          _buildInfoRow('Allergy Alerts', '⚠️ STRICT: LATEX ALLERGY (Use latex-free lash adhesive)'),
          _buildInfoRow('Patch Test Result', 'PASSED (Tested 14 Oct 2026 with no irritation)'),
          _buildInfoRow('Foundation Formulation', 'Temptu Airbrush Warm Olive (#35) with dewy finish'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('ROYAL LOOK SPECIFICATION', [
          _buildInfoRow('Approved Style Name', 'Royal Rajputi Crimson Glow with Smoked Kohl'),
          _buildInfoRow('Poshak Description', 'Heavy crimson velvet poshak with antique gold zardozi'),
          _buildInfoRow('Jewelry Arrangement', 'Heritage kundan aad with emerald drops & double borla'),
          _buildInfoRow('Media Consent', 'APPROVED: Eyes and Hair styling showcase only'),
        ]),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. TAB: CHAT & DOCUMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildChatAndDocsTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _buildInfoCard('LEGAL CONTRACTS & POLICIES', [
          _buildInfoRow('Service Contract', 'Digitally Signed on 24 Oct 2026 (SHA-256: e8b4...91fa)'),
          _buildInfoRow('Reschedule Terms', 'Free reschedule allowed up to 30 days prior'),
          _buildInfoRow('Emergency Standby', 'Covered by Jodhpur Regional Standby Roster'),
        ]),
        const SizedBox(height: 16),
        _buildInfoCard('RECENT WHATSAPP MESSAGES LOG', [
          _buildInfoRow('Today 09:30 AM', 'Sent: "Good morning Radhika, artist team departure scheduled at 5:30 PM"'),
          _buildInfoRow('Yesterday 04:35 PM', 'Sent: "PDF Deposit Receipt #RC-1094 delivered" (Read by bride)'),
        ]),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. TAB: AUDIT TRAIL & OVERRIDES
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildAuditTrailTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'IMMUTABLE AUDIT TRAIL (Cryptographically logged events & admin overrides)',
          style: TextStyle(color: AppPalette.textGold, fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ..._auditLogs.map((log) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppPalette.surfaceDark,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(log['action']!, style: const TextStyle(color: AppColors.roseGold, fontWeight: FontWeight.bold, fontSize: 13)),
                      Text(log['time']!, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Actor: ${log['actor']}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 2),
                  Text(log['detail']!, style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4)),
                ],
              ),
            )),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PINNED INTERNAL SUMMARY PANEL (RIGHT SIDEBAR)
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildInternalSummarySidebar(int balanceDue) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text('INTERNAL OPS METRICS', style: TextStyle(color: AppPalette.textGold, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 14),

        _buildSidebarStat('Lead Score', _leadScore, Colors.greenAccent),
        _buildSidebarStat('Booking Status', _status, Colors.greenAccent),
        _buildSidebarStat('Total Gross', '₹$_grossPrice', AppColors.roseGold),
        _buildSidebarStat('Deposit Paid', '₹$_depositPaid', Colors.white),
        _buildSidebarStat('Balance Due', '₹$balanceDue', Colors.amberAccent),
        _buildSidebarStat('Risk Verdict', '🟢 LOW NO-SHOW RISK', Colors.greenAccent),

        const Divider(color: Colors.white12, height: 28),

        const Text('ASSIGNED ARTISTS', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Text(_assignedArtist, style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4)),

        const Divider(color: Colors.white12, height: 28),

        const Text('INTERNAL PRIVATE NOTES', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(8)),
          child: const Text(
            '• VIP Bride (Daughter of prominent Jodhpur family).\n• Sensitive skin; zero latex products.\n• Sawa date with full capacity lock.',
            style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.5),
          ),
        ),

        const SizedBox(height: 20),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red.shade900,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 10),
          ),
          onPressed: () {},
          child: const Text('Flag for Escalation', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER WIDGETS
  // ─────────────────────────────────────────────────────────────────────────────
  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppPalette.textGold, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
          const Divider(color: Colors.white10, height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 180, child: Text(label, style: const TextStyle(color: Colors.white60, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  Widget _buildChecklistRow(String item, bool isDone, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(isDone ? Icons.check_circle : Icons.radio_button_unchecked, color: isDone ? Colors.greenAccent : Colors.white38, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item, style: TextStyle(color: isDone ? Colors.white : Colors.white70, fontSize: 13, fontWeight: isDone ? FontWeight.bold : FontWeight.normal)),
                Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarStat(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
          Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
