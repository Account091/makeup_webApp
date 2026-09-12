import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/product_entity.dart';

class ProductStorefrontScreen extends StatefulWidget {
  const ProductStorefrontScreen({super.key});

  @override
  State<ProductStorefrontScreen> createState() => _ProductStorefrontScreenState();
}

class _ProductStorefrontScreenState extends State<ProductStorefrontScreen> {
  ProductSkinType _selectedSkinType = ProductSkinType.all;
  ProductFinish? _selectedFinish;

  final List<ProductEntity> _products = [

    const ProductEntity(
      productId: 'prod_01',
      title: 'Royal Velvet Matte Lipstick',
      description: 'Long-lasting 16-hour hydration matte lipstick crafted for Rajasthan bridal ceremonies.',
      price: 1850.0,
      offerPrice: 1550.0,
      stockCount: 45,
      sku: 'SKU-LIP-ROYAL-01',
      category: ProductCategory.lipstick,
      skinType: ProductSkinType.all,
      finish: ProductFinish.matte,
      shade: 'Ruby Bride',
      isCrueltyFree: true,
      isPublished: true,
      imageUrls: ['https://example.com/lipstick.jpg'],
      ingredients: ['Hyaluronic Acid', 'Shea Butter', 'Vitamin E'],
      usageInstructions: 'Apply directly to lips or outline with lip liner for full coverage.',
    ),
    const ProductEntity(
      productId: 'prod_02',
      title: 'HD Airbrush Glow Foundation',
      description: 'Ultra-lightweight sweat-proof airbrush foundation designed for high-humidity outdoor events.',
      price: 3400.0,
      offerPrice: 2950.0,
      stockCount: 18,
      sku: 'SKU-FND-GLOW-02',
      category: ProductCategory.foundation,
      skinType: ProductSkinType.dry,
      finish: ProductFinish.dewy,
      shade: 'Warm Honey 03',
      isCrueltyFree: true,
      isPublished: true,
      imageUrls: ['https://example.com/foundation.jpg'],
      ingredients: ['Rose Water', 'Jojoba Oil', 'Niacinamide'],
      usageInstructions: 'Dispense 2 drops into airbrush stylus or apply with beauty blender.',
    ),
    const ProductEntity(
      productId: 'prod_03',
      title: 'Prachi Signature Bridal Essentials Kit',
      description: 'Curated 7-piece beauty bundle recommended during personal bridal consultations.',
      price: 12500.0,
      offerPrice: 9900.0,
      stockCount: 12,
      sku: 'SKU-KIT-BRIDAL-03',
      category: ProductCategory.bridalKit,
      skinType: ProductSkinType.all,
      finish: ProductFinish.dewy,
      shade: 'Complete Bridal Set',
      isCrueltyFree: true,
      isPublished: true,
      imageUrls: ['https://example.com/bridal_kit.jpg'],
      ingredients: ['Dermatologist Tested', 'Non-Comedogenic'],
      usageInstructions: 'Complete step-by-step bridal prep guide included inside box.',
    ),
  ];

  final List<OrderItemEntity> _cart = [];

  @override
  Widget build(BuildContext context) {
    final filteredProducts = _products.where((p) {
      if (_selectedSkinType != ProductSkinType.all && p.skinType != ProductSkinType.all && p.skinType != _selectedSkinType) {
        return false;
      }
      if (_selectedFinish != null && p.finish != _selectedFinish) {
        return false;
      }
      return true;
    }).toList();


    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Makeovers Store & Beauty Kits',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, color: AppPalette.textGold),
                onPressed: _showCartDrawer,
              ),
              if (_cart.isNotEmpty)
                Positioned(
                  right: 8,
                  top: 8,
                  child: CircleAvatar(
                    radius: 8,
                    backgroundColor: Colors.redAccent,
                    child: Text(
                      '${_cart.length}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Bridal Kit Recommendation Banner
            _buildBridalKitBanner(),
            const SizedBox(height: 20),

            // 2. Beauty Filters (Skin Type & Finish)
            const Text(
              'FILTER BY SKIN TYPE & FINISH',
              style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ProductSkinType.values.map((st) {
                  final isSelected = st == _selectedSkinType;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(st.name.toUpperCase()),
                      selectedColor: AppPalette.goldAccent,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.black : Colors.white70,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 11,
                      ),
                      backgroundColor: AppPalette.surfaceDark,
                      onSelected: (val) {
                        setState(() {
                          _selectedSkinType = st;
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // 3. Product Catalog Grid
            const Text(
              'CURATED PRODUCTS & REFILLS',
              style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredProducts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final product = filteredProducts[index];
                return _buildProductCard(product);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBridalKitBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppPalette.surfaceDark, AppPalette.goldAccent.withValues(alpha: 0.15)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.auto_awesome, color: AppPalette.textGold, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Personalized Bridal Kit Recommendation', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                SizedBox(height: 4),
                Text('Products matched to your approved Bridal Questionnaire skin profile & finish.', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(ProductEntity product) {
    return Container(
      padding: const EdgeInsets.all(14),
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
              Expanded(
                child: Text(
                  product.title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
              if (product.isCrueltyFree)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('CRUELTY FREE 🐰', style: TextStyle(color: Colors.lightGreenAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(product.description, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
          const SizedBox(height: 10),
          Row(
            children: [
              Chip(
                label: Text('Shade: ${product.shade}', style: const TextStyle(fontSize: 10, color: AppPalette.textGold)),
                backgroundColor: Colors.black26,
                visualDensity: VisualDensity.compact,
              ),
              const SizedBox(width: 8),
              Chip(
                label: Text('Finish: ${product.finish.name.toUpperCase()}', style: const TextStyle(fontSize: 10, color: Colors.white70)),
                backgroundColor: Colors.black26,
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('₹${product.offerPrice.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(width: 6),
                      Text('₹${product.price.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white38, fontSize: 12, decoration: TextDecoration.lineThrough)),
                    ],
                  ),
                  Text('In Stock: ${product.stockCount} units', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _cart.add(OrderItemEntity(
                      productId: product.productId,
                      productTitle: product.title,
                      quantity: 1,
                      unitPrice: product.offerPrice,
                      shade: product.shade,
                    ));
                  });
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${product.title} added to cart!')));
                },
                icon: const Icon(Icons.add_shopping_cart, size: 14),
                label: const Text('Add to Cart', style: TextStyle(fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCartDrawer() {
    double subtotal = 0;
    for (var item in _cart) {
      subtotal += item.itemTotal;
    }
    final tax = subtotal * 0.18;
    final shipping = subtotal >= 2000 ? 0.0 : 150.0;
    final grandTotal = subtotal + tax + shipping;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppPalette.surfaceDark,
      builder: (_) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Your Shopping Cart', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            if (_cart.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: Text('Your cart is empty.', style: TextStyle(color: AppPalette.textSecondary))),
              )
            else ...[
              ListView.builder(
                shrinkWrap: true,
                itemCount: _cart.length,
                itemBuilder: (context, index) {
                  final item = _cart[index];
                  return ListTile(
                    title: Text(item.productTitle, style: const TextStyle(color: Colors.white, fontSize: 13)),
                    subtitle: Text('Shade: ${item.shade}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                    trailing: Text('₹${item.itemTotal.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold)),
                  );
                },
              ),
              const Divider(color: Colors.white12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Grand Total (Incl. GST 18%):', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text('₹${grandTotal.toStringAsFixed(0)}', style: const TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      _cart.clear();
                    });
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed successfully! Authoritative invoice generated.')));
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                  child: const Text('Checkout & Place Order'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
