import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    FileText,
    Pill,
    Stethoscope,
    ChevronDown,
    ChevronUp,
    Download,
    Eye
} from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'

// Demo history data
const demoHistory = [
    {
        id: 1,
        type: 'prescription',
        title: 'New Prescription Added',
        description: 'Metformin 500mg - Twice daily for diabetes management',
        date: new Date(),
        doctor: 'Dr. Sarah Chen',
        icon: FileText,
        color: '#1B5E20'
    },
    {
        id: 2,
        type: 'medication',
        title: 'Medication Completed',
        description: 'Finished 30-day course of Amoxicillin',
        date: subDays(new Date(), 5),
        icon: Pill,
        color: '#22C55E'
    },
    {
        id: 3,
        type: 'visit',
        title: 'Doctor Visit',
        description: 'Regular checkup - Blood pressure normal, glucose slightly elevated',
        date: subDays(new Date(), 12),
        doctor: 'Dr. Michael Brown',
        icon: Stethoscope,
        color: '#3B82F6'
    },
    {
        id: 4,
        type: 'prescription',
        title: 'Prescription Updated',
        description: 'Lisinopril dosage increased from 5mg to 10mg',
        date: subDays(new Date(), 12),
        doctor: 'Dr. Michael Brown',
        icon: FileText,
        color: '#1B5E20'
    },
    {
        id: 5,
        type: 'medication',
        title: 'New Supplement Added',
        description: 'Vitamin D3 1000 IU - Once daily',
        date: subMonths(new Date(), 1),
        icon: Pill,
        color: '#F59E0B'
    },
    {
        id: 6,
        type: 'visit',
        title: 'Specialist Consultation',
        description: 'Cardiology follow-up - ECG normal, continue current medications',
        date: subMonths(new Date(), 2),
        doctor: 'Dr. Emily Watson',
        icon: Stethoscope,
        color: '#3B82F6'
    }
]

export default function PatientHistory() {
    const [expandedItem, setExpandedItem] = useState(null)
    const [filterType, setFilterType] = useState('all')

    const filteredHistory = filterType === 'all'
        ? demoHistory
        : demoHistory.filter(item => item.type === filterType)

    const toggleExpand = (id) => {
        setExpandedItem(expandedItem === id ? null : id)
    }

    return (
        <div className="patient-history">
            {/* Header */}
            <div className="history-header">
                <div>
                    <h1>Patient History</h1>
                    <p>Complete medical timeline</p>
                </div>
                <button className="btn btn-secondary">
                    <Download size={18} />
                    Export PDF
                </button>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'prescription', label: 'Prescriptions' },
                    { id: 'medication', label: 'Medications' },
                    { id: 'visit', label: 'Visits' }
                ].map(filter => (
                    <button
                        key={filter.id}
                        className={`filter-tab ${filterType === filter.id ? 'active' : ''}`}
                        onClick={() => setFilterType(filter.id)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="history-timeline">
                {filteredHistory.map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="history-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="timeline-marker" style={{ background: item.color }}>
                            <item.icon size={16} />
                        </div>

                        <div
                            className={`history-card ${expandedItem === item.id ? 'expanded' : ''}`}
                            onClick={() => toggleExpand(item.id)}
                        >
                            <div className="card-main">
                                <div className="card-content">
                                    <div className="card-date">
                                        <Calendar size={14} />
                                        {format(item.date, 'MMM d, yyyy')}
                                    </div>
                                    <h3 className="card-title">{item.title}</h3>
                                    <p className="card-description">{item.description}</p>
                                    {item.doctor && (
                                        <span className="card-doctor">{item.doctor}</span>
                                    )}
                                </div>
                                <button className="expand-btn">
                                    {expandedItem === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {expandedItem === item.id && (
                                <motion.div
                                    className="card-expanded"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="expanded-content">
                                        <div className="expanded-row">
                                            <span className="label">Type</span>
                                            <span className="value" style={{ textTransform: 'capitalize' }}>{item.type}</span>
                                        </div>
                                        <div className="expanded-row">
                                            <span className="label">Date</span>
                                            <span className="value">{format(item.date, 'EEEE, MMMM d, yyyy')}</span>
                                        </div>
                                        {item.doctor && (
                                            <div className="expanded-row">
                                                <span className="label">Healthcare Provider</span>
                                                <span className="value">{item.doctor}</span>
                                            </div>
                                        )}
                                        <div className="expanded-actions">
                                            <button className="btn btn-ghost btn-sm">
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                            <button className="btn btn-ghost btn-sm">
                                                <Download size={16} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
        .patient-history {
          padding-bottom: var(--space-8);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .history-header h1 {
          font-size: var(--font-size-2xl);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .history-header p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .filter-tabs {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
          padding: var(--space-1);
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          overflow-x: auto;
        }

        .filter-tab {
          padding: var(--space-2) var(--space-4);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .filter-tab:hover {
          color: var(--text-primary);
          background: var(--surface-muted);
        }

        .filter-tab.active {
          color: var(--forest-green);
          background: rgba(27, 94, 32, 0.1);
        }

        .history-timeline {
          position: relative;
          padding-left: var(--space-10);
        }

        .history-timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--forest-green), var(--buttermilk-yellow));
          opacity: 0.3;
        }

        .history-item {
          position: relative;
          margin-bottom: var(--space-4);
        }

        .timeline-marker {
          position: absolute;
          left: -36px;
          top: 20px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 2;
        }

        .history-card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .history-card:hover {
          box-shadow: var(--shadow-lg);
        }

        .card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--space-5);
        }

        .card-date {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          margin-bottom: var(--space-2);
        }

        .card-title {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .card-description {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
        }

        .card-doctor {
          font-size: var(--font-size-xs);
          color: var(--forest-green);
          font-weight: 500;
        }

        .expand-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-muted);
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .card-expanded {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .expanded-content {
          padding: var(--space-5);
          background: var(--surface-muted);
        }

        .expanded-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-2) 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .expanded-row:last-of-type {
          border-bottom: none;
        }

        .expanded-row .label {
          font-size: var(--font-size-sm);
          color: var(--text-muted);
        }

        .expanded-row .value {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .expanded-actions {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
      `}</style>
        </div>
    )
}
