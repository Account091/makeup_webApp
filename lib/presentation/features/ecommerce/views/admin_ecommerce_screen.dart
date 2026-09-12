import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/product_entity.dart';

class AdminEcommerceScreen extends StatefulWidget {
  const AdminEcommerceScreen({super.key});

  @override
  State<AdminEcommerceScreen> createState() => _AdminEcommerceScreenState();
}

class _AdminEcommerceScreenState extends State<AdminEcommerceScreen> {
  final List<ProductOrderEntity> _orders = [
    ProductOrderEntity(
      orderId: 'ord_2026_901',
      customerId: 'cust_771',
      customerName: 'Pooja Sharma',
      customerPhone: '+91 98290 11223',
      items: [
        const OrderItemEntity(productId: 'prod_01', productTitle: 'Royal Velvet Matte Lipstick', quantity: 2, unitPrice: 1550.0, shade: 'Ruby Bride'),
      ],
      subtotal: 3100.0,
      taxAmount: 558.0,
      shippingFee: 0.0,
      grandTotal: 3658.0,
      orderStatus: 'PAID',
      shippingAddress: '74, Residency Road, Jodhpur, Rajasthan',
      courier: 'Delhivery Surface',
      trackingNumber: 'DEL992817261',
      orderedAt: DateTime.parse('2026-09-12 10:15:00'),
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
            'Ecommerce & Dispatch Operations',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            tabs: [
              Tab(text: 'Orders & Dispatch'),
              Tab(text: 'Inventory Audit'),
              Tab(text: 'Returns & Refunds'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildOrdersDispatchTab(),
            _buildInventoryAuditTab(),
            _buildReturnsRefundsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildOrdersDispatchTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _orders.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final order = _orders[index];
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
                  Text('#${order.orderId} • ${order.customerName}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(order.orderStatus, style: const TextStyle(color: Colors.lightBlueAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text('Items: ${order.items.map((i) => "${i.productTitle} (x${i.quantity})").join(", ")}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
              const SizedBox(height: 6),
              Text('Deliver To: ${order.shippingAddress}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Grand Total: ₹${order.grandTotal.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 13)),
                  ElevatedButton.icon(
                    onPressed: () {
                      _showDispatchDialog(order);
                    },
                    icon: const Icon(Icons.local_shipping, size: 14),
                    label: const Text('Update Shipping / Courier', style: TextStyle(fontSize: 11)),
                    style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInventoryAuditTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('AUDIT-LOGGED STOCK MOVEMENTS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          _buildMovementTile('SALE (-2)', 'Royal Velvet Matte Lipstick', 'Previous: 47 → New: 45', 'Order #ord_2026_901'),
          const SizedBox(height: 8),
          _buildMovementTile('PURCHASE (+50)', 'M.A.C Restock Batch #882', 'Previous: 0 → New: 50', 'Restock Vendor Invoice #991'),
          const SizedBox(height: 8),
          _buildMovementTile('ADJUSTMENT (-1)', 'HD Airbrush Glow Foundation', 'Previous: 19 → New: 18', 'Damaged in transit'),
        ],
      ),
    );
  }

  Widget _buildMovementTile(String type, String product, String stockChange, String reason) {
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
              Text('$type • $product', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              Text('$stockChange • Reason: $reason', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
            ],
          ),
          const Icon(Icons.history, color: AppPalette.textGold, size: 16),
        ],
      ),
    );
  }

  Widget _buildReturnsRefundsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('PRODUCT RETURNS & LEDGER REFUNDS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
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
                    const Text('Return Request #ret_102', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                      child: const Text('PENDING INSPECTION', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text('Item: HD Airbrush Glow Foundation (Wrong Shade Requested)', style: TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(onPressed: () {}, child: const Text('Reject', style: TextStyle(color: Colors.redAccent))),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Return approved! Product restocked & ₹2,950 refund appended to ledger.')));
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                      child: const Text('Approve & Refund ₹2,950'),
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

  void _showDispatchDialog(ProductOrderEntity order) {
    final courierController = TextEditingController(text: order.courier ?? 'Delhivery Surface');
    final trackingController = TextEditingController(text: order.trackingNumber ?? '');

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Dispatch Order #${order.orderId}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: courierController, decoration: const InputDecoration(labelText: 'Courier Service')),
            TextField(controller: trackingController, decoration: const InputDecoration(labelText: 'Airway Bill / Tracking Number')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Order #${order.orderId} marked as SHIPPED via ${courierController.text}.')));
            },
            child: const Text('Mark Shipped'),
          ),
        ],
      ),
    );
  }
}
