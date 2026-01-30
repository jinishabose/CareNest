import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Home,
    Clock,
    Package,
    History,
    Scan,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Activity,
    Bell
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCareCircleStore } from '../../store/careCircleStore'

const doctorNavItems = [
    { path: '/dashboard', icon: Activity, label: 'High-Risk Dashboard' },
    { path: '/scan', icon: Scan, label: 'Prescription Scanner' },
    { path: '/settings', icon: Settings, label: 'Settings' }
]

const guardianNavItems = [
    { path: '/timeline', icon: Clock, label: 'Daily Timeline' },
    { path: '/inventory', icon: Package, label: 'Medicine Inventory' },
    { path: '/history', icon: History, label: 'Patient History' },
    { path: '/scan', icon: Scan, label: 'Scan Prescription' },
    { path: '/care-circle', icon: Users, label: 'Care Circle' },
    { path: '/settings', icon: Settings, label: 'Settings' }
]

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const { user, logout } = useAuthStore()
    const { patients, activePatientId, setActivePatient } = useCareCircleStore()

    const navItems = user?.role === 'doctor' ? doctorNavItems : guardianNavItems
    const activePatient = patients.find(p => p.id === activePatientId)

    return (
        <div className="layout">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/logo.svg" alt="CareNest" width="40" height="40" />
                        <span>CareNest</span>
                    </div>
                    <button
                        className="sidebar-close btn-icon"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Care Circle Switcher (for guardians) */}
                {user?.role !== 'doctor' && patients.length > 0 && (
                    <div className="care-circle-switcher">
                        <span className="switcher-label">Managing</span>
                        <select
                            className="patient-select"
                            value={activePatientId || ''}
                            onChange={(e) => setActivePatient(e.target.value)}
                        >
                            <option value="">Personal</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} {patient.mode === 'elderly' ? '(Elderly)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar avatar-md">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'User'}</span>
                            <span className="user-role">{user?.role || 'guardian'}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={logout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Top Header */}
                <header className="top-header">
                    <button
                        className="menu-toggle btn btn-ghost btn-icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="header-title">
                        {navItems.find(item => item.path === location.pathname)?.label || 'CareNest'}
                    </div>

                    <div className="header-actions">
                        <button className="btn btn-ghost btn-icon notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="page-wrapper"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: var(--surface);
          border-right: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform var(--transition-base);
        }

        .sidebar.open {
          transform: translateX(0);
        }

        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0);
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99;
        }

        @media (min-width: 1024px) {
          .sidebar-overlay {
            display: none;
          }
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--forest-green);
        }

        .sidebar-close {
          display: flex;
        }

        @media (min-width: 1024px) {
          .sidebar-close {
            display: none;
          }
        }

        /* Care Circle Switcher */
        .care-circle-switcher {
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .switcher-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: var(--space-2);
        }

        .patient-select {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          border: 1px solid #E5E7EB;
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: var(--space-4) var(--space-3);
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          margin-bottom: var(--space-1);
        }

        .nav-item:hover {
          background: var(--surface-muted);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(27, 94, 32, 0.1);
          color: var(--forest-green);
          font-weight: 500;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-role {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-transform: capitalize;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        @media (min-width: 1024px) {
          .main-content {
            margin-left: 280px;
          }
        }

        /* Top Header */
        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--surface);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        @media (min-width: 1024px) {
          .top-header {
            padding: var(--space-4) var(--space-6);
          }
        }

        .menu-toggle {
          display: flex;
        }

        @media (min-width: 1024px) {
          .menu-toggle {
            display: none;
          }
        }

        .header-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .notification-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          background: var(--error);
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Page Content */
        .page-content {
          flex: 1;
          padding: var(--space-4);
        }

        @media (min-width: 1024px) {
          .page-content {
            padding: var(--space-6) var(--space-8);
          }
        }

        .page-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
        </div>
    )
}
