import '../../domain/entities/product_entity.dart';

class ProductModel extends ProductEntity {
  const ProductModel({
    required super.productId,
    required super.title,
    required super.description,
    required super.price,
    required super.offerPrice,
    required super.stockCount,
    required super.sku,
    required super.category,
    required super.skinType,
    required super.finish,
    required super.shade,
    required super.isCrueltyFree,
    required super.isPublished,
    required super.imageUrls,
    required super.ingredients,
    required super.usageInstructions,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json, String id) {
    return ProductModel(
      productId: id,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      offerPrice: (json['offerPrice'] ?? json['price'] ?? 0).toDouble(),
      stockCount: json['stockCount'] ?? 0,
      sku: json['sku'] ?? '',
      category: ProductCategory.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['category'] ?? '').toString().toLowerCase(),
        orElse: () => ProductCategory.lipstick,
      ),
      skinType: ProductSkinType.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['skinType'] ?? '').toString().toLowerCase(),
        orElse: () => ProductSkinType.all,
      ),
      finish: ProductFinish.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['finish'] ?? '').toString().toLowerCase(),
        orElse: () => ProductFinish.natural,
      ),
      shade: json['shade'] ?? 'Universal',
      isCrueltyFree: json['isCrueltyFree'] ?? true,
      isPublished: json['isPublished'] ?? true,
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      ingredients: List<String>.from(json['ingredients'] ?? []),
      usageInstructions: json['usageInstructions'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'title': title,
      'description': description,
      'price': price,
      'offerPrice': offerPrice,
      'stockCount': stockCount,
      'sku': sku,
      'category': category.name,
      'skinType': skinType.name,
      'finish': finish.name,
      'shade': shade,
      'isCrueltyFree': isCrueltyFree,
      'isPublished': isPublished,
      'imageUrls': imageUrls,
      'ingredients': ingredients,
      'usageInstructions': usageInstructions,
    };
  }
}
