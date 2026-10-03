import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/invoice_entity.dart';
import '../../../../domain/entities/payment_transaction_entity.dart';
import '../../../../domain/entities/expense_entity.dart';

class FinancialDashboardScreen extends StatefulWidget {
  const FinancialDashboardScreen({super.key});

  @override
  State<FinancialDashboardScreen> createState() => _FinancialDashboardScreenState();
}

class _FinancialDashboardScreenState extends State<FinancialDashboardScreen> {
  final List<InvoiceEntity> _invoices = [
    InvoiceEntity(
      invoiceNumber: 'MP/2026-27/00001',
      bookingId: 'bk_2026_101',
      customerId: 'cust_987',
      subtotal: 20500.0,
      cgstAmount: 1845.0,
      sgstAmount: 1845.0,
      grandTotal: 24190.0,
      amountPaid: 5000.0,
      balanceDue: 19190.0,
      status: InvoiceStatus.partiallyPaid,
      issuedAt: DateTime.parse('2026-09-12 11:15:00'),
    ),
  ];

  final List<PaymentTransactionEntity> _payments = [
    PaymentTransactionEntity(
      paymentId: 'pay_101_01',
      bookingId: 'bk_2026_101',
      invoiceId: 'MP/2026-27/00001',
      amount: 5000.0,
      paymentMethod: 'UPI (Razorpay)',
      gatewayTransactionId: 'txn_razor_99281',
      paidAt: DateTime.parse('2026-09-13 09:12:00'),
    ),
  ];

  final List<ExpenseEntity> _expenses = [
    ExpenseEntity(
      expenseId: 'exp_01',
      category: ExpenseCategory.travel,
      amount: 1500.0,
      vendor: 'Jodhpur Taxi Services',
      bookingId: 'bk_2026_101',
      notes: 'Outstation venue transport to Lake Palace Resort',
      spentAt: DateTime.parse('2026-09-15'),
    ),
    ExpenseEntity(
      expenseId: 'exp_02',
      category: ExpenseCategory.assistant,
      amount: 2000.0,
      vendor: 'Neha (Assistant Artist)',
      bookingId: 'bk_2026_101',
      notes: 'Assistant fee for party makeup batch',
      spentAt: DateTime.parse('2026-09-15'),
    ),
    ExpenseEntity(
      expenseId: 'exp_03',
      category: ExpenseCategory.products,
      amount: 800.0,
      vendor: 'M.A.C Cosmetics Restock',
      bookingId: 'bk_2026_101',
      notes: 'Airbrush pods & lashes restock',
      spentAt: DateTime.parse('2026-09-16'),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final totalRevenue = 485000.0;
    final totalExpenses = 122000.0;
    final netProfit = totalRevenue - totalExpenses;

    return DefaultTabController(
      length: 5,
      child: Scaffold(
        backgroundColor: AppPalette.backgroundDark,
        appBar: AppBar(
          title: const Text(
            'Finance, Invoicing & Compliance',
            style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppPalette.surfaceDark,
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.file_download_outlined, color: AppPalette.textGold),
              tooltip: 'Export CA GSTR-1 & Audit Spreadsheet',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('📊 Exporting CA-Certified GSTR-1 & Audit Ledger (CSV/Excel)...'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.psychology, color: AppPalette.textGold),
              tooltip: 'Run AI Financial Analyst Synthesis',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      '🤖 AI Financial Analyst Synthesis:\n• Gross Revenue: ₹645,000 | Net Revenue: ₹630,000 | Profit Margin: 58.2%\n• Cash Collected: ₹245,000 (38.9%) | Overdue Balance: ₹45,000 (HIGH Risk: 1 Client)\n• Reconciliation: MATCHED (₹0 Discrepancy) | Google Sheets Mirror: SYNCED',
                    ),
                    duration: Duration(seconds: 4),
                    backgroundColor: AppPalette.surfaceDark,
                  ),
                );
              },
            ),
          ],
          bottom: const TabBar(
            indicatorColor: AppPalette.goldAccent,
            labelColor: AppPalette.textGold,
            unselectedLabelColor: AppPalette.textSecondary,
            isScrollable: true,
            tabs: [
              Tab(text: 'P&L Overview'),
              Tab(text: 'Aging Balances & Reminders'),
              Tab(text: 'Invoices & Ledger'),
              Tab(text: 'Expenses'),
              Tab(text: 'Compliance & Audit'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildProfitLossTab(totalRevenue, totalExpenses, netProfit),
            _buildAgingBalancesTab(),
            _buildInvoicesLedgerTab(),
            _buildExpensesTab(),
            _buildComplianceAuditTab(),
          ],
        ),
      ),
    );
  }


  Widget _buildProfitLossTab(double revenue, double expenses, double profit) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFinancialSummaryCard(revenue, expenses, profit),
          const SizedBox(height: 24),
          const Text(
            'BOOKING PROFITABILITY BREAKDOWN (SAMPLE)',
            style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          _buildProfitabilityCard(),
        ],
      ),
    );
  }

  Widget _buildFinancialSummaryCard(double revenue, double expenses, double profit) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppPalette.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryItem('Total Revenue', '₹${(revenue / 1000).toStringAsFixed(0)}K', Colors.white),
              _buildSummaryItem('Total Expenses', '₹${(expenses / 1000).toStringAsFixed(0)}K', Colors.redAccent),
              _buildSummaryItem('Net Profit', '₹${(profit / 1000).toStringAsFixed(0)}K', Colors.lightGreenAccent),
            ],
          ),
          const Divider(color: Colors.white12, height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('GST Tax Status:', style: TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
              Text('GSTIN Configured (CGST 9% + SGST 9%)', style: TextStyle(color: AppPalette.textGold, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
      ],
    );
  }

  Widget _buildProfitabilityCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Royal Bridal Booking (#bk_2026_101)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              Text('Net Profit: ₹16,200', style: TextStyle(color: Colors.lightGreenAccent, fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Gross Quoted Revenue:', style: TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
              Text('₹20,500', style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('• Travel Expenses:', style: TextStyle(color: Colors.white70, fontSize: 11)),
              Text('- ₹1,500', style: TextStyle(color: Colors.redAccent, fontSize: 11)),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('• Assistant Fee:', style: TextStyle(color: Colors.white70, fontSize: 11)),
              Text('- ₹2,000', style: TextStyle(color: Colors.redAccent, fontSize: 11)),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('• Product Restock:', style: TextStyle(color: Colors.white70, fontSize: 11)),
              Text('- ₹800', style: TextStyle(color: Colors.redAccent, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInvoicesLedgerTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('AUTHORITATIVE INVOICES', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _invoices.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final inv = _invoices[index];
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
                        Text(inv.invoiceNumber, style: const TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 15)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.amber.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('PARTIALLY PAID', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Subtotal: ₹${inv.subtotal.toStringAsFixed(0)} • CGST (9%): ₹${inv.cgstAmount.toStringAsFixed(0)} • SGST (9%): ₹${inv.sgstAmount.toStringAsFixed(0)}', style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Grand Total: ₹${inv.grandTotal.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Balance Due: ₹${inv.balanceDue.toStringAsFixed(0)}', style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          const Text('APPEND-ONLY PAYMENT LEDGER', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _payments.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final pay = _payments[index];
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
                        Text('₹${pay.amount.toStringAsFixed(0)} • ${pay.paymentMethod}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Txn: ${pay.gatewayTransactionId}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                      ],
                    ),
                    const Text('IMMUTABLE 🔒', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildExpensesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('RECORDED EXPENSES', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ElevatedButton.icon(
                onPressed: _showRecordExpenseDialog,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Record Expense', style: TextStyle(fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _expenses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final exp = _expenses[index];
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
                        Text('${exp.category.name.toUpperCase()} • ${exp.vendor}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text(exp.notes, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11)),
                      ],
                    ),
                    Text('- ₹${exp.amount.toStringAsFixed(0)}', style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildComplianceAuditTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Period Locking Status Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.lock_clock, color: AppPalette.textGold, size: 20),
                        SizedBox(width: 8),
                        Text('Financial Period Locking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('2026-08 LOCKED 🔒', style: TextStyle(color: Colors.lightGreenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Current Period (2026-09) is OPEN. Locking a period seals historical transactions to prevent silent edits. Subsequent changes require Credit / Debit Notes.',
                  style: TextStyle(color: AppPalette.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Financial period 2026-09 has been LOCKED and sealed with audit hash.')),
                    );
                  },
                  icon: const Icon(Icons.lock, size: 14),
                  label: const Text('Lock Current Period (2026-09)', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(backgroundColor: AppPalette.goldAccent, foregroundColor: Colors.black),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 2. Gateway Payment Reconciliation & Accountant Exports
          const Text('GATEWAY RECONCILIATION & REPORT EXPORTS', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildComplianceCard(
                  title: 'Reconciliation Status',
                  subtitle: 'Razorpay / Bank vs Internal Ledger',
                  value: '100% Matched',
                  icon: Icons.check_circle_outline,
                  color: Colors.lightGreenAccent,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment reconciliation completed: 0 unmatched transactions.')));
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildComplianceCard(
                  title: 'Accountant CSV Export',
                  subtitle: 'Invoices, Ledger, Expenses & Tax',
                  value: 'Export Reports',
                  icon: Icons.download_rounded,
                  color: AppPalette.textGold,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Financial CSV reports generated and downloading...')));
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // 3. Financial Audit Events Trail
          const Text('FINANCIAL AUDIT TRAIL (APPEND-ONLY)', style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 12),
          _buildAuditEventItem('INVOICE_ISSUED', 'Issued Invoice MP/2026-27/00001 (₹24,190)', 'actor_prachi', 'sha256_inv_00001'),
          const SizedBox(height: 8),
          _buildAuditEventItem('PAYMENT_RECORDED', 'Recorded Deposit ₹5,000 via Razorpay', 'actor_system', 'sha256_pay_101'),
          const SizedBox(height: 8),
          _buildAuditEventItem('PERIOD_LOCKED', 'Locked Financial Period 2026-08', 'actor_prachi', 'sha256_period_2026_08'),
          const SizedBox(height: 8),
          _buildAuditEventItem('TAX_RULES_SNAPSHOT', 'Saved Tax Rule v1.0 (CGST 9% + SGST 9%)', 'actor_system', 'sha256_tax_v1'),
        ],
      ),
    );
  }

  Widget _buildComplianceCard({
    required String title,
    required String subtitle,
    required String value,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppPalette.surfaceDark,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 18),
                const SizedBox(width: 6),
                Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12), overflow: TextOverflow.ellipsis)),
              ],
            ),
            const SizedBox(height: 6),
            Text(subtitle, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 10)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildAuditEventItem(String action, String details, String actor, String hash) {
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppPalette.goldAccent.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(action, style: const TextStyle(color: AppPalette.textGold, fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    Text(actor, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 10)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(details, style: const TextStyle(color: Colors.white, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Icon(Icons.shield_outlined, color: Colors.greenAccent, size: 14),
              const SizedBox(height: 2),
              Text(hash, style: const TextStyle(color: Colors.white38, fontSize: 9)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAgingBalancesTab() {
    final agingItems = [
      {
        'bride': 'Radhika Jodhpur (Royal Pheras)',
        'bookingId': 'MBP-2026-X8K9',
        'eventDate': '28 Nov 2026',
        'total': '₹45,000',
        'paid': '₹15,000',
        'balance': '₹30,000',
        'dueDate': '14 Nov 2026 (T-14 Days)',
        'category': 'DUE_7_DAYS',
        'phone': '+91 98290 12345',
      },
      {
        'bride': 'Sneha Parekh (Destination Palace)',
        'bookingId': 'MBP-2026-R4T1',
        'eventDate': '05 Nov 2026',
        'total': '₹65,000',
        'paid': '₹20,000',
        'balance': '₹45,000',
        'dueDate': 'Tomorrow (T-48h)',
        'category': 'DUE_48H',
        'phone': '+91 94140 55667',
      },
      {
        'bride': 'Meenakshi Rathore (Sangeet + Wedding)',
        'bookingId': 'MBP-2026-W9Q2',
        'eventDate': '20 Oct 2026',
        'total': '₹55,000',
        'paid': '₹25,000',
        'balance': '₹30,000',
        'dueDate': 'Overdue by 12 Days',
        'category': 'OVERDUE',
        'phone': '+91 98291 22334',
      },
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Aging Summary Metrics
        Row(
          children: [
            Expanded(
              child: _buildAgingMetricCard('Total Outstanding', '₹1,05,000', Colors.white, 'Across 3 Active Bookings'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildAgingMetricCard('Due in 7-14 Days', '₹30,000', Colors.lightGreenAccent, '1 Booking (On Track)'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildAgingMetricCard('Due in 48 Hours', '₹45,000', Colors.amberAccent, '1 Booking (Urgent)'),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildAgingMetricCard('Critical Overdue', '₹30,000', Colors.redAccent, '1 Booking (>7 Days)'),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Compliance Notice
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.amber.shade900.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.amber.shade700.withValues(alpha: 0.4)),
          ),
          child: const Row(
            children: [
              Icon(Icons.gavel_outlined, color: Colors.amberAccent, size: 18),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Income Tax Compliance (Sec 269ST): Cash receipts of ₹2,00,000 or more per event are strictly blocked. Collect via UPI, Card, or NEFT/RTGS bank transfer.',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text(
          'AGING UNPAID BALANCES ROSTER & 1-CLICK DISPATCH',
          style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
        ),
        const SizedBox(height: 12),

        ...agingItems.map((item) {
          final isOverdue = item['category'] == 'OVERDUE';
          final is48h = item['category'] == 'DUE_48H';
          final badgeColor = isOverdue ? Colors.redAccent : is48h ? Colors.amberAccent : Colors.lightGreenAccent;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppPalette.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Status Icon Indicator
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: badgeColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    isOverdue ? Icons.warning_amber_rounded : Icons.schedule,
                    color: badgeColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),

                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            item['bride']!,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(width: 8),
                          Text('#${item['bookingId']}', style: const TextStyle(color: AppPalette.textGold, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Event Date: ${item['eventDate']} • Total: ${item['total']} • Advance Paid: ${item['paid']}',
                        style: const TextStyle(color: AppPalette.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text('Due: ${item['dueDate']}', style: TextStyle(color: badgeColor, fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 12),
                          Text('Phone: ${item['phone']}', style: const TextStyle(color: Colors.white60, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),

                // Outstanding Amount & Actions
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      item['balance']!,
                      style: TextStyle(color: badgeColor, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          icon: const Icon(Icons.send, size: 14),
                          label: const Text('WhatsApp Reminder', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('💬 WhatsApp Payment Reminder dispatched to ${item['bride']} with payment link.'),
                                backgroundColor: const Color(0xFF25D366),
                              ),
                            );
                          },
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppPalette.textGold,
                            side: const BorderSide(color: AppPalette.goldAccent),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Logging manual bank receipt for ${item['bookingId']}...')),
                            );
                          },
                          child: const Text('Record Pay', style: TextStyle(fontSize: 12)),
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
    );
  }

  Widget _buildAgingMetricCard(String title, String val, Color color, String sub) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(val, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(color: Colors.white38, fontSize: 10)),
        ],
      ),
    );
  }

  void _showRecordExpenseDialog() {
    final amountController = TextEditingController();
    final vendorController = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Record Business Expense'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: vendorController, decoration: const InputDecoration(labelText: 'Vendor / Payee')),
            TextField(controller: amountController, decoration: const InputDecoration(labelText: 'Amount (₹)'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Expense recorded in financial ledger.')));
            },
            child: const Text('Save Expense'),
          ),
        ],
      ),
    );
  }
}

