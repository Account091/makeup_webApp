import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/bridal_questionnaire_entity.dart';

class BridalQuestionnaireScreen extends StatefulWidget {
  const BridalQuestionnaireScreen({super.key});

  @override
  State<BridalQuestionnaireScreen> createState() => _BridalQuestionnaireScreenState();
}

class _BridalQuestionnaireScreenState extends State<BridalQuestionnaireScreen> {
  int _selectedVersionIndex = 2; // Default to v3 (Latest)

  final List<BridalQuestionnaireEntity> _questionnaireVersions = [
    BridalQuestionnaireEntity(
      id: 'q_01_v1',
      customerId: 'cust_987',
      weddingId: 'wd_01',
      version: 1,
      skinType: 'Dry',
      desiredFinish: 'Dewy Glow',
      coverage: 'Medium Coverage',
      eyeStyle: 'Soft Smokey',
      lipPreference: 'Nude Pink',
      hairPreference: 'Open Waves with Flowers',
      drapingPreference: 'Single Dupatta',
      allergies: const ['No synthetic fragrance primers'],
      canUsePhotosInPortfolio: true,
      status: QuestionnaireStatus.submitted,
      updatedBy: 'Priya Sharma (Bride)',
      changeReason: 'Initial Questionnaire Submission',
      createdAt: DateTime.parse('2026-09-12 10:00:00'),
    ),
    BridalQuestionnaireEntity(
      id: 'q_01_v2',
      customerId: 'cust_987',
      weddingId: 'wd_01',
      version: 2,
      skinType: 'Combination',
      desiredFinish: 'Natural Radiant',
      coverage: 'Full Coverage HD Airbrush',
      eyeStyle: 'Smokey Gold Cut Crease',
      lipPreference: 'Nude Mauve Rose',
      hairPreference: 'Traditional Royal Bun',
      drapingPreference: 'Double Dupatta Rajasthani Poshak',
      allergies: const ['No synthetic fragrance primers'],
      canUsePhotosInPortfolio: true,
      status: QuestionnaireStatus.submitted,
      updatedBy: 'Priya Sharma (Bride)',
      changeReason: 'Updated Hair & Draping style after consultation call with Prachi',
      createdAt: DateTime.parse('2026-10-05 14:30:00'),
    ),
    BridalQuestionnaireEntity(
      id: 'q_01_v3',
      customerId: 'cust_987',
      weddingId: 'wd_01',
      version: 3,
      skinType: 'Sensitive / Dry',
      desiredFinish: 'Natural Radiant',
      coverage: 'Full Coverage HD Airbrush',
      eyeStyle: 'Defined Gold Royal Smokey',
      lipPreference: 'Deep Rose Mauve',
      hairPreference: 'Traditional Royal Bun with Fresh Red Carnations',
      drapingPreference: 'Double Dupatta Heavy Rajasthani Poshak',
      allergies: const ['No synthetic fragrance primers'],
      canUsePhotosInPortfolio: true, // Explicit photography consent
      status: QuestionnaireStatus.approvedFinal,
      updatedBy: 'Prachi V. (Admin Approved)',
      changeReason: 'Final Approved Profile after trial & patch test verification',
      createdAt: DateTime.parse('2026-10-10 16:00:00'),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final currentQ = _questionnaireVersions[_selectedVersionIndex];

    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Bridal Questionnaire Suite',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildVersionHeader(),
            const SizedBox(height: 16),
            _buildStatusCard(currentQ),
            const SizedBox(height: 20),
            const Text(
              'STRUCTURED MAKEUP & SKIN PREFERENCES',
              style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 12),
            _buildPreferenceGrid(currentQ),
            const SizedBox(height: 20),
            const Text(
              'SENSITIVITY & CONSENT SETTINGS',
              style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 12),
            _buildConsentCard(currentQ),
          ],
        ),
      ),
    );
  }

  Widget _buildVersionHeader() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('QUESTIONNAIRE VERSION HISTORY', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: List.generate(_questionnaireVersions.length, (index) {
              final isSelected = index == _selectedVersionIndex;
              final ver = _questionnaireVersions[index];
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text('Version ${ver.version} ${ver.status == QuestionnaireStatus.approvedFinal ? "⭐" : ""}'),
                  selected: isSelected,
                  selectedColor: AppPalette.goldAccent,
                  labelStyle: TextStyle(color: isSelected ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                  onSelected: (bool selected) {
                    if (selected) setState(() => _selectedVersionIndex = index);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(BridalQuestionnaireEntity q) {
    final isFinal = q.status == QuestionnaireStatus.approvedFinal;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isFinal ? Colors.lightGreenAccent : AppPalette.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'VERSION ${q.version} PROFILE',
                style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isFinal ? Colors.green.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isFinal ? 'FINAL APPROVED PROFILE ✅' : 'SUBMITTED DRAFT',
                  style: TextStyle(color: isFinal ? Colors.greenAccent : Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Updated by: ${q.updatedBy}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 2),
          Text('Reason: ${q.changeReason}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildPreferenceGrid(BridalQuestionnaireEntity q) {
    final items = [
      {'label': 'Skin Type', 'val': q.skinType},
      {'label': 'Desired Finish', 'val': q.desiredFinish},
      {'label': 'Coverage Level', 'val': q.coverage},
      {'label': 'Eye Style', 'val': q.eyeStyle},
      {'label': 'Lip Style', 'val': q.lipPreference},
      {'label': 'Hair Style', 'val': q.hairPreference},
      {'label': 'Draping / Poshak', 'val': q.drapingPreference},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: items.map((item) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(item['label']!, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                Text(item['val']!, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildConsentCard(BridalQuestionnaireEntity q) {
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
            children: [
              const Icon(Icons.privacy_tip_outlined, color: AppPalette.textGold, size: 18),
              const SizedBox(width: 8),
              const Text('Portfolio Photography Consent', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  'Explicit consent to include bridal look photos in official website portfolio & reels.',
                  style: TextStyle(color: AppPalette.textSecondary, fontSize: 11),
                ),
              ),
              Switch(
                value: q.canUsePhotosInPortfolio,
                activeThumbColor: AppPalette.goldAccent,
                onChanged: (val) {},
              ),

            ],
          ),
          const Divider(color: Colors.white12, height: 20),
          const Text('Allergies & Sensitivities:', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(
            q.allergies.isNotEmpty ? q.allergies.join(', ') : 'None reported',
            style: const TextStyle(color: Colors.redAccent, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
