/**
 * Medicine Alert Manager Component
 * Monitors medicines and shows popup alerts for missed doses and low stock
 */

import { useEffect, useRef } from 'react'
import { useToast } from './Toast'
import { useMedicineStore } from '../store/medicineStore'
import { useAppointmentStore } from '../store/appointmentStore'
import { getISTHour } from '../utils/timeUtils'
import {
    isMedicineMissed,
    isLowStock,
    getTimeLabel,
    hasTimePassed
} from '../utils/notificationUtils'

export default function MedicineAlertManager() {
    const { showMissedMedicineAlert, showLowStockAlert, addToast } = useToast()
    const { medicines, markAsTaken } = useMedicineStore()
    const alertedItems = useRef(new Set())
    const lastCheckDate = useRef(new Date().toDateString())

    // Listen for "Take Now" action from toast
    useEffect(() => {
        const handleTakeMedicine = async (event) => {
            const { medicineId } = event.detail
            const result = await markAsTaken(medicineId)
            if (result) {
                addToast({
                    type: 'success',
                    title: 'Medicine Taken',
                    message: 'Great job staying on track with your medication!',
                    duration: 3000
                })
            }
        }

        window.addEventListener('takeMedicine', handleTakeMedicine)
        return () => window.removeEventListener('takeMedicine', handleTakeMedicine)
    }, [markAsTaken, addToast])

    // Check for missed medicines and appointments periodically
    useEffect(() => {
        const checkNotifications = () => {
            const todayString = new Date().toDateString()

            // Reset alerts at midnight
            if (lastCheckDate.current !== todayString) {
                alertedItems.current.clear()
                lastCheckDate.current = todayString
            }

            // Check each medicine for missed doses
            medicines.forEach(medicine => {
                if (isMedicineMissed(medicine)) {
                    const alertKey = `medicine-${medicine.id}-${todayString}`

                    if (!alertedItems.current.has(alertKey)) {
                        alertedItems.current.add(alertKey)

                        const timeStr = medicine.time || medicine.scheduledTime
                        const timeLabel = getTimeLabel(timeStr)
                        showMissedMedicineAlert(medicine, `${timeLabel} (${timeStr})`)
                    }
                }

                // Check for low stock
                if (isLowStock(medicine) && (medicine.pillsRemaining || 0) <= 5) {
                    const lowStockKey = `low-stock-${medicine.id}-${todayString}`
                    if (!alertedItems.current.has(lowStockKey)) {
                        alertedItems.current.add(lowStockKey)
                        showLowStockAlert(medicine)
                    }
                }
            })

            // Check for appointment reminders
            checkAppointmentReminders(todayString)
        }

        const checkAppointmentReminders = (todayString) => {
            try {
                const currentHour = getISTHour()

                // Show tomorrow's appointment reminders in evening (after 5 PM)
                if (currentHour >= 17) {
                    const appointmentsTomorrow = useAppointmentStore.getState().getAppointmentsDueTomorrow()

                    appointmentsTomorrow.forEach(apt => {
                        const alertKey = `apt-tomorrow-${apt.id}-${todayString}`
                        if (!alertedItems.current.has(alertKey)) {
                            alertedItems.current.add(alertKey)

                            const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
                            const timeStr = aptDate.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })

                            addToast({
                                type: 'info',
                                title: 'Appointment Tomorrow',
                                message: `${apt.doctorName || apt.title || 'Doctor appointment'} at ${timeStr}`,
                                duration: 10000
                            })
                        }
                    })
                }

                // Show today's appointment reminders (2 hours before)
                const appointmentsToday = useAppointmentStore.getState().getTodaysAppointments()

                appointmentsToday.forEach(apt => {
                    const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
                    const now = new Date()
                    const hoursUntil = (aptDate - now) / (1000 * 60 * 60)

                    if (hoursUntil > 0 && hoursUntil <= 2) {
                        const alertKey = `apt-today-${apt.id}-${todayString}`
                        if (!alertedItems.current.has(alertKey)) {
                            alertedItems.current.add(alertKey)

                            const timeStr = aptDate.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })

                            addToast({
                                type: 'warning',
                                title: 'Appointment Soon',
                                message: `${apt.doctorName || apt.title || 'Doctor appointment'} at ${timeStr} (in ${Math.round(hoursUntil * 60)} minutes)`,
                                duration: 15000
                            })
                        }
                    }
                })
            } catch (error) {
                // Appointment store may not be initialized
                console.warn('Could not check appointment reminders:', error)
            }
        }

        // Initial check after 2 seconds (let app load first)
        const initialTimeout = setTimeout(checkNotifications, 2000)

        // Then check every minute
        const interval = setInterval(checkNotifications, 60 * 1000)

        return () => {
            clearTimeout(initialTimeout)
            clearInterval(interval)
        }
    }, [medicines, showMissedMedicineAlert, showLowStockAlert, addToast])

    return null // This component only manages alerts, no UI
}
