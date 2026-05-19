import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
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
  Map<String, dynamic>? _status;
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await ApiClient.dio.get('/billing/status');
      setState(() { _status = r.data as Map<String, dynamic>; _loading = false; });
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['detail'] ?? 'Could not load billing info.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Billing & Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
      const SizedBox(height: 20),
      if (_loading)
        const Center(child: Padding(
          padding: EdgeInsets.all(24),
          child: CircularProgressIndicator()))
      else if (_error.isNotEmpty)
        Text(_error, style: const TextStyle(color: AppColors.onSurfaceVariant))
      else ...[
        _row('Current Plan', _capitalize(_status?['plan'] ?? 'free')),
        const Divider(height: 24, color: AppColors.border),
        _row('Status', _capitalize(_status?['status'] ?? '—')),
        const Divider(height: 24, color: AppColors.border),
        _row('Active Riders', '${_status?['active_riders'] ?? '—'}'),
        if (_status?['next_billing_date'] != null) ...[
          const Divider(height: 24, color: AppColors.border),
          _row('Next Billing', _status!['next_billing_date'].toString().split('T').first),
        ],
      ],
      const SizedBox(height: 8),
    ]),
  );

  Widget _row(String label, String value) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant)),
      Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
    ],
  );

  String _capitalize(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
}
