import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../common/widgets/custom_button.dart';
import 'multi_step_booking_wizard.dart';

class CustomerHomeScreen extends StatelessWidget {
  const CustomerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 1. Luxury Hero Banner
            _buildHeroSection(context),

            // 2. Trust & Proof Bar
            _buildProofBar(),

            // 3. Signature Rajasthani Bridal Showcase
            _buildSignatureShowcase(context),

            // 4. Featured Services Snapshot
            _buildFeaturedServices(context),

            // 5. Before / After Transformations
            _buildBeforeAfterSection(),

            // 6. Social Reels & Video Cards
            _buildSocialReelsSection(),

            // 7. Verified Reviews & Testimonials
            _buildReviewsSection(),

            // 8. FAQ Accordion Section
            _buildFaqSection(),

            // 9. Footer & Quick Book CTA
            _buildFooter(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
      decoration: const BoxDecoration(
        color: AppColors.deepPlum,
        image: DecorationImage(
          image: NetworkImage(
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200'),
          fit: BoxFit.cover,
          opacity: 0.25,
        ),
      ),
      child: Column(
        children: [
          Text(
            'MAKEOVERS BY PRACHI',
            textAlign: TextAlign.center,
            style: AppTextStyles.headingDisplay.copyWith(
              color: AppColors.roseGold,
              fontSize: 32,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Luxury Bridal & Occasion Artistry • Jodhpur, Rajasthan',
            textAlign: TextAlign.center,
            style: AppTextStyles.sectionHeader.copyWith(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Text(
              'Specializing in seamless HD/Airbrush bridal aesthetics, traditional Rajasthani Poshak draping, and royal jewelry coordination.',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodySecondary.copyWith(
                color: Colors.white70,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(height: 28),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              CustomButton(
                label: 'Book Your Date',
                icon: Icons.calendar_month,
                onPressed: () => _openBookingWizard(context),
              ),
              CustomButton(
                label: 'Explore Bridal Looks',
                isSecondary: true,
                icon: Icons.auto_awesome,
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProofBar() {
    return Container(
      color: AppColors.softRose.withValues(alpha: 0.3),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildProofItem(Icons.verified, 'Certified Professional'),
          _buildProofItem(Icons.location_on, 'Jodhpur & Destination'),
          _buildProofItem(Icons.style, 'Rajasthani Poshak Expert'),
        ],
      ),
    );
  }

  Widget _buildProofItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: AppColors.roseGold, size: 18),
        const SizedBox(width: 6),
        Text(
          text,
          style: AppTextStyles.bodySecondary.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.deepPlum,
          ),
        ),
      ],
    );
  }

  Widget _buildSignatureShowcase(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text('Signature Royal Styling',
              style: AppTextStyles.headingDisplay.copyWith(fontSize: 24)),
          const SizedBox(height: 4),
          Text(
            'Traditional Rajasthani Poshak Draping & Royal Jewelry Setting',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySecondary,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
                    height: 220,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
                    height: 220,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturedServices(BuildContext context) {
    final services = [
      {
        'title': 'Signature Bridal Makeover',
        'price': 'Starting at ₹15,000',
        'desc': 'HD/Airbrush finish with Poshak draping and hair accessories.',
        'img': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      },
      {
        'title': 'Pre-Wedding & Engagement Glam',
        'price': 'Starting at ₹8,000',
        'desc': 'Soft, romantic dewy makeup tailored for engagement functions.',
        'img': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Featured Beauty Packages',
              style: AppTextStyles.headingTitle.copyWith(fontSize: 22)),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: services.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final s = services[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.lightBorder),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(s['img']!,
                          width: 80, height: 80, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s['title']!, style: AppTextStyles.sectionHeader),
                          Text(s['price']!,
                              style: AppTextStyles.bodySecondary.copyWith(
                                  color: AppColors.roseGold,
                                  fontWeight: FontWeight.bold)),
                          Text(s['desc']!, style: AppTextStyles.bodySecondary),
                        ],
                      ),
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

  Widget _buildBeforeAfterSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Column(
        children: [
          Text('Real Transformation Stories',
              style: AppTextStyles.headingTitle.copyWith(fontSize: 20)),
          const SizedBox(height: 4),
          Text('Natural enhancement honoring traditional Indian skin tones',
              style: AppTextStyles.bodySecondary),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Chip(
                backgroundColor: AppColors.softRose,
                label: Text('Before Makeup', style: AppTextStyles.bodySecondary),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.arrow_forward, color: AppColors.roseGold),
              const SizedBox(width: 8),
              Chip(
                backgroundColor: AppColors.roseGold,
                label: const Text('Bridal Finish',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSocialReelsSection() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Latest Instagram & YouTube Reels',
              style: AppTextStyles.headingTitle.copyWith(fontSize: 20)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.play_circle_fill,
                        color: Colors.purple, size: 28),
                    const SizedBox(width: 8),
                    Text('Royal Rajasthani Bridal Look',
                        style: AppTextStyles.sectionHeader),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Watch transformation reel on Instagram • Jodhpur Studio',
                    style: AppTextStyles.bodySecondary),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.favorite, size: 16, color: Colors.redAccent),
                    const SizedBox(width: 4),
                    Text('1,420 website likes',
                        style: AppTextStyles.bodySecondary),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: AppColors.softRose.withValues(alpha: 0.2),
      child: Column(
        children: [
          Text('Verified Bride Reviews',
              style: AppTextStyles.headingTitle.copyWith(fontSize: 20)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.star, color: AppColors.roseGold, size: 18),
                    Icon(Icons.star, color: AppColors.roseGold, size: 18),
                    Icon(Icons.star, color: AppColors.roseGold, size: 18),
                    Icon(Icons.star, color: AppColors.roseGold, size: 18),
                    Icon(Icons.star, color: AppColors.roseGold, size: 18),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '"Prachi was an absolute dream to work with! My poshak draping and eye makeup stayed perfect all night long."',
                  style: AppTextStyles.bodyPrimary,
                ),
                const SizedBox(height: 8),
                Text('— Radhika J. (Bridal Client, Jodhpur)',
                    style: AppTextStyles.bodySecondary.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.deepPlum)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFaqSection() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Frequently Asked Questions',
              style: AppTextStyles.headingTitle.copyWith(fontSize: 20)),
          const SizedBox(height: 12),
          const ExpansionTile(
            title: Text('How far in advance should I book my bridal date?'),
            children: [
              Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                    'We recommend booking 3 to 6 months in advance for peak wedding season (October to March).'),
              ),
            ],
          ),
          const ExpansionTile(
            title: Text('Do you travel to venues outside Jodhpur?'),
            children: [
              Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                    'Yes! Prachi travels for destination weddings across Rajasthan and India. Distance tiers and travel charges apply.'),
              ),
            ],
          ),
          const ExpansionTile(
            title: Text('Is traditional Poshak draping included?'),
            children: [
              Padding(
                padding: EdgeInsets.all(12),
                child: Text(
                    'Yes, traditional Rajasthani Poshak & dupatta draping is included in all Signature Bridal Packages.'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.deepPlum,
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text('MAKEOVERS BY PRACHI',
              style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold)),
          const SizedBox(height: 6),
          Text('Jodhpur, Rajasthan • Phone: +91 98290 12345',
              style: AppTextStyles.bodySecondary.copyWith(color: Colors.white70)),
          const SizedBox(height: 20),
          CustomButton(
            label: 'Book Your Wedding Date',
            icon: Icons.calendar_month,
            onPressed: () => _openBookingWizard(context),
          ),
        ],
      ),
    );
  }

  void _openBookingWizard(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MultiStepBookingWizard()),
    );
  }
}
