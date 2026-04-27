import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/landing/LandingPage'
import FleetApp from './pages/landing/FleetApp'
import RiderApp from './pages/landing/RiderApp'
import Pricing from './pages/landing/Pricing'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import RiderLogin from './pages/auth/RiderLogin'

import Dashboard from './pages/operator/Dashboard'
import FleetManagement from './pages/operator/FleetManagement'
import NewJob from './pages/operator/NewJob'
import JobHistory from './pages/operator/JobHistory'
import JobDetail from './pages/operator/JobDetail'
import Settings from './pages/operator/Settings'
import Billing from './pages/operator/Billing'

import RiderJobList from './pages/rider/RiderJobList'
import RiderJobDetail from './pages/rider/RiderJobDetail'

import TrackingPage from './pages/tracking/TrackingPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rider/login" element={<RiderLogin />} />

          {/* Operator dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="operator"><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/fleet" element={
            <ProtectedRoute requiredRole="operator"><FleetManagement /></ProtectedRoute>
          } />
          <Route path="/dashboard/jobs/new" element={
            <ProtectedRoute requiredRole="operator"><NewJob /></ProtectedRoute>
          } />
          <Route path="/dashboard/jobs/:id" element={
            <ProtectedRoute requiredRole="operator"><JobDetail /></ProtectedRoute>
          } />
          <Route path="/dashboard/jobs" element={
            <ProtectedRoute requiredRole="operator"><JobHistory /></ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute requiredRole="operator"><Settings /></ProtectedRoute>
          } />
          <Route path="/dashboard/billing" element={
            <ProtectedRoute requiredRole="operator"><Billing /></ProtectedRoute>
          } />

          {/* Rider app */}
          <Route path="/rider" element={
            <ProtectedRoute requiredRole="rider" redirectTo="/rider/login"><RiderJobList /></ProtectedRoute>
          } />
          <Route path="/rider/job/:id" element={
            <ProtectedRoute requiredRole="rider" redirectTo="/rider/login"><RiderJobDetail /></ProtectedRoute>
          } />

          {/* Public tracking */}
          <Route path="/track/:token" element={<TrackingPage />} />

          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/fleet-app" element={<FleetApp />} />
          <Route path="/rider-app" element={<RiderApp />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
