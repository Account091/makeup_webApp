import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/artist_entity.dart';

class TeamManagementScreen extends StatefulWidget {
  const TeamManagementScreen({super.key});

  @override
  State<TeamManagementScreen> createState() => _TeamManagementScreenState();
}

class _TeamManagementScreenState extends State<TeamManagementScreen> {
  final List<ArtistEntity> _team = [
    const ArtistEntity(
      artistId: 'artist_01',
      name: 'Prachi (Lead Artist)',
      profilePhoto: 'https://example.com/prachi.jpg',
      bio: 'Master Bridal Makeup Artist & Academy Director with 10+ years experience in Rajasthan Royal Weddings.',
      role: ArtistRole.owner,
      skills: [ArtistSkill.bridalMakeup, ArtistSkill.airbrush, ArtistSkill.rajasthaniPoshak, ArtistSkill.hairStyling],
      supportedLocations: ['Jodhpur', 'Udaipur', 'Jaipur', 'Jaisalmer'],
      basePricing: 25000.0,
      rating: 5.0,
      experienceYears: 10,
      isActive: true,
    ),
    const ArtistEntity(
      artistId: 'artist_02',
      name: 'Ananya Sharma',
      profilePhoto: 'https://example.com/ananya.jpg',
      bio: 'Senior Hair Stylist specializing in Royal Bridal Buns, Braids, and Floral Styling.',
      role: ArtistRole.hairArtist,
      skills: [ArtistSkill.hairStyling],
      supportedLocations: ['Jodhpur', 'Udaipur'],
      basePricing: 5000.0,
      rating: 4.9,
      experienceYears: 6,
      isActive: true,
    ),
    const ArtistEntity(
      artistId: 'artist_03',
      name: 'Riya Kanwar',
      profilePhoto: 'https://example.com/riya.jpg',
      bio: 'Specialist Draping Artist for Royal Rajputi Poshaks, Double Dupattas, and Saree Styling.',
      role: ArtistRole.drapingArtist,
      skills: [ArtistSkill.draping, ArtistSkill.sariDraping, ArtistSkill.rajasthaniPoshak],
      supportedLocations: ['Jodhpur'],
      basePricing: 3500.0,
      rating: 4.8,
      experienceYears: 5,
      isActive: true,
    ),
  ];

  final List<BookingAssignmentEntity> _assignments = [
    BookingAssignmentEntity(
      assignmentId: 'asgn_101_01',
      bookingId: 'bk_2026_101',
      artistId: 'artist_01',
      artistName: 'Prachi',
      serviceTitle: 'Royal Bridal Makeup',
      assignedRole: ArtistRole.makeupArtist,
      startTime: DateTime.parse('2026-09-20 09:00:00'),
      endTime: DateTime.parse('2026-09-20 12:00:00'),
      status: 'CONFIRMED',
      commissionAmount: 17500.0,
    ),
    BookingAssignmentEntity(
      assignmentId: 'asgn_101_02',
      bookingId: 'bk_2026_101',
      artistId: 'artist_02',
      artistName: 'Ananya Sharma',
      serviceTitle: 'Royal Bridal Hair Styling',
      assignedRole: ArtistRole.hairArtist,
      startTime: DateTime.parse('2026-09-20 10:00:00'),
      endTime: DateTime.parse('2026-09-20 12:00:00'),
      status: 'CONFIRMED',
      commissionAmount: 3500.0,
    ),
    BookingAssignmentEntity(
      assignmentId: 'asgn_101_03',
      bookingId: 'bk_2026_101',
      artistId: 'artist_03',
      artistName: 'Riya Kanwar',
      serviceTitle: 'Rajputi Poshak & Dupatta Draping',
      assignedRole: ArtistRole.drapingArtist,
      startTime: DateTime.parse('2026-09-20 11:00:00'),
      endTime: DateTime.parse('2026-09-20 12:30:00'),
      status: 'CONFIRMED',
      commissionAmount: 2450.0,
    ),
  ];

  final List<StudioResourceEntity> _studioResources = [
    const StudioResourceEntity(
      resourceId: 'res_01',
      resourceName: 'Bridal Suite 1 (Lake View)',
      resourceType: 'ROOM',
      capacity: 4,
      location: 'Main Jodhpur Studio',
      isAvailable: true,
    ),
    const StudioResourceEntity(
      resourceId: 'res_02',
      resourceName: 'Makeup Station Alpha',
      resourceType: 'MAKEUP_STATION',
      capacity: 1,
      location: 'Main Jodhpur Studio',
      isAvailable: true,
    ),
    const StudioResourceEntity(
      resourceId: 'res_03',
      resourceName: 'Hair Styling Chair B',
      resourceType: 'HAIR_STATION',
      capacity: 1,
      location: 'Main Jodhpur Studio',
      isAvailable: true,
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
            'Team & Multi-Artist Operations',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            tabs: [
              Tab(text: 'Staff Roster'),
              Tab(text: 'Multi-Artist Bookings'),
              Tab(text: 'Studio Stations'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildStaffRosterTab(),
            _buildMultiArtistBookingsTab(),
            _buildStudioStationsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildStaffRosterTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('TEAM MEMBERS & SPECIALISTS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Staff Onboarding modal: Invitation sent to new artist.')));
                },
                icon: const Icon(Icons.person_add, size: 14),
                label: const Text('Add Artist', style: TextStyle(fontSize: 11)),
                style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _team.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final artist = _team[index];
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
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: AppPalette.goldAccent.withValues(alpha: 0.2),
                              child: Text(artist.name[0], style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(artist.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                                Text('${artist.role.name.toUpperCase()} • ${artist.experienceYears} Years Exp', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('★ ${artist.rating.toStringAsFixed(1)}', style: const TextStyle(color: Colors.lightGreenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(artist.bio, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: artist.skills.map((s) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppPalette.goldAccent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(s.name.toUpperCase(), style: const TextStyle(color: AppPalette.textGold, fontSize: 9, fontWeight: FontWeight.bold)),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMultiArtistBookingsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('MULTI-RESOURCE BOOKING ASSIGNMENTS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          const Text('Royal Bridal Booking (#bk_2026_101) requires 3 concurrent specialists:', style: TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 14),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _assignments.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final asgn = _assignments[index];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppPalette.surfaceDark,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${asgn.artistName} • ${asgn.assignedRole.name.toUpperCase()}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text(asgn.serviceTitle, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                        Text('Time: 09:00 AM – 12:00 PM', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('Payout: ₹${asgn.commissionAmount.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                          child: const Text('ASSIGNED ✅', style: TextStyle(color: Colors.lightGreenAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Server Assignment Engine evaluated: Best match suggested!')));
            },
            icon: const Icon(Icons.auto_mode, size: 16),
            label: const Text('Auto-Assign Best Matching Staff', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
          ),
        ],
      ),
    );
  }

  Widget _buildStudioStationsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('STUDIO ROOMS & MAKEUP STATIONS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _studioResources.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final res = _studioResources[index];
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
                        Text(res.resourceName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('${res.resourceType} • Capacity: ${res.capacity} Person(s) • ${res.location}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                      ],
                    ),
                    const Text('AVAILABLE 🟢', style: TextStyle(color: Colors.lightGreenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
