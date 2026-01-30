import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Moon, Sun, LogOut, ChevronRight, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Settings() {
    const { user, logout, updateProfile } = useAuthStore()
    const [notifications, setNotifications] = useState({ reminders: true, refills: true, updates: false })
    const [darkMode, setDarkMode] = useState(false)

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
                        <button className="btn btn-ghost">Edit</button>
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section className="settings-section">
                <h2><Bell size={20} /> Notifications</h2>
                <div className="settings-card">
                    <ToggleRow label="Medicine Reminders" description="Get notified when it's time for medication"
                        value={notifications.reminders} onChange={(v) => setNotifications({ ...notifications, reminders: v })} />
                    <ToggleRow label="Refill Alerts" description="Notify when medicine stock is low"
                        value={notifications.refills} onChange={(v) => setNotifications({ ...notifications, refills: v })} />
                    <ToggleRow label="App Updates" description="Get notified about new features"
                        value={notifications.updates} onChange={(v) => setNotifications({ ...notifications, updates: v })} />
                </div>
            </section>

            {/* Appearance Section */}
            <section className="settings-section">
                <h2><Sun size={20} /> Appearance</h2>
                <div className="settings-card">
                    <ToggleRow label="Dark Mode" description="Use dark theme for the app"
                        value={darkMode} onChange={setDarkMode} />
                </div>
            </section>

            {/* Account Section */}
            <section className="settings-section">
                <h2><Shield size={20} /> Account</h2>
                <div className="settings-card">
                    <div className="setting-row clickable"><span>Change Password</span><ChevronRight size={18} /></div>
                    <div className="setting-row clickable"><span>Privacy Settings</span><ChevronRight size={18} /></div>
                    <div className="setting-row clickable"><span>Export Data</span><ChevronRight size={18} /></div>
                </div>
            </section>

            {/* Logout */}
            <motion.button className="btn btn-ghost logout-btn" whileHover={{ scale: 1.02 }} onClick={logout}>
                <LogOut size={18} /> Sign Out
            </motion.button>

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
