import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_client.dart';
import '../../core/auth_provider.dart';
import '../../core/theme.dart';

class OperatorAccountScreen extends StatelessWidget {
  const OperatorAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final op = context.watch<AuthProvider>().operator;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: const Padding(padding: EdgeInsets.all(12), child: Icon(Icons.local_shipping_outlined, size: 22)),
        title: const Text('Delivra'),
        actions: [IconButton(icon: const Icon(Icons.notifications_none_rounded), onPressed: () {})],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile card
          Center(child: Column(children: [
            CircleAvatar(
              radius: 44,
              backgroundColor: AppColors.surfaceVariant,
              child: Text(
                op?.name.isNotEmpty == true ? op!.name[0].toUpperCase() : 'O',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 12),
            Text(op?.name ?? 'Operator',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            Text(op?.email ?? '',
              style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 4),
            Text('TERMINAL ID: OP-${op?.id.toString().substring(0, 4).toUpperCase() ?? '----'}',
              style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant,
                fontFamily: 'monospace', letterSpacing: 1.2)),
          ])),
          const SizedBox(height: 28),

          // Settings list
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
                _tile(context, Icons.business_outlined, 'Business Details',
                  'Edit your name & profile', () => _showBusinessDetails(context, op?.name ?? '')),
                const Divider(height: 1, color: AppColors.border),
                _tile(context, Icons.notifications_outlined, 'Notifications',
                  'Manage alerts & push settings', () => _showNotifications(context)),
                const Divider(height: 1, color: AppColors.border),
                _tile(context, Icons.lock_outline_rounded, 'Security',
                  'Password & account security', () => _showSecurity(context, op?.email ?? '')),
                const Divider(height: 1, color: AppColors.border),
                _tile(context, Icons.receipt_long_outlined, 'Billing History',
                  'Plan & payment history', () => _showBilling(context)),
                const Divider(height: 1, color: AppColors.border),
                _tile(context, Icons.support_agent_outlined, 'Support',
                  'Get help from our team', () => _showSupport(context)),
              ]),
            ),
          ),
          const SizedBox(height: 24),

          // Sign out
          GestureDetector(
            onTap: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) { context.go('/login'); }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.logout_rounded, size: 18, color: AppColors.onSurfaceVariant),
                SizedBox(width: 8),
                Text('SIGN OUT', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14,
                  color: AppColors.onSurfaceVariant, letterSpacing: 0.8)),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, IconData icon, String label, String subtitle, VoidCallback onTap) =>
    ListTile(
      leading: Container(
        width: 38, height: 38,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 20, color: AppColors.onSurface),
      ),
      title: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
      trailing: const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant),
      onTap: onTap,
    );

  // ── Business Details ──────────────────────────────────────────────────────
  void _showBusinessDetails(BuildContext context, String currentName) {
    final ctrl = TextEditingController(text: currentName);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24, right: 24, top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Business Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 20),
          TextField(controller: ctrl, decoration: const InputDecoration(labelText: 'DISPLAY NAME')),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              try {
                await context.read<AuthProvider>().updateOperatorName(ctrl.text.trim());
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Name updated.')));
                }
              } on DioException catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.response?.data?['detail'] ?? 'Update failed.')));
                }
              }
            },
            child: const Text('SAVE CHANGES'),
          ),
        ]),
      ),
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  void _showNotifications(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _NotificationsSheet(),
    );
  }

  // ── Security ──────────────────────────────────────────────────────────────
  void _showSecurity(BuildContext context, String email) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24, right: 24, top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Security', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text('Signed in as $email',
            style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiClient.dio.post('/auth/forgot-password', data: {'email': email});
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Password reset email sent — check your inbox.')));
                }
              } on DioException catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.response?.data?['detail'] ?? 'Failed to send reset email.')));
                }
              }
            },
            child: const Text('SEND PASSWORD RESET EMAIL'),
          ),
          const SizedBox(height: 12),
        ]),
      ),
    );
  }

  // ── Billing ───────────────────────────────────────────────────────────────
  void _showBilling(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _BillingSheet(),
    );
  }

  // ── Support ───────────────────────────────────────────────────────────────
  void _showSupport(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Support', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 20),
          _supportRow(ctx, Icons.email_outlined, 'Email Support', 'support@delivra.app'),
          const Divider(height: 24, color: AppColors.border),
          _supportRow(ctx, Icons.chat_bubble_outline_rounded, 'WhatsApp', '+234 800 DELIVRA'),
          const Divider(height: 24, color: AppColors.border),
          _supportRow(ctx, Icons.menu_book_outlined, 'Help Centre', 'docs.delivra.app'),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  Widget _supportRow(BuildContext context, IconData icon, String label, String value) =>
    Row(children: [
      Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 20, color: AppColors.onSurface),
      ),
      const SizedBox(width: 14),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        Text(value, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
      ]),
    ]);
}

// ── Notifications bottom sheet ────────────────────────────────────────────
class _NotificationsSheet extends StatefulWidget {
  const _NotificationsSheet();
  @override
  State<_NotificationsSheet> createState() => _NotificationsSheetState();
}

class _NotificationsSheetState extends State<_NotificationsSheet> {
  bool _newJobs = true;
  bool _statusUpdates = true;
  bool _payments = false;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/notifications/prefs');
      setState(() {
        _newJobs = r.data['new_jobs'] as bool? ?? true;
        _statusUpdates = r.data['status_updates'] as bool? ?? true;
        _payments = r.data['payments'] as bool? ?? false;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await ApiClient.dio.patch('/notifications/prefs', data: {
        'new_jobs': _newJobs,
        'status_updates': _statusUpdates,
        'payments': _payments,
      });
    } catch (_) {}
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Align(
        alignment: Alignment.centerLeft,
        child: Text('Notifications', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))),
      const SizedBox(height: 20),
      if (_loading)
        const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
      else ...[
        _toggle('New job assignments', _newJobs, (v) { setState(() => _newJobs = v); _save(); }),
        const Divider(height: 1, color: AppColors.border),
        _toggle('Job status updates', _statusUpdates, (v) { setState(() => _statusUpdates = v); _save(); }),
        const Divider(height: 1, color: AppColors.border),
        _toggle('Payment confirmations', _payments, (v) { setState(() => _payments = v); _save(); }),
      ],
      const SizedBox(height: 8),
    ]),
  );

  Widget _toggle(String label, bool value, ValueChanged<bool> onChanged) =>
    SwitchListTile.adaptive(
      title: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
      value: value,
      onChanged: _saving ? null : onChanged,
      activeThumbColor: AppColors.primary,
    );
}

// ── Billing bottom sheet ──────────────────────────────────────────────────
class _BillingSheet extends StatefulWidget {
  const _BillingSheet();
  @override
  State<_BillingSheet> createState() => _BillingSheetState();
}

class _BillingSheetState extends State<_BillingSheet> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String _error = '';
  String? _upgrading;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/billing/status');
      setState(() { _data = r.data as Map<String, dynamic>; _loading = false; });
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['detail'] ?? 'Could not load billing info.'; _loading = false; });
    }
  }

  Future<void> _upgrade(String plan) async {
    setState(() => _upgrading = plan);
    try {
      final r = await ApiClient.dio.post('/billing/subscribe', data: {'plan': plan});
      final url = r.data['checkout_url'] as String?;
      if (url != null && mounted) {
        await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['detail'] ?? 'Could not start checkout.')));
      }
    } finally {
      if (mounted) setState(() => _upgrading = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final plan = _data?['plan'] as String? ?? '';
    final activeRiders = _data?['active_riders'] as int? ?? 0;
    final payments = (_data?['payments'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, ctrl) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Center(child: Container(
            width: 36, height: 4,
            decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 16),
          const Text('Billing & Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 20),
          if (_loading)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (_error.isNotEmpty)
            Text(_error, style: const TextStyle(color: AppColors.onSurfaceVariant))
          else
            Expanded(child: ListView(controller: ctrl, children: [
              // Plan badge + stats
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _planColor(plan).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _planColor(plan).withValues(alpha: 0.3)),
                ),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('CURRENT PLAN', style: TextStyle(
                      fontSize: 10, fontWeight: FontWeight.w700,
                      color: _planColor(plan), letterSpacing: 1.2)),
                    const SizedBox(height: 4),
                    Text(_capitalize(plan), style: TextStyle(
                      fontSize: 24, fontWeight: FontWeight.w800, color: _planColor(plan))),
                  ])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text('$activeRiders', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                    const Text('Active Riders', style: TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                  ]),
                ]),
              ),

              // Upgrade section
              if (plan != 'business') ...[
                const SizedBox(height: 24),
                const Text('UPGRADE PLAN', style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant, letterSpacing: 1.5)),
                const SizedBox(height: 12),
                if (plan != 'growth')
                  _PlanCard(
                    name: 'Growth', price: '₦15,000/mo',
                    perks: const ['Up to 20 riders', 'Priority support', 'Analytics'],
                    color: const Color(0xFF2196F3),
                    loading: _upgrading == 'growth',
                    onTap: () => _upgrade('growth'),
                  ),
                if (plan != 'growth') const SizedBox(height: 10),
                _PlanCard(
                  name: 'Business', price: '₦50,000/mo',
                  perks: const ['Unlimited riders', 'Dedicated support', 'Advanced analytics'],
                  color: const Color(0xFFFF9800),
                  loading: _upgrading == 'business',
                  onTap: () => _upgrade('business'),
                ),
              ],

              // Payment history
              if (payments.isNotEmpty) ...[
                const SizedBox(height: 24),
                const Text('PAYMENT HISTORY', style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant, letterSpacing: 1.5)),
                const SizedBox(height: 12),
                Material(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border)),
                    child: Column(
                      children: payments.asMap().entries.map((e) {
                        final p = e.value;
                        final isLast = e.key == payments.length - 1;
                        final amt = (p['amount'] as int? ?? 0) ~/ 100;
                        final date = (p['created_at'] as String? ?? '').split('T').first;
                        final status = p['status'] as String? ?? '';
                        final ok = status == 'success';
                        return Column(children: [
                          ListTile(
                            dense: true,
                            title: Text(_capitalize(p['plan'] as String? ?? ''),
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                            subtitle: Text('${p['reference']}  ·  $date',
                              style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('₦${amt.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (ok ? const Color(0xFF4CAF50) : AppColors.onSurfaceVariant).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(20)),
                                  child: Text(status.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 9, fontWeight: FontWeight.w700,
                                      color: ok ? const Color(0xFF4CAF50) : AppColors.onSurfaceVariant)),
                                ),
                              ],
                            ),
                          ),
                          if (!isLast) const Divider(height: 1, indent: 16, endIndent: 16, color: AppColors.border),
                        ]);
                      }).toList(),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 8),
            ])),
        ]),
      ),
    );
  }

  Color _planColor(String plan) {
    switch (plan) {
      case 'growth': return const Color(0xFF2196F3);
      case 'business': return const Color(0xFFFF9800);
      default: return AppColors.onSurfaceVariant;
    }
  }

  String _capitalize(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
}

class _PlanCard extends StatelessWidget {
  final String name, price;
  final List<String> perks;
  final Color color;
  final bool loading;
  final VoidCallback onTap;
  const _PlanCard({required this.name, required this.price, required this.perks,
    required this.color, required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: loading ? null : onTap,
    child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color)),
          Text(price, style: TextStyle(fontSize: 13, color: color.withValues(alpha: 0.8))),
          const SizedBox(height: 6),
          ...perks.map((p) => Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Row(children: [
              Icon(Icons.check_circle_outline, size: 13, color: color),
              const SizedBox(width: 4),
              Text(p, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
            ]),
          )),
        ])),
        const SizedBox(width: 12),
        loading
          ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: color))
          : Icon(Icons.arrow_forward_rounded, color: color),
      ]),
    ),
  );
}
