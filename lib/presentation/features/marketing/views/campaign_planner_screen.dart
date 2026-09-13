import 'package:flutter/material.dart';

class CampaignPlannerScreen extends StatefulWidget {
  const CampaignPlannerScreen({super.key});

  @override
  State<CampaignPlannerScreen> createState() => _CampaignPlannerScreenState();
}

class _CampaignPlannerScreenState extends State<CampaignPlannerScreen> {
  final _formKey = GlobalKey<FormState>();
  String _goal = 'Book 10 Destination Bridal Packages';
  String _city = 'Jaipur';
  String _service = 'Royal Bridal Makeup';
  double _budget = 30000;
  bool _isGenerating = false;
  String? _generatedCopy;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎯 AI Campaign Planner'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Plan New Marketing Campaign',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: _goal,
                decoration: const InputDecoration(labelText: 'Campaign Goal'),
                onSaved: (val) => _goal = val ?? _goal,
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: _city,
                decoration: const InputDecoration(labelText: 'Target Location / City'),
                onSaved: (val) => _city = val ?? _city,
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: _service,
                decoration: const InputDecoration(labelText: 'Target Service Package'),
                onSaved: (val) => _service = val ?? _service,
              ),
              const SizedBox(height: 12),
              TextFormField(
                initialValue: _budget.toStringAsFixed(0),
                decoration: const InputDecoration(labelText: 'Allocated Budget (₹)'),
                keyboardType: TextInputType.number,
                onSaved: (val) => _budget = double.tryParse(val ?? '') ?? _budget,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.auto_awesome),
                  label: Text(_isGenerating ? 'Generating Draft...' : 'Generate Campaign Draft'),
                  onPressed: _isGenerating ? null : _generateDraft,
                ),
              ),
              if (_generatedCopy != null) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.shade300),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Generated Campaign Brief (Draft)',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                      const SizedBox(height: 8),
                      Text(_generatedCopy!),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _generateDraft() {
    _formKey.currentState?.save();
    setState(() {
      _isGenerating = true;
    });

    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        _isGenerating = false;
        _generatedCopy =
            '✨ Step into your royal wedding day with timeless elegance. Book your $_service with Makeovers by Prachi in $_city. Targeted Leads: ${( _budget / 350 ).round()} | Target ROAS: 10.0x';
      });
    });
  }
}
