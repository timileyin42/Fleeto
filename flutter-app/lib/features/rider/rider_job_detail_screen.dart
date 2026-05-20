import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import '../../core/api_client.dart';
import '../../core/models/models.dart';
import '../../core/theme.dart';

class RiderJobDetailScreen extends StatefulWidget {
  final String jobId;
  const RiderJobDetailScreen({required this.jobId, super.key});
  @override
  State<RiderJobDetailScreen> createState() => _RiderJobDetailScreenState();
}

class _RiderJobDetailScreenState extends State<RiderJobDetailScreen> {
  Job? _job;
  bool _loading = true;
  bool _updating = false;
  bool _gpsActive = false;

  // GPS batching & battery optimisation
  StreamSubscription<Position>? _posStream;
  Timer? _batchTimer;
  Timer? _resumeTimer;
  Position? _latestPos;

  static const _nextStatus = {
    'assigned': ('Mark Picked Up', 'picked_up'),
    'picked_up': ('Start Delivery', 'in_transit'),
    'in_transit': ('Mark as Delivered', 'delivered'),
  };

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/jobs/${widget.jobId}');
      final job = Job.fromJson(r.data as Map<String, dynamic>);
      setState(() { _job = job; _loading = false; });
      if (job.status == 'picked_up' || job.status == 'in_transit') _startGps();
    } catch (_) { setState(() => _loading = false); }
  }

  void _startGps() async {
    if (_gpsActive) return;
    final perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) return;
    setState(() => _gpsActive = true);

    // Balanced-power accuracy — good enough for delivery tracking, spares battery
    _posStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.medium,
        distanceFilter: 20,
      ),
    ).listen((pos) {
      _latestPos = pos;

      // Still detection: speed < 0.5 m/s (~2 km/h) → pause stream for 30 s
      if ((pos.speed) < 0.5) {
        _posStream?.pause();
        _resumeTimer?.cancel();
        _resumeTimer = Timer(const Duration(seconds: 30), () => _posStream?.resume());
      }
    });

    // Batch flush: POST the latest position to the server every 60 s
    _batchTimer = Timer.periodic(const Duration(seconds: 60), (_) => _flushLocation());
    // Send the very first fix quickly so the map isn't blank
    Timer(const Duration(seconds: 5), _flushLocation);
  }

  Future<void> _flushLocation() async {
    final pos = _latestPos;
    if (pos == null) return;
    try {
      await ApiClient.dio.post(
        '/jobs/${widget.jobId}/location',
        queryParameters: {'lat': pos.latitude, 'lng': pos.longitude},
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    _posStream?.cancel();
    _batchTimer?.cancel();
    _resumeTimer?.cancel();
    super.dispose();
  }

  Future<void> _updateStatus(String next) async {
    setState(() => _updating = true);
    try {
      final r = await ApiClient.dio.patch('/jobs/${widget.jobId}/status', data: {'status': next});
      final job = Job.fromJson(r.data as Map<String, dynamic>);
      setState(() { _job = job; _updating = false; });
      if (job.status == 'picked_up' || job.status == 'in_transit') _startGps();
    } catch (_) { setState(() => _updating = false); }
  }

  @override
  Widget build(BuildContext context) {
    final job = _job;
    final next = job != null ? _nextStatus[job.status] : null;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [IconButton(icon: const Icon(Icons.more_vert), onPressed: () {})],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : job == null
              ? const Center(child: Text('Job not found'))
              : Column(children: [
                  Expanded(child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      // GPS indicator
                      if (_gpsActive)
                        Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.green.shade200),
                          ),
                          child: Row(children: [
                            Container(width: 8, height: 8,
                              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF4CAF50))),
                            const SizedBox(width: 8),
                            const Text('Live location sharing — keep this screen open',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF2E7D32))),
                          ]),
                        ),

                      Row(children: [
                        Text('Job #${job.id.substring(0, 6).toUpperCase()}',
                          style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant,
                            fontWeight: FontWeight.w600, letterSpacing: 1.2)),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.statusColor(job.status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(AppColors.statusLabel(job.status),
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                              color: AppColors.statusColor(job.status))),
                        ),
                      ]),
                      const SizedBox(height: 4),
                      const Text('Route Active',
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                      const SizedBox(height: 20),

                      // Route card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 3),
                              child: Icon(Icons.trip_origin, size: 14, color: AppColors.onSurfaceVariant),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(
                                job.status == 'in_transit' ? 'PICKUP COMPLETED' : 'PICKUP LOCATION',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                                  color: AppColors.onSurfaceVariant, letterSpacing: 1),
                              ),
                              Text(job.pickupAddress,
                                style: TextStyle(
                                  fontSize: 14,
                                  decoration: job.status == 'in_transit' ? TextDecoration.lineThrough : null,
                                  color: AppColors.onSurfaceVariant,
                                )),
                            ])),
                          ]),
                          const Padding(
                            padding: EdgeInsets.only(left: 6, top: 8, bottom: 8),
                            child: SizedBox(height: 16,
                              child: VerticalDivider(width: 2, color: AppColors.border)),
                          ),
                          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 3),
                              child: Icon(Icons.location_on, size: 14, color: AppColors.onSurface),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              const Text('CURRENT DESTINATION',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                                  color: AppColors.onSurface, letterSpacing: 1)),
                              Text(job.dropoffAddress,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                              if (job.customerPhone != null)
                                TextButton.icon(
                                  onPressed: () {},
                                  icon: const Icon(Icons.phone_outlined, size: 14),
                                  label: const Text('Contact Receiver', style: TextStyle(fontSize: 12)),
                                  style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    foregroundColor: AppColors.onSurfaceVariant,
                                  ),
                                ),
                            ])),
                          ]),
                        ]),
                      ),
                      const SizedBox(height: 16),

                      // Parcel info
                      if (job.parcelDescription != null)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(8)),
                              child: const Icon(Icons.inventory_2_outlined, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              const Text('PAYLOAD', style: TextStyle(fontSize: 10,
                                fontWeight: FontWeight.w700, color: AppColors.onSurfaceVariant)),
                              Text(job.parcelDescription!,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                            ]),
                            const Spacer(),
                            if (job.customerName != null)
                              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                const Text('CUSTOMER', style: TextStyle(fontSize: 10,
                                  fontWeight: FontWeight.w700, color: AppColors.onSurfaceVariant)),
                                Text(job.customerName!,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              ]),
                          ]),
                        ),
                    ]),
                  )),

                  // Bottom action button
                  if (next != null)
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
                      decoration: const BoxDecoration(
                        color: AppColors.surface,
                        border: Border(top: BorderSide(color: AppColors.border)),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: _updating ? null : () => _updateStatus(next.$2),
                        icon: _updating
                            ? const SizedBox(width: 16, height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.check_rounded, size: 18),
                        label: Text(next.$1),
                      ),
                    ),
                ]),
    );
  }
}
