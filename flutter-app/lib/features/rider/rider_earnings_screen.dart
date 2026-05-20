import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';

class RiderEarningsScreen extends StatefulWidget {
  const RiderEarningsScreen({super.key});
  @override
  State<RiderEarningsScreen> createState() => _RiderEarningsScreenState();
}

class _RiderEarningsScreenState extends State<RiderEarningsScreen> {
  int? _totalJobs;
  double? _completionRate;
  bool _loading = true;
  String _error = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/riders/me/stats');
      setState(() {
        _totalJobs = r.data['total_jobs'] as int? ?? 0;
        _completionRate = (r.data['completion_rate'] as num?)?.toDouble() ?? 0.0;
        _loading = false;
      });
    } catch (_) {
      setState(() { _error = 'Could not load stats.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.background,
    appBar: AppBar(
      title: const Text('FLEETO', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5)),
      centerTitle: false,
    ),
    body: RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Performance',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          const Text('Your delivery stats and rankings.',
            style: TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 24),
          if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (_error.isNotEmpty)
            Center(child: Text(_error, style: const TextStyle(color: AppColors.onSurfaceVariant)))
          else ...[
            _statCard('Total Deliveries', '$_totalJobs', Icons.local_shipping_outlined),
            const SizedBox(height: 12),
            _statCard(
              'Completion Rate',
              _totalJobs == 0 ? 'N/A' : '${_completionRate!.toStringAsFixed(1)}%',
              Icons.check_circle_outline_rounded,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('EFFICIENCY SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant, letterSpacing: 1.5)),
                const SizedBox(height: 8),
                Text(
                  _totalJobs == 0
                    ? '—'
                    : (_completionRate! >= 95 ? 'A' : _completionRate! >= 80 ? 'B' : _completionRate! >= 65 ? 'C' : 'D'),
                  style: TextStyle(
                    fontSize: 40, fontWeight: FontWeight.w900,
                    color: _completionRate == null ? AppColors.onSurfaceVariant
                      : _completionRate! >= 95 ? const Color(0xFF4CAF50)
                      : _completionRate! >= 80 ? AppColors.primary
                      : const Color(0xFFF5A623),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _totalJobs == 0
                    ? 'Complete your first job to build your score.'
                    : 'Based on $_totalJobs completed deliveries.',
                  style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
                ),
              ]),
            ),
          ],
        ],
      ),
    ),
  );

  Widget _statCard(String label, String value, IconData icon) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.border),
    ),
    child: Row(children: [
      Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 22, color: AppColors.onSurface),
      ),
      const SizedBox(width: 14),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant,
          fontWeight: FontWeight.w500)),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
      ]),
    ]),
  );
}
