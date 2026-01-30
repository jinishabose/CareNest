import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    TrendingDown,
    Search,
    MoreVertical,
    Phone,
    MessageCircle,
    CheckCircle,
    Clock,
    Users,
    Activity
} from 'lucide-react'
import { format, subDays } from 'date-fns'

// Demo patient data
const demoPatients = [
    {
        id: 1,
        name: 'Mary Johnson',
        age: 78,
        avatar: 'MJ',
        adherence: 45,
        riskLevel: 'high',
        missedDoses: 8,
        lastContact: new Date(),
        conditions: ['Diabetes', 'Hypertension'],
        guardian: 'John Johnson'
    },
    {
        id: 2,
        name: 'Robert Williams',
        age: 82,
        avatar: 'RW',
        adherence: 62,
        riskLevel: 'medium',
        missedDoses: 5,
        lastContact: subDays(new Date(), 2),
        conditions: ['Heart Disease'],
        guardian: 'Sarah Williams'
    },
    {
        id: 3,
        name: 'Patricia Brown',
        age: 71,
        avatar: 'PB',
        adherence: 88,
        riskLevel: 'low',
        missedDoses: 2,
        lastContact: subDays(new Date(), 1),
        conditions: ['Arthritis', 'Cholesterol'],
        guardian: 'Michael Brown'
    },
    {
        id: 4,
        name: 'James Davis',
        age: 85,
        avatar: 'JD',
        adherence: 35,
        riskLevel: 'critical',
        missedDoses: 12,
        lastContact: subDays(new Date(), 5),
        conditions: ['COPD', 'Diabetes', 'Kidney Disease'],
        guardian: 'Emily Davis'
    }
]

const riskColors = {
    critical: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', border: '#EF4444' },
    high: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', border: '#F59E0B' },
    medium: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB', border: '#3B82F6' },
    low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16A34A', border: '#22C55E' }
}

export default function HighRiskDashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)

    const filteredPatients = demoPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const criticalCount = demoPatients.filter(p => p.riskLevel === 'critical').length
    const highRiskCount = demoPatients.filter(p => p.riskLevel === 'high').length
    const avgAdherence = Math.round(demoPatients.reduce((acc, p) => acc + p.adherence, 0) / demoPatients.length)

    return (
        <div className="high-risk-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>High-Risk Dashboard</h1>
                    <p>Monitor patient medication adherence</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <motion.div
                    className="stat-card critical"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <div className="stat-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{criticalCount}</span>
                        <span className="stat-label">Critical Patients</span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card warning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon">
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{highRiskCount}</span>
                        <span className="stat-label">High Risk</span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{avgAdherence}%</span>
                        <span className="stat-label">Avg Adherence</span>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{demoPatients.length}</span>
                        <span className="stat-label">Total Patients</span>
                    </div>
                </motion.div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search patients or conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Patient List */}
            <div className="patient-list">
                {filteredPatients
                    .sort((a, b) => {
                        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
                    })
                    .map((patient, index) => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            index={index}
                            onSelect={() => setSelectedPatient(patient)}
                        />
                    ))}
            </div>

            <style>{`
        .high-risk-dashboard {
          padding-bottom: var(--space-8);
        }

        .dashboard-header {
          margin-bottom: var(--space-6);
        }

        .dashboard-header h1 {
          font-size: var(--font-size-2xl);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card.critical .stat-icon {
          background: rgba(239, 68, 68, 0.1);
          color: #DC2626;
        }

        .stat-card.warning .stat-icon {
          background: rgba(245, 158, 11, 0.1);
          color: #D97706;
        }

        .stat-card.info .stat-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #2563EB;
        }

        .stat-card.success .stat-icon {
          background: rgba(34, 197, 94, 0.1);
          color: #16A34A;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-card .stat-value {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-card .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .search-bar {
          position: relative;
          margin-bottom: var(--space-6);
        }

        .search-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: var(--space-4);
          padding-left: var(--space-12);
          font-size: var(--font-size-base);
          border: 1px solid #E5E7EB;
          border-radius: var(--radius-xl);
          background: var(--surface);
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--forest-green);
          box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.1);
        }

        .patient-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
      `}</style>
        </div>
    )
}

function PatientCard({ patient, index, onSelect }) {
    const risk = riskColors[patient.riskLevel]

    return (
        <motion.div
            className="patient-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            onClick={onSelect}
        >
            <div className="patient-main">
                <div className="patient-avatar" style={{ background: risk.bg, color: risk.text }}>
                    {patient.avatar}
                </div>
                <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-meta">
                        {patient.age} years • {patient.conditions.join(', ')}
                    </div>
                </div>
            </div>

            <div className="patient-stats">
                <div className="adherence-stat">
                    <div className="adherence-label">Adherence</div>
                    <div className="adherence-bar">
                        <div
                            className="adherence-fill"
                            style={{
                                width: `${patient.adherence}%`,
                                background: patient.adherence < 50 ? '#EF4444' : patient.adherence < 75 ? '#F59E0B' : '#22C55E'
                            }}
                        />
                    </div>
                    <div className="adherence-value">{patient.adherence}%</div>
                </div>

                <div className="missed-doses">
                    <Clock size={14} />
                    <span>{patient.missedDoses} missed doses</span>
                </div>
            </div>

            <div className="patient-actions">
                <span
                    className="risk-badge"
                    style={{ background: risk.bg, color: risk.text, borderColor: risk.border }}
                >
                    {patient.riskLevel}
                </span>
                <div className="action-buttons">
                    <button className="action-btn" title="Call">
                        <Phone size={16} />
                    </button>
                    <button className="action-btn" title="Message">
                        <MessageCircle size={16} />
                    </button>
                    <button className="action-btn" title="More">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <style>{`
        .patient-card {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: var(--space-6);
          padding: var(--space-5);
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        @media (max-width: 768px) {
          .patient-card {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
        }

        .patient-main {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .patient-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: var(--font-size-sm);
        }

        .patient-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .patient-meta {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .patient-stats {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          min-width: 180px;
        }

        .adherence-stat {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .adherence-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          min-width: 60px;
        }

        .adherence-bar {
          flex: 1;
          height: 6px;
          background: var(--surface-muted);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .adherence-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .adherence-value {
          font-size: var(--font-size-sm);
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }

        .missed-doses {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .patient-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .risk-badge {
          padding: var(--space-1) var(--space-3);
          font-size: var(--font-size-xs);
          font-weight: 500;
          text-transform: capitalize;
          border-radius: var(--radius-full);
          border: 1px solid;
        }

        .action-buttons {
          display: flex;
          gap: var(--space-2);
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-muted);
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--forest-green);
          color: white;
        }
      `}</style>
        </motion.div>
    )
}
