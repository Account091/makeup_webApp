import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../domain/entities/service_entity.dart';
import '../../../common/widgets/custom_button.dart';
import '../../booking/views/booking_inquiry_screen.dart';
import '../bloc/service_bloc.dart';
import '../bloc/service_state.dart';

class ServiceCatalogScreen extends StatefulWidget {
  const ServiceCatalogScreen({super.key});

  @override
  State<ServiceCatalogScreen> createState() => _ServiceCatalogScreenState();
}

class _ServiceCatalogScreenState extends State<ServiceCatalogScreen> {
  void _showAddServiceDialog(BuildContext context) {
    final titleController = TextEditingController();
    final categoryController = TextEditingController(text: 'BRIDAL');
    final priceController = TextEditingController();
    final durationController = TextEditingController(text: '3.0 Hours');
    final descriptionController = TextEditingController();
    final inclusionsController = TextEditingController(
      text: 'HD Airbrush Base, Lash Extensions, Dupatta Setting',
    );
    final imageUrlController = TextEditingController(
      text: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    );
    bool isPopular = false;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: Text(
                'Add New Service / Category',
                style: AppTextStyles.headingTitle.copyWith(color: AppColors.deepPlum),
              ),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: 500,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: titleController,
                        decoration: const InputDecoration(
                          labelText: 'Service Title *',
                          hintText: 'e.g. Pre-Wedding Haldi & Mehendi Glam',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: categoryController,
                        decoration: const InputDecoration(
                          labelText: 'Category * (e.g. BRIDAL, ENGAGEMENT, HALDI, PARTY)',
                          hintText: 'BRIDAL',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: priceController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Price (INR) *',
                                hintText: '18000',
                                border: OutlineInputBorder(),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: durationController,
                              decoration: const InputDecoration(
                                labelText: 'Duration',
                                hintText: '3.0 Hours',
                                border: OutlineInputBorder(),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: descriptionController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Description',
                          hintText: 'Full makeup service with long-lasting HD finish.',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: inclusionsController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Inclusions (Comma-separated)',
                          hintText: 'HD Airbrush, Lashes, Hair Styling, Draping',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: imageUrlController,
                        decoration: const InputDecoration(
                          labelText: 'Image URL',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 12),
                      CheckboxListTile(
                        title: const Text('Mark as Most Popular / Featured'),
                        value: isPopular,
                        onChanged: (val) {
                          setModalState(() => isPopular = val ?? false);
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.deepPlum,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () async {
                    final title = titleController.text.trim();
                    final category = categoryController.text.trim().toUpperCase();
                    final priceVal = double.tryParse(priceController.text.trim()) ?? 15000;

                    if (title.isEmpty) return;

                    final inclusionsList = inclusionsController.text
                        .split(',')
                        .map((e) => e.trim())
                        .where((e) => e.isNotEmpty)
                        .toList();

                    final docRef = FirebaseFirestore.instance.collection('services').doc();

                    await docRef.set({
                      'id': docRef.id,
                      'title': title,
                      'category': category,
                      'price': '₹${priceVal.toStringAsFixed(0)}',
                      'startingPrice': priceVal,
                      'deposit': '₹${(priceVal * 0.3).round()} (30% Lock)',
                      'duration': durationController.text.trim(),
                      'description': descriptionController.text.trim(),
                      'inclusions': inclusionsList.isNotEmpty
                          ? inclusionsList
                          : ['HD Base Makeup', 'Hair Styling'],
                      'imageUrl': imageUrlController.text.trim(),
                      'popular': isPopular,
                      'isFeatured': isPopular,
                      'createdAt': FieldValue.serverTimestamp(),
                    });

                    if (dialogContext.mounted) {
                      Navigator.pop(dialogContext);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Service "$title" added to Firestore & website!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  },
                  child: const Text('Save & Publish to Website'),
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
        title: Text(
          'Services & Packages | Admin Console',
          style: AppTextStyles.headingTitle.copyWith(color: AppColors.roseGold, fontSize: 16),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddServiceDialog(context),
        backgroundColor: AppColors.deepPlum,
        foregroundColor: AppColors.roseGold,
        icon: const Icon(Icons.add_circle_outline),
        label: const Text('Add Service / Category'),
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

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.spaceBetween,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bridal & Occasion Beauty Catalog',
                              style: AppTextStyles.headingDisplay.copyWith(fontSize: 22),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Publish services, rates, & inclusions live to Firestore & Website',
                              style: AppTextStyles.bodySecondary,
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: () => _showAddServiceDialog(context),
                          icon: const Icon(Icons.add),
                          label: const Text('New Package'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.roseGold,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final width = constraints.maxWidth;
                        final int cols = width > 900 ? 3 : (width > 600 ? 2 : 1);
                        final double cardWidth = cols == 1
                            ? width
                            : (width - (cols - 1) * 16) / cols;

                        return Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: services.map((service) => SizedBox(
                            width: cardWidth,
                            child: _buildServiceCard(context, service),
                          )).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
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
        priceText = 'Starting from ${AppFormatters.formatCurrency(service.startingPrice)}';
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
                  child: Icon(Icons.face_retouching_natural, size: 48, color: AppColors.deepPlum),
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
                        style: AppTextStyles.sectionHeader.copyWith(fontSize: 18),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
                const Text('What\'s Included:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                ...service.inclusions.map((inc) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, size: 14, color: AppColors.emeraldGreen),
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
