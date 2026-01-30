import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DailyTimeline from './pages/guardian/DailyTimeline'
import HighRiskDashboard from './pages/doctor/HighRiskDashboard'
import MedicineInventory from './pages/MedicineInventory'
import PatientHistory from './pages/PatientHistory'
import PrescriptionScanner from './features/ai/PrescriptionScanner'
import CareCircle from './pages/CareCircle'
import Settings from './pages/Settings'
import { useAuthStore } from './store/authStore'
import { useMedicineStore } from './store/medicineStore'

function App() {
    const [showSplash, setShowSplash] = useState(true)
    const { user, isAuthenticated, isLoading, initAuth } = useAuthStore()
    const { initMedicineListener, cleanupListener } = useMedicineStore()

    // Initialize Firebase Auth listener
    useEffect(() => {
        initAuth()
    }, [])

    // Initialize Medicine Firestore listener when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            initMedicineListener()
        }
        return () => cleanupListener()
    }, [isAuthenticated, user?.id])

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false)
        }, 2500)
        return () => clearTimeout(timer)
    }, [])

    // Show splash or loading
    if (showSplash || isLoading) {
        return <SplashScreen />
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                } />
                <Route path="/register" element={
                    isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
                } />

                {/* Protected Routes */}
                <Route path="/*" element={
                    isAuthenticated ? (
                        <Layout>
                            <Routes>
                                {/* Role-based home redirect */}
                                <Route path="/" element={
                                    user?.role === 'doctor'
                                        ? <Navigate to="/dashboard" replace />
                                        : <Navigate to="/timeline" replace />
                                } />

                                {/* Doctor Routes */}
                                <Route path="/dashboard" element={<HighRiskDashboard />} />

                                {/* Guardian/Patient Routes */}
                                <Route path="/timeline" element={<DailyTimeline />} />
                                <Route path="/inventory" element={<MedicineInventory />} />
                                <Route path="/history" element={<PatientHistory />} />
                                <Route path="/scan" element={<PrescriptionScanner />} />
                                <Route path="/care-circle" element={<CareCircle />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </Layout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } />
            </Routes>
        </Router>
    )
}

export default App
