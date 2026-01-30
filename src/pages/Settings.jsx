import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Shield, Moon, Sun, LogOut, ChevronRight, Check, X, Download, Key, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { useMedicineStore } from '../store/medicineStore'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Settings() {
    const { user, logout, updateUserProfile } = useAuthStore()
    const { notifications, setNotificationPreference, darkMode, toggleDarkMode, initDarkMode } = useSettingsStore()
    const { medicines } = useMedicineStore()

    // Modal states
    const [editProfileOpen, setEditProfileOpen] = useState(false)
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)
    const [exportingData, setExportingData] = useState(false)

    // Form states
    const [profileName, setProfileName] = useState(user?.name || '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    // Initialize dark mode on mount
    useEffect(() => {
        initDarkMode()
    }, [])

    // Handle profile update
    const handleProfileUpdate = async () => {
        if (profileName.trim() && profileName !== user?.name) {
            await updateUserProfile({ name: profileName.trim() })
        }
        setEditProfileOpen(false)
    }

    // Handle password change
    const handlePasswordChange = async () => {
        setPasswordError('')
        setPasswordSuccess(false)

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        try {
            const currentUser = auth.currentUser
            if (!currentUser || !currentUser.email) {
                setPasswordError('No user logged in')
                return
            }

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
            await reauthenticateWithCredential(currentUser, credential)

            // Update password
            await updatePassword(currentUser, newPassword)

            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                setChangePasswordOpen(false)
                setPasswordSuccess(false)
            }, 2000)
        } catch (error) {
            console.error('Password change error:', error)
            if (error.code === 'auth/wrong-password') {
                setPasswordError('Current password is incorrect')
            } else if (error.code === 'auth/requires-recent-login') {
                setPasswordError('Please log out and log in again to change password')
            } else {
                setPasswordError('Failed to change password. Please try again.')
            }
        }
    }

    // Handle data export - includes weekly tracking and patient history from database
    const handleExportData = async () => {
        setExportingData(true)

        try {
            // Get weekly medicine tracking history from Firestore
            const weeklyHistory = await useMedicineStore.getState().getWeeklyHistory()

            // Get patient history from Firestore
            const patientHistory = await useMedicineStore.getState().getPatientHistory()

            // Format dates for export
            const formatDate = (date) => {
                if (!date) return null
                const d = date instanceof Date ? date : new Date(date)
                return d.toISOString()
            }

            const exportData = {
                exportInfo: {
                    exportedAt: new Date().toISOString(),
                    exportPeriod: 'Last 7 days',
                    version: '1.0'
                },
                user: {
                    name: user?.name,
                    email: user?.email,
                    role: user?.role,
                    createdAt: user?.createdAt
                },
                currentMedicines: medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    time: m.time,
                    frequency: m.frequency,
                    pillsRemaining: m.pillsRemaining,
                    totalPills: m.totalPills,
                    refillThreshold: m.refillThreshold,
                    lastTaken: formatDate(m.lastTaken?.toDate?.() || m.lastTaken)
                })),
                weeklyMedicineTracking: {
                    summary: {
                        totalDosesTaken: weeklyHistory.length,
                        uniqueMedicines: [...new Set(weeklyHistory.map(h => h.medicineName))].length,
                        period: 'Last 7 days'
                    },
                    history: weeklyHistory.map(h => ({
                        medicineName: h.medicineName,
                        dosage: h.dosage,
                        timeSlot: h.timeSlot,
                        takenAt: formatDate(h.takenAt),
                        pillsRemainingAfter: h.pillsRemainingAfter
                    }))
                },
                patientHistory: patientHistory.map(h => ({
                    type: h.type,
                    title: h.title,
                    description: h.description,
                    doctor: h.doctor,
                    date: formatDate(h.date),
                    createdAt: formatDate(h.createdAt)
                })),
                settings: {
                    notifications,
                    darkMode
                }
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `carenest-health-report-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export error:', error)
        }

        setExportingData(false)
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <section className="settings-section">
                <h2><User size={20} /> Profile</h2>
                <div className="settings-card">
                    <div className="profile-row">
                        <div className="avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
                        <div className="profile-info">
                            <h3>{user?.name || 'User'}</h3>
                            <p>{user?.email || 'email@example.com'}</p>
                            <span className="role-badge">{user?.role || 'guardian'}</span>
                        </div>
                        <button className="btn btn-ghost" onClick={() => setEditProfileOpen(true)}>Edit</button>
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="settings-section">
                <h2><Bell size={20} /> Notifications</h2>
                <div className="settings-card">
                    <ToggleRow
                        label="Medicine Reminders"
                        description="Get notified when it's time for medication"
                        value={notifications.reminders}
                        onChange={(v) => setNotificationPreference('reminders', v)}
                    />
                    <ToggleRow
                        label="Refill Alerts"
                        description="Notify when medicine stock is low"
                        value={notifications.refills}
                        onChange={(v) => setNotificationPreference('refills', v)}
                    />
                    <ToggleRow
                        label="App Updates"
                        description="Get notified about new features"
                        value={notifications.updates}
                        onChange={(v) => setNotificationPreference('updates', v)}
                    />
                </div>
            </section>

            {/* Appearance Section */}
            <section className="settings-section">
                <h2><Sun size={20} /> Appearance</h2>
                <div className="settings-card">
                    <ToggleRow
                        label="Dark Mode"
                        description="Use dark theme for the app"
                        value={darkMode}
                        onChange={toggleDarkMode}
                    />
                </div>
            </section>

            {/* Account Section */}
            <section className="settings-section">
                <h2><Shield size={20} /> Account</h2>
                <div className="settings-card">
                    <div className="setting-row clickable" onClick={() => setChangePasswordOpen(true)}>
                        <span>Change Password</span>
                        <ChevronRight size={18} />
                    </div>
                    <div className="setting-row clickable" onClick={handleExportData}>
                        <span>{exportingData ? 'Exporting...' : 'Export Data'}</span>
                        {exportingData ? <div className="spinner-sm" /> : <Download size={18} />}
                    </div>
                </div>
            </section>

            {/* Logout */}
            <motion.button className="btn btn-ghost logout-btn" whileHover={{ scale: 1.02 }} onClick={logout}>
                <LogOut size={18} /> Sign Out
            </motion.button>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {editProfileOpen && (
                    <Modal onClose={() => setEditProfileOpen(false)} title="Edit Profile">
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={user?.email || ''}
                                    disabled
                                />
                                <small className="form-hint">Email cannot be changed</small>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setEditProfileOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleProfileUpdate}>Save Changes</button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Change Password Modal */}
            <AnimatePresence>
                {changePasswordOpen && (
                    <Modal onClose={() => setChangePasswordOpen(false)} title="Change Password">
                        <div className="modal-form">
                            {passwordSuccess ? (
                                <div className="success-message">
                                    <Check size={24} />
                                    <p>Password changed successfully!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <div className="password-input">
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                className="form-input"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                            >
                                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            className="form-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min 6 chars)"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            className="form-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    {passwordError && (
                                        <div className="error-message">{passwordError}</div>
                                    )}
                                    <div className="modal-actions">
                                        <button className="btn btn-ghost" onClick={() => setChangePasswordOpen(false)}>Cancel</button>
                                        <button className="btn btn-primary" onClick={handlePasswordChange}>
                                            <Key size={16} /> Change Password
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <style>{`
        .settings-page { padding-bottom: var(--space-8); max-width: 640px; }
        .settings-header { margin-bottom: var(--space-8); }
        .settings-header h1 { font-size: var(--font-size-2xl); color: var(--forest-green); margin-bottom: var(--space-1); }
        .settings-header p { color: var(--text-secondary); font-size: var(--font-size-sm); }
        .settings-section { margin-bottom: var(--space-6); }
        .settings-section h2 { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-base); color: var(--text-secondary); margin-bottom: var(--space-3); }
        .settings-card { background: var(--surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; }
        .profile-row { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); }
        .avatar-lg { width: 64px; height: 64px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: var(--font-size-xl); font-weight: 600; }
        .profile-info { flex: 1; }
        .profile-info h3 { font-size: var(--font-size-lg); margin-bottom: var(--space-1); }
        .profile-info p { font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-2); }
        .role-badge { display: inline-block; padding: var(--space-1) var(--space-3); background: rgba(27, 94, 32, 0.1); color: var(--forest-green); font-size: var(--font-size-xs); font-weight: 500; border-radius: var(--radius-full); text-transform: capitalize; }
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-5); border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
        .setting-row:last-child { border-bottom: none; }
        .setting-row.clickable { cursor: pointer; }
        .setting-row.clickable:hover { background: var(--surface-muted); }
        .logout-btn { width: 100%; justify-content: center; color: var(--error); margin-top: var(--space-4); }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.1); }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
        .modal-content { background: var(--surface); border-radius: var(--radius-xl); width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-5); border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
        .modal-header h2 { font-size: var(--font-size-lg); font-weight: 600; margin: 0; }
        .modal-body { padding: var(--space-5); }
        .modal-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
        .form-group label { font-size: var(--font-size-sm); font-weight: 500; color: var(--text-primary); }
        .form-input { padding: var(--space-3) var(--space-4); border: 1px solid #E5E7EB; border-radius: var(--radius-lg); font-size: var(--font-size-base); transition: border-color var(--transition-fast); }
        .form-input:focus { outline: none; border-color: var(--forest-green); }
        .form-input:disabled { background: var(--surface-muted); color: var(--text-muted); }
        .form-hint { font-size: var(--font-size-xs); color: var(--text-muted); }
        .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); }
        .password-input { position: relative; display: flex; align-items: center; }
        .password-input .form-input { flex: 1; padding-right: 48px; }
        .password-toggle { position: absolute; right: var(--space-3); background: none; border: none; color: var(--text-muted); cursor: pointer; }
        .error-message { color: var(--error); font-size: var(--font-size-sm); background: rgba(239, 68, 68, 0.1); padding: var(--space-3); border-radius: var(--radius-md); }
        .success-message { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-6); color: var(--success); text-align: center; }
        .spinner-sm { width: 18px; height: 18px; border: 2px solid var(--surface-muted); border-top-color: var(--forest-green); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}

function ToggleRow({ label, description, value, onChange }) {
    return (
        <div className="setting-row">
            <div className="setting-info">
                <span className="setting-label">{label}</span>
                <span className="setting-desc">{description}</span>
            </div>
            <button className={`toggle ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
                <span className="toggle-knob" />
            </button>
            <style>{`
        .setting-info { flex: 1; }
        .setting-label { display: block; font-weight: 500; margin-bottom: var(--space-1); }
        .setting-desc { font-size: var(--font-size-sm); color: var(--text-muted); }
        .toggle { width: 48px; height: 28px; background: var(--surface-muted); border: none; border-radius: var(--radius-full); cursor: pointer; position: relative; transition: background var(--transition-fast); }
        .toggle.active { background: var(--forest-green); }
        .toggle-knob { position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; background: white; border-radius: 50%; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast); }
        .toggle.active .toggle-knob { transform: translateX(20px); }
      `}</style>
        </div>
    )
}

function Modal({ children, onClose, title }) {
    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    )
}
