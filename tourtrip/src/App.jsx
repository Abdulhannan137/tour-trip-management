import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChangeListener, logoutUser } from './firebase/auth'
import './App.css'

// Student Screens
import StudentLogin from './StudentScreens/Login'
import StudentSignup from './StudentScreens/Signup'
import StudentDashboard from './StudentScreens/Dashboard'

// Admin Screens
import AdminLogin from './AdminScreen/Login'
import AdminSignup from './AdminScreen/Signup'
import AdminDashboard from './AdminScreen/Dashboard'

const Home = () => (
  <div className="home">
    <h1>Tour Trip Management System</h1>
    <div className="role-selection">
      <a href="/student-login" className="role-button">Student Login</a>
      <a href="/admin-login" className="role-button admin">Admin Login</a>
    </div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChangeListener((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Student Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute isAuthenticated={user}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute isAuthenticated={user}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute isAuthenticated={user}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={user}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
