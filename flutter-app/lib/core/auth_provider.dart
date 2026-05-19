import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';
import 'models/models.dart';

enum UserRole { operator, rider, none }

class AuthProvider extends ChangeNotifier {
  UserRole role = UserRole.none;
  Operator? operator;
  Rider? rider;
  bool loading = true;

  AuthProvider() {
    _restore();
  }

  Future<void> _restore() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final savedRole = prefs.getString('role');
    if (token == null || savedRole == null) {
      loading = false;
      notifyListeners();
      return;
    }
    role = savedRole == 'operator' ? UserRole.operator : UserRole.rider;
    try {
      if (role == UserRole.operator) {
        final r = await ApiClient.dio.get('/auth/me');
        operator = Operator.fromJson(r.data as Map<String, dynamic>);
      } else {
        final r = await ApiClient.dio.get('/auth/rider/me');
        rider = Rider.fromJson(r.data as Map<String, dynamic>);
      }
    } catch (_) {
      await logout();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> loginOperator(String email, String password) async {
    final r = await ApiClient.dio.post('/auth/operator/login',
        data: {'email': email, 'password': password});
    final token = TokenResponse.fromJson(r.data as Map<String, dynamic>).accessToken;
    await _saveToken(token, 'operator');
    final me = await ApiClient.dio.get('/auth/me');
    operator = Operator.fromJson(me.data as Map<String, dynamic>);
    role = UserRole.operator;
    notifyListeners();
  }

  Future<void> loginRider(String phone, String password) async {
    final r = await ApiClient.dio.post('/auth/rider/login',
        data: {'phone': phone, 'password': password});
    final token = TokenResponse.fromJson(r.data as Map<String, dynamic>).accessToken;
    await _saveToken(token, 'rider');
    final me = await ApiClient.dio.get('/auth/rider/me');
    rider = Rider.fromJson(me.data as Map<String, dynamic>);
    role = UserRole.rider;
    notifyListeners();
  }

  Future<void> updateOperatorName(String name) async {
    final r = await ApiClient.dio.patch('/auth/me', data: {'name': name});
    operator = Operator.fromJson(r.data as Map<String, dynamic>);
    notifyListeners();
  }

  Future<String> registerOperator(String name, String email, String password) async {
    await ApiClient.dio.post('/auth/register',
        data: {'name': name, 'email': email, 'password': password});
    return email;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('role');
    role = UserRole.none;
    operator = null;
    rider = null;
    notifyListeners();
  }

  Future<void> _saveToken(String token, String roleStr) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('role', roleStr);
  }
}
