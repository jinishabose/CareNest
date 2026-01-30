import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sun, Sunset, Moon, Check, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { useMedicineStore } from '../../store/medicineStore'
import { format } from 'date-fns'

const timeSlots = [
    { id: 'morning', label: 'Morning', icon: Sun, time: '8:00 AM', color: '#FFF9C4', gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFEB3B 100%)' },
    { id: 'afternoon', label: 'Afternoon', icon: Sunset, time: '2:00 PM', color: '#FFE0B2', gradient: 'linear-gradient(135deg, #FFE0B2 0%, #FF9800 100%)' },
    { id: 'evening', label: 'Evening', icon: Moon, time: '8:00 PM', color: '#C8E6C9', gradient: 'linear-gradient(135deg, #C8E6C9 0%, #4CAF50 100%)' }
]

// Demo medicines for display
const demoMedicines = [
    { id: 1, name: 'Metformin', dosage: '500mg', time: 'morning', taken: false, pillsRemaining: 24 },
    { id: 2, name: 'Lisinopril', dosage: '10mg', time: 'morning', taken: true, pillsRemaining: 30 },
    { id: 3, name: 'Vitamin D3', dosage: '1000 IU', time: 'afternoon', taken: false, pillsRemaining: 8 },
    { id: 4, name: 'Aspirin', dosage: '81mg', time: 'evening', taken: false, pillsRemaining: 45 },
    { id: 5, name: 'Omega-3', dosage: '1000mg', time: 'evening', taken: false, pillsRemaining: 3 }
]

export default function DailyTimeline() {
    const { medicines, markAsTaken } = useMedicineStore()
    const [takenMeds, setTakenMeds] = useState({})
    const [cursorY, setCursorY] = useState(0)
    const timelineRef = useRef(null)

    const displayMedicines = medicines.length > 0 ? medicines : demoMedicines

    const handleTake = (medId) => {
        setTakenMeds(prev => ({ ...prev, [medId]: true }))
        if (medicines.length > 0) {
            markAsTaken(medId)
        }
    }

    const getMedicinesForSlot = (slotId) => {
        return displayMedicines.filter(med => med.time === slotId)
    }

    const handleMouseMove = (e) => {
        if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect()
            setCursorY((e.clientY - rect.top) / rect.height)
        }
    }

    const today = format(new Date(), 'EEEE, MMMM d')

    return (
        <div className="daily-timeline" ref={timelineRef} onMouseMove={handleMouseMove}>
            {/* Header */}
            <div className="timeline-header">
                <div>
                    <h1>Daily Timeline</h1>
                    <p className="timeline-date">{today}</p>
                </div>
                <div className="timeline-stats">
                    <div className="stat-item">
                        <span className="stat-value">
                            {displayMedicines.filter(m => m.taken || takenMeds[m.id]).length}
                        </span>
                        <span className="stat-label">Taken</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value">{displayMedicines.length}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>
            </div>

            {/* Timeline with Path Reveal */}
            <div className="timeline-container">
                {/* Glowing Path */}
                <div
                    className="timeline-path"
                    style={{
                        background: `linear-gradient(to bottom, 
              var(--forest-green) 0%, 
              var(--forest-green) ${cursorY * 100}%, 
              rgba(27, 94, 32, 0.15) ${cursorY * 100}%, 
              rgba(27, 94, 32, 0.15) 100%)`
                    }}
                />
                <div
                    className="timeline-glow"
                    style={{ top: `${cursorY * 100}%` }}
                />

                {/* Time Slots */}
                {timeSlots.map((slot, index) => {
                    const slotMedicines = getMedicinesForSlot(slot.id)
                    const allTaken = slotMedicines.every(m => m.taken || takenMeds[m.id])

                    return (
                        <motion.div
                            key={slot.id}
                            className="timeline-slot"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Slot Marker */}
                            <div className={`slot-marker ${allTaken ? 'completed' : ''}`}>
                                {allTaken ? <Check size={16} /> : <slot.icon size={16} />}
                            </div>

                            {/* Slot Content */}
                            <div className="slot-content">
                                <div className="slot-header" style={{ background: slot.gradient }}>
                                    <div className="slot-info">
                                        <h3>{slot.label}</h3>
                                        <span className="slot-time">
                                            <Clock size={14} />
                                            {slot.time}
                                        </span>
                                    </div>
                                    <div className="slot-count">
                                        {slotMedicines.filter(m => m.taken || takenMeds[m.id]).length}/{slotMedicines.length}
                                    </div>
                                </div>

                                {/* Medicine Cards */}
                                <div className="medicine-list">
                                    {slotMedicines.map(medicine => (
                                        <MedicineTimelineCard
                                            key={medicine.id}
                                            medicine={medicine}
                                            taken={medicine.taken || takenMeds[medicine.id]}
                                            onTake={() => handleTake(medicine.id)}
                                        />
                                    ))}
                                    {slotMedicines.length === 0 && (
                                        <div className="empty-slot">No medications scheduled</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <style>{`
        .daily-timeline {
          padding-bottom: var(--space-8);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .timeline-header h1 {
          font-size: var(--font-size-2xl);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .timeline-date {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .timeline-stats {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--surface);
          padding: var(--space-4) var(--space-6);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--forest-green);
        }

        .stat-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }

        .stat-divider {
          width: 1px;
          height: 32px;
          background: rgba(0, 0, 0, 0.1);
        }

        .timeline-container {
          position: relative;
          padding-left: var(--space-10);
        }

        .timeline-path {
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: var(--radius-full);
          transition: background 0.1s ease;
        }

        .timeline-glow {
          position: absolute;
          left: 9px;
          width: 16px;
          height: 16px;
          background: var(--forest-green);
          border-radius: 50%;
          box-shadow: var(--shadow-glow);
          transform: translateY(-50%);
          pointer-events: none;
          opacity: 0.8;
        }

        .timeline-slot {
          position: relative;
          margin-bottom: var(--space-8);
        }

        .slot-marker {
          position: absolute;
          left: -36px;
          top: 16px;
          width: 32px;
          height: 32px;
          background: var(--surface);
          border: 3px solid var(--forest-green);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--forest-green);
          z-index: 2;
        }

        .slot-marker.completed {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .slot-content {
          background: var(--surface);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-5);
        }

        .slot-info h3 {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .slot-time {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
          opacity: 0.8;
        }

        .slot-count {
          font-size: var(--font-size-lg);
          font-weight: 600;
          opacity: 0.9;
        }

        .medicine-list {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .empty-slot {
          color: var(--text-muted);
          font-size: var(--font-size-sm);
          text-align: center;
          padding: var(--space-4);
        }
      `}</style>
        </div>
    )
}

function MedicineTimelineCard({ medicine, taken, onTake }) {
    const isLowStock = medicine.pillsRemaining <= 5

    return (
        <motion.div
            className={`medicine-timeline-card ${taken ? 'taken' : ''}`}
            whileHover={{ scale: 1.01, x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
        >
            <div className="medicine-info">
                <div className="medicine-name">{medicine.name}</div>
                <div className="medicine-dosage">{medicine.dosage}</div>
                {isLowStock && (
                    <div className="low-stock-alert">
                        <AlertCircle size={12} />
                        Only {medicine.pillsRemaining} left
                    </div>
                )}
            </div>

            <div className="medicine-actions">
                {taken ? (
                    <div className="taken-badge">
                        <Check size={16} />
                        Taken
                    </div>
                ) : (
                    <motion.button
                        className="btn btn-primary btn-sm"
                        onClick={onTake}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Take Now
                        <ChevronRight size={16} />
                    </motion.button>
                )}
            </div>

            <style>{`
        .medicine-timeline-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          background: var(--surface-muted);
          border-radius: var(--radius-lg);
          border: 1px solid transparent;
          transition: all var(--transition-fast);
        }

        .medicine-timeline-card:hover {
          border-color: rgba(27, 94, 32, 0.2);
          background: rgba(27, 94, 32, 0.03);
        }

        .medicine-timeline-card.taken {
          opacity: 0.6;
          background: rgba(34, 197, 94, 0.05);
        }

        .medicine-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .medicine-dosage {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .low-stock-alert {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-xs);
          color: var(--warning);
          margin-top: var(--space-2);
        }

        .taken-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--success);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }
      `}</style>
        </motion.div>
    )
}
