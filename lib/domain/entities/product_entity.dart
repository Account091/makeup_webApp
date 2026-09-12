enum ProductSkinType { all, dry, oily, combination, sensitive }
enum ProductFinish { dewy, matte, natural, satin, glossy }
enum ProductCategory { lipstick, foundation, airbrush, lashes, skincare, bridalKit, tools }

class ProductEntity {
  final String productId;
  final String title;
  final String description;
  final double price;
  final double offerPrice;
  final int stockCount;
  final String sku;
  final ProductCategory category;
  final ProductSkinType skinType;
  final ProductFinish finish;
  final String shade;
  final bool isCrueltyFree;
  final bool isPublished;
  final List<String> imageUrls;
  final List<String> ingredients;
  final String usageInstructions;

  const ProductEntity({
    required this.productId,
    required this.title,
    required this.description,
    required this.price,
    required this.offerPrice,
    required this.stockCount,
    required this.sku,
    required this.category,
    required this.skinType,
    required this.finish,
    required this.shade,
    required this.isCrueltyFree,
    required this.isPublished,
    required this.imageUrls,
    required this.ingredients,
    required this.usageInstructions,
  });

  bool get inStock => stockCount > 0;
  double get discountPercent => price > offerPrice ? ((price - offerPrice) / price) * 100 : 0;
}

class ProductOrderEntity {
  final String orderId;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final List<OrderItemEntity> items;
  final double subtotal;
  final double taxAmount;
  final double shippingFee;
  final double grandTotal;
  final String orderStatus; // PENDING | PAID | CONFIRMED | PACKED | SHIPPED | DELIVERED | CANCELLED
  final String? shippingAddress;
  final String? courier;
  final String? trackingNumber;
  final DateTime orderedAt;

  const ProductOrderEntity({
    required this.orderId,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.items,
    required this.subtotal,
    required this.taxAmount,
    required this.shippingFee,
    required this.grandTotal,
    required this.orderStatus,
    this.shippingAddress,
    this.courier,
    this.trackingNumber,
    required this.orderedAt,
  });
}

class OrderItemEntity {
  final String productId;
  final String productTitle;
  final int quantity;
  final double unitPrice;
  final String shade;

  const OrderItemEntity({
    required this.productId,
    required this.productTitle,
    required this.quantity,
    required this.unitPrice,
    required this.shade,
  });

  double get itemTotal => quantity * unitPrice;
}
