import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../core/services/hugging_face_ai_service.dart';

class ArtistDispatchBoardScreen extends StatefulWidget {
  const ArtistDispatchBoardScreen({super.key});

  @override
  State<ArtistDispatchBoardScreen> createState() => _ArtistDispatchBoardScreenState();
}

class _ArtistDispatchBoardScreenState extends State<ArtistDispatchBoardScreen> {
  DateTime selectedDate = DateTime.now();

  // Active Dispatch Roster
  final List<Map<String, dynamic>> _dispatches = [
    {
      'dispatchId': 'dsp_101',
      'artistName': 'Prachi (Head Artist)',
      'role': 'LEAD_MAKEUP',
      'brideName': 'Radhika Jodhpur',
      'bookingId': 'MBP-2026-X8K9',
      'venue': 'Gorbandh Palace Heritage Suite #402',
      'city': 'Jodhpur',
      'readyByTime': '10:30 PM',
      'scheduledArrival': '06:30 PM',
      'status': 'ARRIVED_AT_SUITE',
      'transitEta': 'On Site',
      'isDelayed': false,
      'kitCheckedOut': true,
      'kitReturned': false,
    },
    {
      'dispatchId': 'dsp_102',
      'artistName': 'Ritu Sharma (Senior Hair Stylist)',
      'role': 'HAIR_STYLING',
      'brideName': 'Radhika Jodhpur',
      'bookingId': 'MBP-2026-X8K9',
      'venue': 'Gorbandh Palace Heritage Suite #402',
      'city': 'Jodhpur',
      'readyByTime': '10:30 PM',
      'scheduledArrival': '07:15 PM',
      'status': 'IN_TRANSIT',
      'transitEta': '12 mins (ETA 07:10 PM)',
      'isDelayed': false,
      'kitCheckedOut': true,
      'kitReturned': false,
    },
    {
      'dispatchId': 'dsp_103',
      'artistName': 'Anita Rajpurohit (Poshak Specialist)',
      'role': 'POSHAK_DRAPING',
      'brideName': 'Radhika Jodhpur',
      'bookingId': 'MBP-2026-X8K9',
      'venue': 'Gorbandh Palace Heritage Suite #402',
      'city': 'Jodhpur',
      'readyByTime': '10:30 PM',
      'scheduledArrival': '08:30 PM',
      'status': 'SCHEDULED_AT_STUDIO',
      'transitEta': 'Departure 08:00 PM',
      'isDelayed': false,
      'kitCheckedOut': true,
      'kitReturned': false,
    },
    {
      'dispatchId': 'dsp_104',
      'artistName': 'Kavita Gehlot (Junior Artist)',
      'role': 'FAMILY_DRAPING',
      'brideName': 'Sneha Parekh (Destination Bride)',
      'bookingId': 'MBP-2026-R4T1',
      'venue': 'Indana Palace, Jodhpur',
      'readyByTime': '06:00 PM',
      'scheduledArrival': '02:00 PM',
      'status': 'DELAYED_TRAFFIC',
      'transitEta': 'Late by 20 mins',
      'isDelayed': true,
      'kitCheckedOut': true,
      'kitReturned': false,
    },
  ];

  // Backup Artist Pool
  final List<Map<String, dynamic>> _backupArtists = [
    {
      'id': 'art_bk_1',
      'name': 'Pooja Bhati (Senior Associate)',
      'tier': 'PLATINUM',
      'rating': '4.96★',
      'skills': 'Airbrush HD, Rajputi Poshak, Bridal Aad Setting',
      'distanceKm': '3.8 km (12 mins away)',
      'status': 'ON_CALL_STANDBY',
      'phone': '+91 98290 44556',
    },
    {
      'id': 'art_bk_2',
      'name': 'Bhawna Joshi (Hair & Draping Lead)',
      'tier': 'GOLD',
      'rating': '4.91★',
      'skills': 'Heritage Bun & Fresh Flower Gajra, Saree Pleating',
      'distanceKm': '6.2 km (20 mins away)',
      'status': 'AVAILABLE',
      'phone': '+91 94140 33221',
    },
  ];

  void _showBackupSuggestModal(String delayedArtist, String bookingId) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppPalette.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.emergency_outlined, color: Colors.amberAccent, size: 24),
                  const SizedBox(width: 8),
                  Text(
                    'Backup Artist Auto-Suggest Engine',
                    style: const TextStyle(color: AppPalette.textGold, fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Replacing $delayedArtist on booking #$bookingId. Ranked by skill match, venue proximity, and client rating.',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const Divider(color: Colors.white12, height: 24),

              ..._backupArtists.map((artist) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.roseGold.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: AppColors.roseGold,
                        radius: 20,
                        child: Text(
                          artist['name'][0],
                          style: const TextStyle(color: AppColors.deepPlum, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(artist['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                                  child: Text(artist['tier'], style: const TextStyle(color: Colors.amberAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(artist['skills'], style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                            const SizedBox(height: 2),
                            Text('📍 ${artist['distanceKm']} • Rating: ${artist['rating']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.roseGold,
                          foregroundColor: AppColors.deepPlum,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('⚡ ${artist['name']} dispatched as emergency backup for #$bookingId. Digital face chart sent to artist WhatsApp.'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        },
                        child: const Text('Dispatch', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _runHfDispatchContingencyAdvisor() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(color: AppColors.roseGold),
      ),
    );

    final result = await HuggingFaceAiService().solveDispatchIncident(
      incidentDescription: 'Peak hour wedding transit delay on Jodhpur highway. ETA shifted +25 minutes.',
      brideName: 'Radhika Jodhpur',
      readyByTime: '10:30 PM',
      venue: 'Gorbandh Palace Heritage Suite #402',
    );

    if (!mounted) return;
    Navigator.of(context).pop();

    final data = (result['data'] as Map<String, dynamic>?) ?? {};
    final severity = data['severity'] ?? 'MEDIUM';
    final action = data['immediateAction'] ??
        'Reroute lead vehicle via bypass corridor. Dispatch standby assistant Anita to venue 20 mins early for hair sectioning.';
    final backup = data['backupArtistAssigned'] ?? 'Anita (Senior Associate, 4.9★, 6km away)';
    final msgDraft = data['clientMessageDraft'] ??
        'Namaste Radhika! Our lead team is navigating slight venue traffic. Stylist Anita is already in the suite setting up daylight mirrors so we finish strictly on schedule! 👑';

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
              const Icon(Icons.psychology, color: AppColors.roseGold, size: 22),
              const SizedBox(width: 8),
              const Text(
                'Hugging Face AI Contingency Dispatcher',
                style: TextStyle(color: AppPalette.textGold, fontSize: 16, fontWeight: FontWeight.bold),
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
                      color: Colors.amber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amberAccent),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Colors.amberAccent, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'INCIDENT SEVERITY: $severity',
                          style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('AI LOGISTICS RESOLUTION PROTOCOL', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(action.toString(), style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.3)),
                  const SizedBox(height: 14),
                  const Text('RECOMMENDED BACKUP ARTIST ON-CALL', style: TextStyle(color: AppPalette.textGold, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text('📍 $backup', style: const TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 14),
                  const Text('COURTESY WHATSAPP MESSAGE (READY TO DISPATCH)', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCF8C6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: SelectableText(
                      msgDraft.toString(),
                      style: const TextStyle(color: Colors.black87, fontSize: 11, height: 1.3),
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
                backgroundColor: AppColors.roseGold,
                foregroundColor: AppColors.deepPlum,
              ),
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✓ Contingency protocol executed & message dispatched to bride WhatsApp.'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              child: const Text('Authorize & Send Protocol'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Artist Field Dispatch & Location Board',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology, color: AppPalette.textGold),
            tooltip: 'Hugging Face AI Contingency Dispatcher',
            onPressed: _runHfDispatchContingencyAdvisor,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppPalette.textGold),
            tooltip: 'Sync Live GPS & ETA',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('🔄 Field dispatch locations refreshed.')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Top Summary Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.roseGold.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildDispatchStat('Active Artists in Field', '4', Colors.white),
                _buildDispatchStat('Arrived at Palace', '1', Colors.lightGreenAccent),
                _buildDispatchStat('In Transit', '2', Colors.amberAccent),
                _buildDispatchStat('Transit Alert', '1 Delayed', Colors.redAccent),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'TODAY’S WEDDING DISPATCH ROSTER & LIVE ETA',
            style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),

          ..._dispatches.map((dsp) {
            final isDelayed = dsp['isDelayed'] as bool;
            final isArrived = dsp['status'] == 'ARRIVED_AT_SUITE';
            final statusColor = isDelayed ? Colors.redAccent : isArrived ? Colors.lightGreenAccent : Colors.amberAccent;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppPalette.surfaceDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: statusColor.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isArrived ? Icons.check_circle_outline : isDelayed ? Icons.warning_amber_rounded : Icons.directions_car,
                            color: statusColor,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            dsp['artistName'],
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                            child: Text(dsp['role'], style: const TextStyle(color: AppPalette.textGold, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                        child: Text(dsp['status'], style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Bride: ${dsp['brideName']} (#${dsp['bookingId']})', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text('📍 ${dsp['venue']}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text('Muhurat Ready-By: ${dsp['readyByTime']} (Scheduled Arrival: ${dsp['scheduledArrival']})', style: const TextStyle(color: Colors.white60, fontSize: 11)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(dsp['transitEta'], style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              if (isDelayed)
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.emergency, size: 14),
                                  label: const Text('Suggest Backup', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red.shade900,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  ),
                                  onPressed: () => _showBackupSuggestModal(dsp['artistName'], dsp['bookingId']),
                                ),
                              const SizedBox(width: 8),
                              OutlinedButton.icon(
                                icon: const Icon(Icons.inventory_2_outlined, size: 14),
                                label: Text(dsp['kitCheckedOut'] ? 'Kit Checked Out ✓' : 'Verify Kit', style: const TextStyle(fontSize: 11)),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppPalette.textGold,
                                  side: const BorderSide(color: AppPalette.goldAccent),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                ),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Kit & compressor verified for ${dsp['artistName']}')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildDispatchStat(String label, String val, Color color) {
    return Column(
      children: [
        Text(val, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
      ],
    );
  }
}
