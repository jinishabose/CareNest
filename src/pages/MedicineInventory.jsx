import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Package,
    AlertCircle,
    Edit2,
    Trash2,
    RotateCcw,
    MessageCircle,
    X,
    Check,
    Search
} from 'lucide-react'
import { useMedicineStore } from '../store/medicineStore'

// Demo medicines
const demoMedicines = [
    { id: 'demo1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', pillsRemaining: 24, totalPills: 60, refillThreshold: 10, expiryDate: '2025-06-15', sideEffects: 'Nausea, stomach upset' },
    { id: 'demo2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', pillsRemaining: 8, totalPills: 30, refillThreshold: 10, expiryDate: '2025-08-20', sideEffects: 'Dry cough, dizziness' },
    { id: 'demo3', name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', pillsRemaining: 45, totalPills: 90, refillThreshold: 15, expiryDate: '2026-01-10', sideEffects: 'None reported' },
    { id: 'demo4', name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', pillsRemaining: 3, totalPills: 30, refillThreshold: 10, expiryDate: '2025-12-05', sideEffects: 'Stomach bleeding, allergic reaction' }
]

export default function MedicineInventory() {
    const { medicines, addMedicine, updateMedicine, deleteMedicine, refillMedicine } = useMedicineStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingMedicine, setEditingMedicine] = useState(null)
    const [flippedCards, setFlippedCards] = useState({})

    const displayMedicines = medicines.length > 0 ? medicines : demoMedicines
    const filteredMedicines = displayMedicines.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const lowStockMedicines = displayMedicines.filter(med =>
        med.pillsRemaining <= (med.refillThreshold || 10)
    )

    const toggleFlip = (id) => {
        setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleWhatsAppShare = (medicine) => {
        const message = `Refill Request: ${medicine.name} (${medicine.dosage}) - Only ${medicine.pillsRemaining} pills remaining. Please arrange for refill.`
        window.open(`whatsapp://send?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <div className="medicine-inventory">
            {/* Header */}
            <div className="inventory-header">
                <div>
                    <h1>Medicine Inventory</h1>
                    <p>Manage your medicine stock</p>
                </div>
                <motion.button
                    className="btn btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={20} />
                    Add Medicine
                </motion.button>
            </div>

            {/* Low Stock Alert */}
            {lowStockMedicines.length > 0 && (
                <motion.div
                    className="low-stock-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AlertCircle size={20} />
                    <span>
                        <strong>{lowStockMedicines.length} medicine(s)</strong> running low on stock
                    </span>
                    <button
                        className="alert-action"
                        onClick={() => handleWhatsAppShare(lowStockMedicines[0])}
                    >
                        <MessageCircle size={16} />
                        Share Refill Request
                    </button>
                </motion.div>
            )}

            {/* Search */}
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Medicine Grid */}
            <div className="medicine-grid">
                {filteredMedicines.map((medicine, index) => (
                    <MedicineFlipCard
                        key={medicine.id}
                        medicine={medicine}
                        index={index}
                        isFlipped={flippedCards[medicine.id]}
                        onFlip={() => toggleFlip(medicine.id)}
                        onEdit={() => setEditingMedicine(medicine)}
                        onDelete={() => deleteMedicine(medicine.id)}
                        onRefill={(amount) => refillMedicine(medicine.id, amount)}
                        onWhatsApp={() => handleWhatsAppShare(medicine)}
                    />
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingMedicine) && (
                    <MedicineModal
                        medicine={editingMedicine}
                        onClose={() => {
                            setShowAddModal(false)
                            setEditingMedicine(null)
                        }}
                        onSave={(data) => {
                            if (editingMedicine) {
                                updateMedicine(editingMedicine.id, data)
                            } else {
                                addMedicine(data)
                            }
                            setShowAddModal(false)
                            setEditingMedicine(null)
                        }}
                    />
                )}
            </AnimatePresence>

            <style>{`
        .medicine-inventory {
          padding-bottom: var(--space-8);
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .inventory-header h1 {
          font-size: var(--font-size-2xl);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .inventory-header p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .low-stock-alert {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-lg);
          color: #D97706;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .alert-action {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: #D97706;
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .alert-action:hover {
          opacity: 0.9;
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

        .medicine-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
      `}</style>
        </div>
    )
}

function MedicineFlipCard({ medicine, index, isFlipped, onFlip, onEdit, onDelete, onRefill, onWhatsApp }) {
    const isLowStock = medicine.pillsRemaining <= (medicine.refillThreshold || 10)
    const stockPercentage = (medicine.pillsRemaining / medicine.totalPills) * 100

    return (
        <motion.div
            className={`flip-card ${isFlipped ? 'flipped' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="flip-card-inner" onClick={onFlip}>
                {/* Front Side */}
                <div className="flip-card-front medicine-card-front">
                    <div className="card-header">
                        <div className="medicine-icon">
                            <Package size={24} />
                        </div>
                        <div className="card-actions">
                            <button className="card-action" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                <Edit2 size={16} />
                            </button>
                            <button className="card-action delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <h3 className="medicine-name">{medicine.name}</h3>
                    <p className="medicine-dosage">{medicine.dosage}</p>
                    <p className="medicine-frequency">{medicine.frequency}</p>

                    <div className="stock-section">
                        <div className="stock-header">
                            <span>Stock Level</span>
                            <span className={`stock-value ${isLowStock ? 'low' : ''}`}>
                                {medicine.pillsRemaining} / {medicine.totalPills}
                            </span>
                        </div>
                        <div className="progress">
                            <div
                                className={`progress-bar ${stockPercentage <= 20 ? 'low' : stockPercentage <= 50 ? 'medium' : ''}`}
                                style={{ width: `${stockPercentage}%` }}
                            />
                        </div>
                        {isLowStock && (
                            <div className="refill-alert">
                                <AlertCircle size={14} />
                                Refill needed soon
                            </div>
                        )}
                    </div>

                    <div className="flip-hint">
                        Tap for details →
                    </div>
                </div>

                {/* Back Side */}
                <div className="flip-card-back medicine-card-back">
                    <div className="back-header">
                        <h3>{medicine.name}</h3>
                        <button className="close-btn" onClick={(e) => { e.stopPropagation(); onFlip(); }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Side Effects</span>
                        <p className="detail-value">{medicine.sideEffects || 'None reported'}</p>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Expiry Date</span>
                        <p className="detail-value">{medicine.expiryDate || 'Not set'}</p>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Remaining</span>
                        <p className="detail-value highlight">
                            {medicine.pillsRemaining} pills left
                        </p>
                    </div>

                    <div className="back-actions">
                        <motion.button
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => { e.stopPropagation(); onRefill(30); }}
                        >
                            <RotateCcw size={16} />
                            Refill +30
                        </motion.button>
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
                        >
                            <MessageCircle size={16} />
                            WhatsApp
                        </motion.button>
                    </div>
                </div>
            </div>

            <style>{`
        .medicine-card-front {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .medicine-icon {
          width: 48px;
          height: 48px;
          background: var(--gradient-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--forest-green);
        }

        .card-actions {
          display: flex;
          gap: var(--space-2);
        }

        .card-action {
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

        .card-action:hover {
          background: var(--forest-green);
          color: white;
        }

        .card-action.delete:hover {
          background: var(--error);
        }

        .medicine-name {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .medicine-dosage {
          font-size: var(--font-size-base);
          color: var(--forest-green);
          font-weight: 500;
          margin-bottom: var(--space-1);
        }

        .medicine-frequency {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
        }

        .stock-section {
          margin-top: auto;
        }

        .stock-header {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-2);
        }

        .stock-value {
          font-weight: 600;
        }

        .stock-value.low {
          color: var(--error);
        }

        .refill-alert {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--warning);
        }

        .flip-hint {
          margin-top: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-align: center;
        }

        /* Back Side */
        .medicine-card-back {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .back-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .back-header h3 {
          font-size: var(--font-size-lg);
          color: var(--forest-green);
        }

        .close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .detail-item {
          margin-bottom: var(--space-4);
        }

        .detail-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: var(--space-1);
        }

        .detail-value {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }

        .detail-value.highlight {
          font-weight: 600;
          color: var(--forest-green);
        }

        .back-actions {
          margin-top: auto;
          display: flex;
          gap: var(--space-3);
        }

        .back-actions .btn {
          flex: 1;
          font-size: var(--font-size-sm);
        }
      `}</style>
        </motion.div>
    )
}

function MedicineModal({ medicine, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: medicine?.name || '',
        dosage: medicine?.dosage || '',
        frequency: medicine?.frequency || '',
        pillsRemaining: medicine?.pillsRemaining || 30,
        totalPills: medicine?.totalPills || 30,
        refillThreshold: medicine?.refillThreshold || 10,
        expiryDate: medicine?.expiryDate || '',
        sideEffects: medicine?.sideEffects || '',
        time: medicine?.time || 'morning'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Medicine Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Metformin"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Dosage</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                placeholder="e.g., 500mg"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Frequency</label>
                            <select
                                className="input"
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            >
                                <option value="">Select frequency</option>
                                <option value="Once daily">Once daily</option>
                                <option value="Twice daily">Twice daily</option>
                                <option value="Three times daily">Three times daily</option>
                                <option value="As needed">As needed</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Time of Day</label>
                            <select
                                className="input"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Current Stock</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.pillsRemaining}
                                onChange={(e) => setFormData({ ...formData, pillsRemaining: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Total Capacity</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.totalPills}
                                onChange={(e) => setFormData({ ...formData, totalPills: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Refill Threshold</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.refillThreshold}
                                onChange={(e) => setFormData({ ...formData, refillThreshold: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Expiry Date</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Side Effects (Optional)</label>
                        <textarea
                            className="input textarea"
                            value={formData.sideEffects}
                            onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                            placeholder="List any known side effects..."
                            rows="2"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Check size={18} />
                            {medicine ? 'Save Changes' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </motion.div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }

        .modal-content {
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .modal-header h2 {
          font-size: var(--font-size-xl);
          color: var(--forest-green);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .textarea {
          resize: vertical;
          min-height: 60px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>
        </motion.div>
    )
}
