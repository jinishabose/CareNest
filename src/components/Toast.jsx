import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, Check, X, Pill } from 'lucide-react'

// Toast Context
const ToastContext = createContext(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { ...toast, id }])

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id)
        }, toast.duration || 5000)

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showMissedMedicineAlert = useCallback((medicine, timeSlot) => {
        addToast({
            type: 'warning',
            title: `${timeSlot} Medication Missed`,
            message: `You haven't taken your ${medicine.name} (${medicine.dosage}) yet`,
            duration: 8000,
            action: {
                label: 'Take Now',
                onClick: () => {
                    // This will be handled by the component that uses the toast
                    window.dispatchEvent(new CustomEvent('takeMedicine', { detail: { medicineId: medicine.id } }))
                }
            }
        })
    }, [addToast])

    const showLowStockAlert = useCallback((medicine) => {
        addToast({
            type: 'error',
            title: 'Low Stock Alert',
            message: `${medicine.name} has only ${medicine.pillsRemaining} pills left. Time to refill!`,
            duration: 10000
        })
    }, [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, showMissedMedicineAlert, showLowStockAlert }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
                ))}
            </AnimatePresence>

            <style>{`
                .toast-container {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }

                @media (max-width: 480px) {
                    .toast-container {
                        top: auto;
                        bottom: 20px;
                        right: 16px;
                        left: 16px;
                    }
                }
            `}</style>
        </div>
    )
}

function Toast({ toast, onRemove }) {
    const icons = {
        success: Check,
        warning: AlertTriangle,
        error: AlertCircle,
        info: Pill
    }

    const Icon = icons[toast.type] || AlertCircle

    return (
        <motion.div
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            <div className="toast-icon">
                <Icon size={20} />
            </div>
            <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
                {toast.action && (
                    <button className="toast-action" onClick={toast.action.onClick}>
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button className="toast-close" onClick={onRemove}>
                <X size={16} />
            </button>

            <style>{`
                .toast {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    min-width: 320px;
                    max-width: 420px;
                    background: var(--surface);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    pointer-events: auto;
                    border-left: 4px solid;
                }

                .toast-warning {
                    border-left-color: #F59E0B;
                }

                .toast-warning .toast-icon {
                    color: #F59E0B;
                    background: rgba(245, 158, 11, 0.1);
                }

                .toast-error {
                    border-left-color: #EF4444;
                }

                .toast-error .toast-icon {
                    color: #EF4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .toast-success {
                    border-left-color: #22C55E;
                }

                .toast-success .toast-icon {
                    color: #22C55E;
                    background: rgba(34, 197, 94, 0.1);
                }

                .toast-info {
                    border-left-color: #1B5E20;
                }

                .toast-info .toast-icon {
                    color: #1B5E20;
                    background: rgba(27, 94, 32, 0.1);
                }

                .toast-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .toast-content {
                    flex: 1;
                }

                .toast-title {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .toast-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .toast-action {
                    margin-top: 8px;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--forest-green);
                    background: rgba(27, 94, 32, 0.1);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toast-action:hover {
                    background: rgba(27, 94, 32, 0.2);
                }

                .toast-close {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .toast-close:hover {
                    background: var(--surface-muted);
                    color: var(--text-primary);
                }
            `}</style>
        </motion.div>
    )
}

export default ToastProvider
