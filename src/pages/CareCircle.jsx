import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, UserPlus, X, Check, Trash2, Mail, Phone, Heart, Shield } from 'lucide-react'
import { useCareCircleStore } from '../store/careCircleStore'

export default function CareCircle() {
    const { patients, activePatientId, addPatient, removePatient, setActivePatient } = useCareCircleStore()
    const [showAddModal, setShowAddModal] = useState(false)

    return (
        <div className="care-circle">
            <div className="circle-header">
                <div>
                    <h1>Care Circle</h1>
                    <p>Manage your connected patients and family members</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={20} /> Add Member
                </button>
            </div>

            <div className="members-section">
                <h2>Connected Members ({patients.length})</h2>
                {patients.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>No members yet</h3>
                        <p>Add family members or patients to your care circle</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} /> Add First Member
                        </button>
                    </div>
                ) : (
                    <div className="members-grid">
                        {patients.map((patient, index) => (
                            <motion.div key={patient.id} className={`member-card ${activePatientId === patient.id ? 'active' : ''}`}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                onClick={() => setActivePatient(patient.id)}>
                                <div className="member-header">
                                    <div className="member-info">
                                        <div className="avatar">{patient.name.charAt(0)}</div>
                                        <div>
                                            <h3>{patient.name}</h3>
                                            <span className="member-mode">{patient.mode === 'elderly' ? 'Elderly Mode' : 'Standard Mode'}</span>
                                        </div>
                                    </div>
                                    <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removePatient(patient.id); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {activePatientId === patient.id && (
                                    <div className="active-badge"><Check size={12} /> Currently Managing</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={(data) => { addPatient(data); setShowAddModal(false); }} />}

            <style>{`
        .care-circle { padding-bottom: var(--space-8); }
        .circle-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-8); flex-wrap: wrap; gap: var(--space-4); }
        .circle-header h1 { font-size: var(--font-size-2xl); color: var(--forest-green); margin-bottom: var(--space-1); }
        .circle-header p { color: var(--text-secondary); font-size: var(--font-size-sm); }
        .members-section { background: var(--surface); border-radius: var(--radius-2xl); padding: var(--space-6); box-shadow: var(--shadow-md); }
        .members-section h2 { font-size: var(--font-size-lg); margin-bottom: var(--space-5); }
        .empty-state { text-align: center; padding: var(--space-10); color: var(--text-muted); }
        .empty-state svg { margin-bottom: var(--space-4); opacity: 0.5; }
        .empty-state h3 { font-size: var(--font-size-lg); color: var(--text-primary); margin-bottom: var(--space-2); }
        .empty-state p { margin-bottom: var(--space-6); }
        .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4); }
        .member-card { background: var(--surface-muted); border: 2px solid transparent; border-radius: var(--radius-xl); padding: var(--space-5); cursor: pointer; transition: all var(--transition-fast); }
        .member-card:hover { border-color: rgba(27, 94, 32, 0.2); }
        .member-card.active { border-color: var(--forest-green); background: rgba(27, 94, 32, 0.05); }
        .member-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .member-info { display: flex; align-items: center; gap: var(--space-3); }
        .member-card .avatar { width: 48px; height: 48px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .member-info h3 { font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-1); }
        .member-mode { font-size: var(--font-size-xs); color: var(--text-muted); }
        .member-card .remove-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; border-radius: var(--radius-md); color: var(--text-muted); cursor: pointer; opacity: 0; }
        .member-card:hover .remove-btn { opacity: 1; }
        .member-card .remove-btn:hover { background: var(--error); color: white; }
        .active-badge { display: inline-flex; align-items: center; gap: var(--space-2); margin-top: var(--space-4); padding: var(--space-2) var(--space-3); background: rgba(27, 94, 32, 0.1); color: var(--forest-green); font-size: var(--font-size-xs); font-weight: 500; border-radius: var(--radius-full); }
      `}</style>
        </div>
    )
}

function AddMemberModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', mode: 'standard' })
    const handleSubmit = (e) => { e.preventDefault(); if (formData.name.trim()) onAdd(formData); }

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Care Circle Member</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="input-group">
                        <label className="input-label">Name *</label>
                        <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Mode</label>
                        <div className="mode-selector">
                            <button type="button" className={`mode-option ${formData.mode === 'standard' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, mode: 'standard' })}>
                                <Heart size={20} /><span>Standard</span>
                            </button>
                            <button type="button" className={`mode-option ${formData.mode === 'elderly' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, mode: 'elderly' })}>
                                <Shield size={20} /><span>Elderly</span>
                            </button>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><UserPlus size={18} /> Add Member</button>
                    </div>
                </form>
            </motion.div>
            <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
        .modal-content { width: 100%; max-width: 440px; background: var(--surface); border-radius: var(--radius-2xl); padding: var(--space-6); box-shadow: var(--shadow-xl); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
        .modal-header h2 { font-size: var(--font-size-xl); color: var(--forest-green); }
        .close-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--surface-muted); border: none; border-radius: var(--radius-md); cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .mode-selector { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
        .mode-option { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); background: var(--surface-muted); border: 2px solid transparent; border-radius: var(--radius-lg); cursor: pointer; }
        .mode-option.active { background: rgba(27, 94, 32, 0.1); border-color: var(--forest-green); color: var(--forest-green); }
        .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid rgba(0, 0, 0, 0.1); }
      `}</style>
        </motion.div>
    )
}
