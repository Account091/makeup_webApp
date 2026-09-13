import 'package:flutter/material.dart';

class AiContentDrafterScreen extends StatefulWidget {
  const AiContentDrafterScreen({super.key});

  @override
  State<AiContentDrafterScreen> createState() => _AiContentDrafterScreenState();
}

class _AiContentDrafterScreenState extends State<AiContentDrafterScreen> {
  final TextEditingController _topicController =
      TextEditingController(text: 'Signature Royal Bridal HD Airbrush Transformation');
  final TextEditingController _keywordsController =
      TextEditingController(text: 'Jaipur Bride, Royal Poshak, Glass Skin');

  String _selectedType = 'INSTAGRAM_POST';
  String _selectedService = 'royal-bridal';
  String _selectedRole = 'CONTENT_MANAGER';

  bool _loading = false;
  Map<String, dynamic>? _generatedDraft;
  String _status = 'DRAFT';

  void _handleGenerate() {
    if (_topicController.text.trim().isEmpty || _loading) return;

    setState(() {
      _loading = true;
      _status = 'AI_GENERATED';
    });

    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _generatedDraft = {
          'title': 'Signature Royal Bridal Artistry in Jaipur ✨',
          'caption':
              '✨ Step into timeless royal elegance with our Signature Royal Bridal Makeover in Jaipur.\n\nCrafted by Prachi with sweat-proof 16-hour HD Airbrushing, bespoke lash extension design, and traditional Poshak & Dupatta setting for palace weddings.\n\n📍 Destinations covered: Jaipur • Jodhpur • Udaipur • Jaisalmer\n\n💬 Inquire via DM or WhatsApp to reserve your bridal date!',
          'hashtags': ['#MakeoversByPrachi', '#JaipurBride', '#RoyalBridalMakeover', '#DestinationWeddingIndia'],
          'seoTitle': 'Royal Bridal Makeup Jaipur | Makeovers by Prachi',
          'seoDescription':
              'Book Signature Royal Bridal & HD Airbrush Makeover by Prachi in Jaipur, Jodhpur & Udaipur.',
          'callToAction': 'Book your bridal consultation date via WhatsApp',
          'requiresHumanApproval': true,
        };
      });
    });
  }

  void _handleApprove() {
    setState(() {
      _status = 'APPROVED';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Draft approved! Saved to contentDrafts with V1.4 contentAttribution metadata.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const goldPrimary = Color(0xFFD4AF37);
    const darkBg = Color(0xFF0C0C10);
    const cardBg = Color(0xFF161620);

    return Scaffold(
      backgroundColor: darkBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF14121A),
        elevation: 2,
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: goldPrimary, size: 20),
            SizedBox(width: 8),
            Text(
              'AI Content Drafter V5.3',
              style: TextStyle(
                color: Color(0xFFF3E5AB),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: DropdownButton<String>(
              value: _selectedRole,
              dropdownColor: cardBg,
              style: const TextStyle(color: goldPrimary, fontSize: 12, fontWeight: FontWeight.bold),
              underline: const SizedBox(),
              items: ['CONTENT_MANAGER', 'ADMIN', 'MANAGER'].map((r) {
                return DropdownMenuItem(value: r, child: Text('Role: $r'));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedRole = val);
              },
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Controls Card
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: goldPrimary.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Content Generation Setup',
                    style: TextStyle(color: Color(0xFFF3E5AB), fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Content Type', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 4),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedType,
                              dropdownColor: cardBg,
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: _inputDecoration(),
                              items: const [
                                DropdownMenuItem(value: 'INSTAGRAM_POST', child: Text('Instagram Post')),
                                DropdownMenuItem(value: 'INSTAGRAM_REEL', child: Text('Instagram Reel Script')),
                                DropdownMenuItem(value: 'WHATSAPP', child: Text('WhatsApp Promotion')),
                                DropdownMenuItem(value: 'WEBSITE', child: Text('Website Hero Copy')),
                                DropdownMenuItem(value: 'SEO', child: Text('SEO Meta Copy')),
                                DropdownMenuItem(value: 'BLOG', child: Text('Bridal Blog Article')),
                              ],
                              onChanged: (v) => setState(() => _selectedType = v!),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Target Service', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 4),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedService,
                              dropdownColor: cardBg,
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: _inputDecoration(),
                              items: const [
                                DropdownMenuItem(value: 'royal-bridal', child: Text('Royal Bridal Makeover')),
                                DropdownMenuItem(value: 'engagement', child: Text('Pre-Wedding & Engagement')),
                                DropdownMenuItem(value: 'party', child: Text('Party & Festive Makeover')),
                                DropdownMenuItem(value: 'destination', child: Text('Destination Package')),
                              ],
                              onChanged: (v) => setState(() => _selectedService = v!),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('Topic / Headline Focus', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _topicController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: _inputDecoration(),
                  ),
                  const SizedBox(height: 12),
                  const Text('Keywords', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _keywordsController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: _inputDecoration(),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _handleGenerate,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: goldPrimary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                      icon: _loading
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                            )
                          : const Icon(Icons.auto_awesome_rounded, size: 18),
                      label: Text(
                        _loading ? 'Drafting AI Copy...' : 'Generate AI Content Draft ✨',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Draft Workstation Output Box
            if (_generatedDraft != null) ...[
              Container(
                padding: const EdgeInsets.all(18.0),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'AI DRAFT WORKSTATION',
                          style: TextStyle(color: goldPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _status == 'APPROVED' ? Colors.green.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _status == 'APPROVED' ? Colors.green : Colors.amber,
                            ),
                          ),
                          child: Text(
                            _status == 'APPROVED' ? 'APPROVED' : 'REQUIRES ADMIN APPROVAL',
                            style: TextStyle(
                              color: _status == 'APPROVED' ? Colors.greenAccent : Colors.amberAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _generatedDraft!['title'] ?? '',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Text(
                        _generatedDraft!['caption'] ?? '',
                        style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.6),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: (_generatedDraft!['hashtags'] as List).map((tag) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: goldPrimary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: goldPrimary.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            tag.toString(),
                            style: const TextStyle(color: Color(0xFFF3E5AB), fontSize: 11),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: _handleApprove,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.check_circle_outline, size: 16),
                          label: const Text('Approve & Save Draft'),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton.icon(
                          onPressed: _handleGenerate,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: goldPrimary,
                            side: const BorderSide(color: goldPrimary),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Regenerate'),
                        ),
                      ],
                    ),
                  ],
                ),
              )
            ],
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.05),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
      ),
    );
  }
}
