import 'package:flutter/material.dart';
import '../../../../core/theme/app_palette.dart';
import '../../../../domain/entities/digital_document_entity.dart';

class DocumentsCenterScreen extends StatefulWidget {
  const DocumentsCenterScreen({super.key});

  @override
  State<DocumentsCenterScreen> createState() => _DocumentsCenterScreenState();
}

class _DocumentsCenterScreenState extends State<DocumentsCenterScreen> {
  bool _termsAccepted = false;
  bool _cancellationAccepted = false;
  bool _travelTermsAccepted = false;
  bool _isContractSigned = false;

  final List<DigitalDocumentEntity> _documents = [
    DigitalDocumentEntity(
      id: 'doc_quote_101',
      bookingId: 'bk_2026_101',
      customerId: 'cust_987',
      documentType: DocumentType.quote,
      version: 1,
      documentHash: 'sha256_8849f1a204b',
      storagePath: 'private_documents/doc_quote_101.pdf',
      status: DocumentStatus.accepted,
      createdAt: DateTime.parse('2026-09-12 11:15:00'),
    ),
    DigitalDocumentEntity(
      id: 'doc_agree_101',
      bookingId: 'bk_2026_101',
      customerId: 'cust_987',
      documentType: DocumentType.serviceAgreement,
      version: 1,
      documentHash: 'sha256_e9471ab9102',
      storagePath: 'private_documents/doc_agree_101.pdf',
      policyVersion: 'v1.0',
      status: DocumentStatus.pendingAcceptance,
      createdAt: DateTime.parse('2026-09-12 11:20:00'),
    ),
    DigitalDocumentEntity(
      id: 'doc_receipt_101',
      bookingId: 'bk_2026_101',
      customerId: 'cust_987',
      documentType: DocumentType.depositReceipt,
      version: 1,
      documentHash: 'sha256_9941a8772bb',
      storagePath: 'private_documents/doc_receipt_101.pdf',
      status: DocumentStatus.accepted,
      acceptedAt: DateTime.parse('2026-09-13 09:12:00'),
      acceptedBy: 'Razorpay Payment Gateway (Txn: pay_98127)',
      createdAt: DateTime.parse('2026-09-13 09:12:00'),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.backgroundDark,
      appBar: AppBar(
        title: const Text(
          'Contracts & Digital Documents',
          style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppPalette.surfaceDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildContractStatusCard(),
            const SizedBox(height: 20),
            const Text(
              'OFFICIAL BOOKING DOCUMENTS',
              style: TextStyle(color: AppPalette.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _documents.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) => _buildDocumentTile(_documents[index]),
            ),
            const SizedBox(height: 20),
            if (!_isContractSigned)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _showContractAcceptanceModal,
                  icon: const Icon(Icons.assignment_turned_in, size: 18),
                  label: const Text('Review & Sign Digital Service Agreement'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppPalette.goldAccent,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildContractStatusCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppPalette.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _isContractSigned ? Colors.lightGreenAccent : AppPalette.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'SERVICE AGREEMENT STATUS',
                style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 12),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _isContractSigned ? Colors.green.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _isContractSigned ? 'ACCEPTED & IMMUTABLE ✅' : 'PENDING ACCEPTANCE',
                  style: TextStyle(color: _isContractSigned ? Colors.greenAccent : Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _isContractSigned
                ? 'Digital Service Agreement v1 & Cancellation Policy v1.0 accepted. Immutable hash recorded.'
                : 'Please review and digitally accept the Service Agreement & Cancellation Policy to finalize booking.',
            style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentTile(DigitalDocumentEntity doc) {
    String typeLabel = doc.documentType.name.toUpperCase();
    IconData icon = Icons.description_outlined;

    if (doc.documentType == DocumentType.quote) {
      typeLabel = 'OFFICIAL QUOTE PDF';
      icon = Icons.request_quote;
    } else if (doc.documentType == DocumentType.serviceAgreement) {
      typeLabel = 'SERVICE AGREEMENT (V${doc.version})';
      icon = Icons.gavel;
    } else if (doc.documentType == DocumentType.depositReceipt) {
      typeLabel = 'DEPOSIT RECEIPT';
      icon = Icons.receipt_long;
    }

    return Container(
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: AppPalette.textGold, size: 20),
                  const SizedBox(width: 10),
                  Text(typeLabel, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              OutlinedButton.icon(
                onPressed: () => _downloadSecureDocument(doc),
                icon: const Icon(Icons.download, size: 14, color: AppPalette.textGold),
                label: const Text('Download PDF', style: TextStyle(color: AppPalette.textGold, fontSize: 11)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppPalette.goldAccent), visualDensity: VisualDensity.compact),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text('Hash: ${doc.documentHash}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
        ],
      ),
    );
  }

  void _downloadSecureDocument(DigitalDocumentEntity doc) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Generating short-lived secure download link for ${doc.documentType.name}...')),
    );
  }

  void _showContractAcceptanceModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppPalette.surfaceDark,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Digital Service Agreement Review', style: TextStyle(color: AppPalette.textGold, fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 10),
                  const Text(
                    'Makeovers by Prachi — Service Agreement Terms & Cancellation Policy v1.0:\n'
                    '• Advance deposit (25%) is non-refundable upon cancellation within 14 days of event.\n'
                    '• Ready-by time guarantees artist arrival 60 mins prior to function start.\n'
                    '• Outstation stay & travel allowances billed as per quoted commercials.',
                    style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  CheckboxListTile(
                    title: const Text('I agree to the Service Agreement Terms', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _termsAccepted,
                    activeColor: AppPalette.goldAccent,
                    checkColor: Colors.black,
                    onChanged: (val) => setModalState(() => _termsAccepted = val ?? false),
                  ),
                  CheckboxListTile(
                    title: const Text('I agree to Cancellation Policy v1.0', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _cancellationAccepted,
                    activeColor: AppPalette.goldAccent,
                    checkColor: Colors.black,
                    onChanged: (val) => setModalState(() => _cancellationAccepted = val ?? false),
                  ),
                  CheckboxListTile(
                    title: const Text('I accept Outstation Travel & Stay Terms', style: TextStyle(color: Colors.white, fontSize: 12)),
                    value: _travelTermsAccepted,
                    activeColor: AppPalette.goldAccent,
                    checkColor: Colors.black,
                    onChanged: (val) => setModalState(() => _travelTermsAccepted = val ?? false),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (_termsAccepted && _cancellationAccepted)
                          ? () {
                              setState(() => _isContractSigned = true);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Service Agreement accepted. Immutable SHA-256 hash recorded.')),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppPalette.goldAccent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Accept & Confirm Contract'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
