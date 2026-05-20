import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_client.dart';
import '../../core/models/models.dart';
import '../../core/theme.dart';

class RiderJobsScreen extends StatefulWidget {
  const RiderJobsScreen({super.key});
  @override
  State<RiderJobsScreen> createState() => _RiderJobsScreenState();
}

class _RiderJobsScreenState extends State<RiderJobsScreen> {
  List<Job> _jobs = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/jobs/rider/mine');
      setState(() {
        _jobs = (r.data as List).map((j) => Job.fromJson(j as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  Job? get _activeJob => _jobs.where((j) =>
    j.status == 'in_transit' || j.status == 'picked_up').firstOrNull;

  List<Job> get _queuedJobs => _jobs.where((j) => j.status == 'assigned').toList();

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.background,
    appBar: AppBar(
      title: const Text('FLEETO', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5)),
      centerTitle: false,
      actions: [
        IconButton(icon: const Icon(Icons.notifications_none_rounded), onPressed: () {}),
        IconButton(icon: const Icon(Icons.help_outline_rounded), onPressed: () {}),
      ],
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _load,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                const Text("Today's Route",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                Text('${_jobs.length} Jobs Remaining • ${_activeJob != null ? '1 Active' : 'None Active'}',
                  style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant)),
                const SizedBox(height: 20),

                // Active job card
                if (_activeJob != null) ...[
                  _ActiveJobCard(job: _activeJob!),
                  const SizedBox(height: 24),
                ],

                // Queued
                if (_queuedJobs.isNotEmpty) ...[
                  const Row(children: [
                    Icon(Icons.queue_outlined, size: 18, color: AppColors.onSurface),
                    SizedBox(width: 8),
                    Text('Queued', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  ]),
                  const SizedBox(height: 10),
                  ..._queuedJobs.map((j) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _QueuedJobTile(job: j),
                  )),
                ],

                if (_jobs.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.only(top: 60),
                      child: Column(children: [
                        Icon(Icons.check_circle_outline, size: 48, color: AppColors.onSurfaceVariant),
                        SizedBox(height: 12),
                        Text("All done for today!", style: TextStyle(color: AppColors.onSurfaceVariant, fontSize: 16)),
                      ]),
                    ),
                  ),
              ],
            ),
          ),
  );
}

class _ActiveJobCard extends StatelessWidget {
  final Job job;
  const _ActiveJobCard({required this.job});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () => context.push('/rider/job/${job.id}'),
    child: Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Status bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.statusColor(job.status).withValues(alpha: 0.1),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Row(children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(
              shape: BoxShape.circle, color: AppColors.statusColor(job.status))),
            const SizedBox(width: 8),
            Text(AppColors.statusLabel(job.status).toUpperCase(),
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                color: AppColors.statusColor(job.status), letterSpacing: 0.8)),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Job #${job.id.substring(0, 4).toUpperCase()}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [
                  Icon(Icons.access_time, size: 12, color: AppColors.onSurfaceVariant),
                  SizedBox(width: 4),
                  Text('ETA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                ]),
              ),
            ]),
            if (job.parcelDescription != null)
              Text(job.parcelDescription!, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 16),
            // Pickup (done)
            Row(children: [
              Container(width: 10, height: 10, decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: job.status == 'in_transit' ? AppColors.onSurfaceVariant : AppColors.border,
              )),
              const SizedBox(width: 10),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(job.status == 'in_transit' ? 'Pickup (Completed)' : 'Pickup',
                  style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                Text(job.pickupAddress,
                  style: TextStyle(
                    fontSize: 13,
                    decoration: job.status == 'in_transit' ? TextDecoration.lineThrough : null,
                    color: AppColors.onSurfaceVariant,
                  )),
              ]),
            ]),
            const SizedBox(height: 10),
            // Dropoff
            Row(children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(
                shape: BoxShape.circle, color: Color(0xFFF5A623))),
              const SizedBox(width: 10),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Current Destination',
                  style: TextStyle(fontSize: 11, color: Color(0xFFF5A623), fontWeight: FontWeight.w600)),
                Text(job.dropoffAddress,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
              ]),
            ]),
            const SizedBox(height: 16),
            // Actions
            Row(children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: job.customerPhone != null
                      ? () => launchUrl(Uri(scheme: 'tel', path: job.customerPhone!))
                      : null,
                  icon: const Icon(Icons.phone_outlined, size: 16),
                  label: const Text('Contact'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.onSurface,
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/rider/job/${job.id}'),
                  icon: const Icon(Icons.navigation_outlined, size: 16),
                  label: const Text('Navigate'),
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ]),
          ]),
        ),
      ]),
    ),
  );
}

class _QueuedJobTile extends StatelessWidget {
  final Job job;
  const _QueuedJobTile({required this.job});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () => context.push('/rider/job/${job.id}'),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text('Job #${job.id.substring(0, 4).toUpperCase()}',
              style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
            const SizedBox(width: 8),
            const Text('Standard', style: TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
          ]),
          Text(job.dropoffAddress,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          Row(children: [
            const Icon(Icons.trip_origin, size: 12, color: AppColors.onSurfaceVariant),
            const SizedBox(width: 4),
            Flexible(child: Text(
              'From: ${job.pickupAddress}',
              style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant),
              overflow: TextOverflow.ellipsis,
            )),
          ]),
        ]),
        const Spacer(),
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.border)),
          child: const Icon(Icons.arrow_forward, size: 16),
        ),
      ]),
    ),
  );
}
