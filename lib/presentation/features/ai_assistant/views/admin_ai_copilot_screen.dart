import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/ai_assistant_entity.dart';

class AdminAiCopilotScreen extends StatefulWidget {
  const AdminAiCopilotScreen({super.key});

  @override
  State<AdminAiCopilotScreen> createState() => _AdminAiCopilotScreenState();
}

class _AdminAiCopilotScreenState extends State<AdminAiCopilotScreen> {
  final List<AiToolAuditLogEntity> _auditLogs = [
    AiToolAuditLogEntity(
      auditId: 'audit_101',
      toolName: 'executeAdminCopilotQuery',
      actorId: 'prachi_admin',
      requestedAction: 'QueryType: UNPAID_HOT_LEADS',
      isHumanApproved: true,
      executionResult: 'Returned 4 records. WhatsApp follow-up action prepared.',
      timestamp: DateTime.parse('2026-09-12 11:30:00'),
    ),
    AiToolAuditLogEntity(
      auditId: 'audit_102',
      toolName: 'generateSocialContentDraft',
      actorId: 'prachi_admin',
      requestedAction: 'Draft content for mediaUrl: https://instagram.com/reel/C9921',
      isHumanApproved: false,
      executionResult: 'Draft #draft_2201 created. Awaiting human approval.',
      timestamp: DateTime.parse('2026-09-12 11:15:00'),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppPalette.backgroundDark,
        appBar: AppBar(
          title: const Text(
            'AI Admin Copilot & Audit Trail',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            tabs: [
              Tab(text: 'Admin Copilot Queries'),
              Tab(text: 'Content Drafter'),
              Tab(text: 'AI Tool Audit Trail'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildCopilotQueriesTab(),
            _buildContentDrafterTab(),
            _buildAuditTrailTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildCopilotQueriesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PRE-BUILT READ-ONLY COPILOT QUERIES', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          _buildCopilotQueryCard(
            title: 'Which HOT leads have not paid deposit?',
            resultSummary: '4 HOT Leads found awaiting deposit confirmation.',
            suggestedAction: 'Prepare WhatsApp follow-up reminder messages',
          ),
          const SizedBox(height: 10),
          _buildCopilotQueryCard(
            title: 'Tomorrow\'s Booking & Resource Assignment Summary',
            resultSummary: '2 Bookings scheduled. 3 Staff assigned (Prachi, Ananya, Riya).',
            suggestedAction: 'Send team morning schedule push notifications',
          ),
        ],
      ),
    );
  }

  Widget _buildCopilotQueryCard({required String title, required String resultSummary, required String suggestedAction}) {
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
              const Icon(Icons.psychology, color: AppPalette.textGold, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14))),
            ],
          ),
          const SizedBox(height: 8),
          Text(resultSummary, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text('Suggested: $suggestedAction', style: const TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Human approval granted: Action executed safely via Cloud Function.')));
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                  child: const Text('Approve Action', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentDrafterTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('AI SOCIAL CONTENT DRAFTS (HUMAN APPROVAL REQUIRED)', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          Container(
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
                    const Text('Reel Draft #draft_2201', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                      child: const Text('PENDING APPROVAL ⏳', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Suggested Title: Royal Rajputi Bridal Makeover by Prachi ✨', style: TextStyle(color: AppPalette.textGold, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Caption: Elevating royal bridal beauty in Jodhpur! Book your dates early for the upcoming wedding season. #MakeoversByPrachi #RajasthaniBridal', style: TextStyle(color: Colors.white70, fontSize: 11)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(onPressed: () {}, child: const Text('Edit Text', style: TextStyle(color: Colors.white70))),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Content approved and published to portfolio!')));
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                      child: const Text('Approve & Publish'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuditTrailTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _auditLogs.length,
      separatorBuilder: (context, index) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final log = _auditLogs[index];
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppPalette.surfaceDark,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${log.toolName} • ${log.actorId}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 2),
                  Text(log.executionResult, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                ],
              ),
              Icon(
                log.isHumanApproved ? Icons.verified_user : Icons.hourglass_top,
                color: log.isHumanApproved ? Colors.lightGreenAccent : Colors.amber,
                size: 16,
              ),
            ],
          ),
        );
      },
    );
  }
}
