import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import EditManagement from './pages/EditManagement/EditManagement'
import PatientClaimInfo from './pages/PatientClaimInfo/PatientClaimInfo'
import { selectIsAuthenticated } from './store/slices/authSlice'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/" replace />
}

// Public Route Component (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/edit-management"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Full-page routes without sidebar */}
        <Route
          path="/claim/:claimId"
          element={
            <ProtectedRoute>
              <PatientClaimInfo />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
