import 'package:flutter/material.dart';

class MarketplaceRankingSettingsScreen extends StatefulWidget {
  const MarketplaceRankingSettingsScreen({super.key});

  @override
  State<MarketplaceRankingSettingsScreen> createState() => _MarketplaceRankingSettingsScreenState();
}

class _MarketplaceRankingSettingsScreenState extends State<MarketplaceRankingSettingsScreen> {
  bool _isSaving = false;

  double _relevanceWeight = 0.30;
  double _availabilityWeight = 0.20;
  double _trustWeight = 0.15;
  double _ratingWeight = 0.15;
  double _responseWeight = 0.08;
  double _completionWeight = 0.07;
  double _locationWeight = 0.05;

  double get _totalWeight =>
      _relevanceWeight +
      _availabilityWeight +
      _trustWeight +
      _ratingWeight +
      _responseWeight +
      _completionWeight +
      _locationWeight;

  @override
  Widget build(BuildContext context) {
    final isWeightValid = (_totalWeight - 1.0).abs() < 0.001;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text(
          'Ranking Rules & Weights Console',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isWeightValid
                    ? const Color(0xFF065F46).withValues(alpha: 0.3)
                    : const Color(0xFF991B1B).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isWeightValid ? const Color(0xFF10B981) : Colors.red,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isWeightValid ? 'Weight Allocation Valid (100%)' : 'Weight Allocation Invalid!',
                    style: TextStyle(
                      color: isWeightValid ? const Color(0xFF34D399) : Colors.redAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    '${(_totalWeight * 100).toStringAsFixed(1)}% / 100%',
                    style: TextStyle(
                      color: isWeightValid ? const Color(0xFF34D399) : Colors.redAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Ranking Model Component Weights',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            _buildWeightSlider('Relevance Match', _relevanceWeight, (v) => setState(() => _relevanceWeight = v)),
            _buildWeightSlider('Calendar Availability', _availabilityWeight, (v) => setState(() => _availabilityWeight = v)),
            _buildWeightSlider('Trust & Verification', _trustWeight, (v) => setState(() => _trustWeight = v)),
            _buildWeightSlider('Bayesian Rating', _ratingWeight, (v) => setState(() => _ratingWeight = v)),
            _buildWeightSlider('Response Speed', _responseWeight, (v) => setState(() => _responseWeight = v)),
            _buildWeightSlider('Completion Rate', _completionWeight, (v) => setState(() => _completionWeight = v)),
            _buildWeightSlider('Location Match', _locationWeight, (v) => setState(() => _locationWeight = v)),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: (!isWeightValid || _isSaving)
                    ? null
                    : () {
                        final messenger = ScaffoldMessenger.of(context);
                        setState(() => _isSaving = true);
                        Future.delayed(const Duration(milliseconds: 600), () {
                          if (mounted) {
                            setState(() => _isSaving = false);
                            messenger.showSnackBar(
                              const SnackBar(content: Text('New Ranking Rule Version deployed successfully!')),
                            );
                          }
                        });
                      },

                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text(
                        'Deploy Ranking Config Version',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeightSlider(String label, double val, ValueChanged<double> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              Text('${(val * 100).toStringAsFixed(0)}%', style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold)),
            ],
          ),
          Slider(
            value: val,
            min: 0.0,
            max: 0.5,
            divisions: 50,
            activeColor: const Color(0xFF4F46E5),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
