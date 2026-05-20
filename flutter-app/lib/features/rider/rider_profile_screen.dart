import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class RiderProfileScreen extends StatefulWidget {
  const RiderProfileScreen({super.key});
  @override
  State<RiderProfileScreen> createState() => _RiderProfileScreenState();
}

class _RiderProfileScreenState extends State<RiderProfileScreen> {
  int? _totalJobs;
  double? _completionRate;

  @override
  void initState() { super.initState(); _loadStats(); }

  Future<void> _loadStats() async {
    try {
      final r = await ApiClient.dio.get('/riders/me/stats');
      if (mounted) {
        setState(() {
          _totalJobs = r.data['total_jobs'] as int? ?? 0;
          _completionRate = (r.data['completion_rate'] as num?)?.toDouble() ?? 0.0;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final rider = context.watch<AuthProvider>().rider;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Rider Portal', style: TextStyle(fontWeight: FontWeight.w700)),
        centerTitle: false,
        actions: [
          IconButton(icon: const Icon(Icons.notifications_none_rounded), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile header
          Center(
            child: Column(children: [
              Stack(children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: AppColors.surfaceVariant,
                  backgroundImage: rider?.profilePictureUrl != null
                      ? NetworkImage(rider!.profilePictureUrl!) : null,
                  child: rider?.profilePictureUrl == null
                      ? Text(
                          rider?.name.isNotEmpty == true ? rider!.name[0].toUpperCase() : 'R',
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700),
                        )
                      : null,
                ),
                Positioned(
                  bottom: 0, right: 0,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF4CAF50),
                      border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 2)),
                    ),
                  ),
                ),
              ]),
              const SizedBox(height: 12),
              Text(rider?.name ?? 'Rider',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              const Text('ACTIVE', style: TextStyle(fontSize: 11, color: Color(0xFF4CAF50),
                fontWeight: FontWeight.w700, letterSpacing: 1)),
              Text('Terminal ID: R-${rider?.id.substring(0, 5).toUpperCase() ?? '-----'}',
                style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant,
                  fontFamily: 'monospace')),
            ]),
          ),
          const SizedBox(height: 24),

          // Stats
          Row(children: [
            _StatCard(
              label: 'TOTAL JOBS',
              value: _totalJobs != null ? '$_totalJobs' : '—',
              trend: null,
            ),
            const SizedBox(width: 12),
            _StatCard(
              label: 'COMPLETION',
              value: _completionRate != null && _totalJobs != 0
                  ? '${_completionRate!.toStringAsFixed(1)}%'
                  : '—%',
              trend: null,
            ),
          ]),
          const SizedBox(height: 20),

          // Support links
          const Text('OPERATIONS & SUPPORT',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
              color: AppColors.onSurfaceVariant, letterSpacing: 1.5)),
          const SizedBox(height: 10),
          Material(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            clipBehavior: Clip.antiAlias,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(children: [
                _tile(Icons.directions_car_outlined, 'Vehicle Status', 'Maintenance check', () {}),
                const Divider(height: 1, color: AppColors.border),
                _tile(Icons.description_outlined, 'Documents', 'License, insurance & permits', () {}),
                const Divider(height: 1, color: AppColors.border),
                _tile(Icons.support_agent_outlined, 'Support', 'Direct line to Operations', () {}),
              ]),
            ),
          ),
          const SizedBox(height: 20),

          // Logout
          GestureDetector(
            onTap: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) context.go('/login');
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.logout_rounded, size: 18, color: Colors.red.shade600),
                const SizedBox(width: 8),
                Text('LOGOUT TERMINAL',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14,
                    color: Colors.red.shade600, letterSpacing: 0.8)),
              ]),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _tile(IconData icon, String title, String subtitle, VoidCallback onTap) =>
    ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, size: 18, color: AppColors.onSurface),
      ),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
      trailing: const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant),
      onTap: onTap,
    );
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final String? trend;
  const _StatCard({required this.label, required this.value, this.trend});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
          color: AppColors.onSurfaceVariant, letterSpacing: 1)),
        const SizedBox(height: 6),
        Row(children: [
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          if (trend != null) ...[
            const SizedBox(width: 6),
            Text(trend!, style: const TextStyle(fontSize: 13, color: Color(0xFF4CAF50),
              fontWeight: FontWeight.w600)),
          ],
        ]),
      ]),
    ),
  );
}
