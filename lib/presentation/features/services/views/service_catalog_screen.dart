import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/service_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../booking/views/booking_inquiry_screen.dart';
import '../bloc/service_bloc.dart';
import '../bloc/service_state.dart';

class ServiceCatalogScreen extends StatelessWidget {
  const ServiceCatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.champagne,
      appBar: AppBar(
        backgroundColor: AppColors.deepPlum,
        title: Text(
          'Services & Packages | Makeovers by Prachi',
          style: AppTextStyles.headingTitle
              .copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      body: BlocBuilder<ServiceBloc, ServiceState>(
        builder: (context, state) {
          if (state is ServiceLoadingState) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.roseGold),
            );
          }

          List<ServiceEntity> services = [];
          if (state is ServicesLoadedState) {
            services = state.services;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bridal & Occasion Beauty Catalog',
                  style: AppTextStyles.headingDisplay.copyWith(fontSize: 24),
                ),
                const SizedBox(height: 4),
                Text(
                  'Jodhpur Studio & Outstation Destination Makeup Services',
                  style: AppTextStyles.bodySecondary,
                ),
                const SizedBox(height: 20),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: services.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final service = services[index];
                    return _buildServiceCard(context, service);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildServiceCard(BuildContext context, ServiceEntity service) {
    String priceText;
    switch (service.priceMode) {
      case PriceMode.startingAt:
        priceText =
            'Starting from ${AppFormatters.formatCurrency(service.startingPrice)}';
        break;
      case PriceMode.fixedPrice:
        priceText = AppFormatters.formatCurrency(service.startingPrice);
        break;
      case PriceMode.priceOnRequest:
        priceText = 'Price on Request / Custom Quote';
        break;
      case PriceMode.customQuote:
        priceText = 'Custom Package Quote';
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Image.network(
              service.imageUrl,
              height: 180,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 180,
                color: AppColors.softRose,
                child: const Center(
                  child: Icon(Icons.face_retouching_natural,
                      size: 48, color: AppColors.deepPlum),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        service.title,
                        style: AppTextStyles.sectionHeader
                            .copyWith(fontSize: 18),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.softRose.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        service.category,
                        style: AppTextStyles.bodySecondary.copyWith(
                          color: AppColors.deepPlum,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  service.description,
                  style: AppTextStyles.bodySecondary,
                ),
                const SizedBox(height: 12),
                Text(
                  priceText,
                  style: AppTextStyles.sectionHeader.copyWith(
                    color: AppColors.roseGold,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text('What\'s Included:',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                ...service.inclusions.map((inc) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle,
                              size: 14, color: AppColors.emeraldGreen),
                          const SizedBox(width: 6),
                          Text(inc, style: AppTextStyles.bodySecondary),
                        ],
                      ),
                    )),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    label: 'Book / Request Quote',
                    icon: Icons.calendar_month,
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const BookingInquiryScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
