import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/wedding_function_entity.dart';
import '../../../../domain/entities/bridal_consultation_entity.dart';

class BridalPlannerScreen extends StatefulWidget {
  const BridalPlannerScreen({super.key});

  @override
  State<BridalPlannerScreen> createState() => _BridalPlannerScreenState();
}

class _BridalPlannerScreenState extends State<BridalPlannerScreen> {
  final List<WeddingFunctionEntity> _functions = [
    WeddingFunctionEntity(
      id: 'fn_01',
      weddingId: 'wd_01',
      functionType: WeddingFunctionType.mehndi,
      date: DateTime.parse('2026-11-18'),
      readyByTime: '03:00 PM',
      venue: 'Greenwood Lawn, Jodhpur',
      guestCount: 15,
      selectedLookTitle: 'Pastel Floral Mehndi Look',
      hairStylePreference: 'Messy Side Braid with Real Yellow Roses',
      drapingPoshakStyle: 'Lightweight Silk Lehenga Draping',
      referenceImageUrls: const [],
      notes: 'Natural dewy glow finish requested.',
    ),
    WeddingFunctionEntity(
      id: 'fn_02',
      weddingId: 'wd_01',
      functionType: WeddingFunctionType.haldi,
      date: DateTime.parse('2026-11-19'),
      readyByTime: '10:30 AM',
      venue: 'Poolside Courtyard, Jodhpur',
      guestCount: 8,
      selectedLookTitle: 'No-Makeup Glow Haldi Look',
      hairStylePreference: 'Half-Up Floral Tiara',
      drapingPoshakStyle: 'Yellow Floral Dupatta Draping',
      referenceImageUrls: const [],
      notes: 'Waterproof smudge-proof makeup essential.',
    ),
    WeddingFunctionEntity(
      id: 'fn_03',
      weddingId: 'wd_01',
      functionType: WeddingFunctionType.wedding,
      date: DateTime.parse('2026-11-20'),
      readyByTime: '04:30 PM',
      venue: 'Lake Palace Resort, Jodhpur',
      guestCount: 25,
      selectedLookTitle: 'Royal Rajasthani Royal Bridal HD Airbrush',
      hairStylePreference: 'Traditional Royal Bun with Fresh Red Carnations',
      drapingPoshakStyle: 'Double Dupatta Heavy Rajasthani Poshak Draping',
      referenceImageUrls: const [],
      notes: 'Full coverage HD airbrush, royal gold cut crease eye style.',
    ),
  ];

  final BridalConsultationEntity _consultation = const BridalConsultationEntity(
    id: 'cns_01',
    customerId: 'cust_987',
    skinType: 'Sensitive / Dry Skin',
    coveragePreference: 'Full Coverage HD Airbrush',
    eyeStylePreference: 'Soft Smokey Gold Cut Crease',
    lipPreference: 'Nude Mauve Rose',
    hairPreference: 'Traditional Royal Bun with Fresh Red Carnations',
    drapingStyle: 'Double Dupatta Rajasthani Poshak Draping',
    allergies: ['No synthetic fragrance primers'],
    patchTestCompleted: true,
    consultationNotes: 'Pre-wedding skin patch test completed on 10 Oct 2026. Prefers natural rose gold tones.',
  );

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppPalette.backgroundDark,
        appBar: AppBar(
          title: const Text(
            'Digital Bridal Planner',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            tabs: [
              Tab(text: 'Wedding Events'),
              Tab(text: 'Consultation Suite'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildWeddingEventsTab(),
            _buildConsultationTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildWeddingEventsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWeddingHeaderCard(),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'FUNCTIONS & READY-BY TIMES',
                style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add, size: 16, color: AppPalette.textGold),
                label: const Text('Add Event', style: TextStyle(color: AppPalette.textGold, fontSize: 12)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppPalette.goldAccent)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _functions.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) => _buildFunctionCard(_functions[index]),
          ),
        ],
      ),
    );
  }

  Widget _buildWeddingHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 26,
            backgroundColor: AppPalette.goldAccent,
            child: Icon(Icons.favorite, color: Colors.black, size: 28),
          ),
          const SizedBox(width: 14),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Priya & Vikram\'s Wedding', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('📅 18 Nov - 21 Nov 2026 • 📍 Jodhpur', style: TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
              SizedBox(height: 2),
              Text('3 Events Planned • Master Bridal Package', style: TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFunctionCard(WeddingFunctionEntity fn) {
    final title = fn.functionType.name.toUpperCase();
    final dateStr = '${fn.date.day}/${fn.date.month}/${fn.date.year}';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppPalette.goldAccent.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(title, style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 11)),
              ),
              Text('Ready-by: ${fn.readyByTime}', style: const TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          Text('${fn.selectedLookTitle ?? "Custom Look"} • $dateStr', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('📍 ${fn.venue} (${fn.guestCount} Guests)', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
          const SizedBox(height: 8),
          Text('• Hair: ${fn.hairStylePreference}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
          Text('• Draping: ${fn.drapingPoshakStyle}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildConsultationTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('BRIDE MAKEUP PROFILE', style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 14)),
                    if (_consultation.patchTestCompleted)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('PATCH TEST PASSED ✅', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildConsultationRow('Skin Type', _consultation.skinType),
                _buildConsultationRow('Coverage Preference', _consultation.coveragePreference),
                _buildConsultationRow('Eye Style', _consultation.eyeStylePreference),
                _buildConsultationRow('Lip Preference', _consultation.lipPreference),
                _buildConsultationRow('Hair Style', _consultation.hairPreference),
                _buildConsultationRow('Poshak / Draping', _consultation.drapingStyle),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('CONSULTATION & ALLERGY NOTES', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white10),
            ),
            child: Text(
              _consultation.consultationNotes,
              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConsultationRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
