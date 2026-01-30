/**
 * Notification Store
 * Manages application notifications including missed medicines and appointments
 */

import { create } from 'zustand'
import { useMedicineStore } from './medicineStore'
import { useAppointmentStore } from './appointmentStore'
import { getGreeting, formatTime, formatDate } from '../utils/timeUtils'
import {
    isMedicineMissed,
    isLowStock,
    createMissedNotification,
    createLowStockNotification
} from '../utils/notificationUtils'

// Re-export getGreeting for backward compatibility
export { getGreeting }

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    isDropdownOpen: false,

    // Toggle dropdown visibility
    toggleDropdown: () => set(state => ({ isDropdownOpen: !state.isDropdownOpen })),
    closeDropdown: () => set({ isDropdownOpen: false }),

    /**
     * Get all missed medicines
     * @returns {Array} Array of missed medicine notification objects
     */
    getMissedMedicines: () => {
        const medicines = useMedicineStore.getState().medicines

        return medicines
            .filter(medicine => isMedicineMissed(medicine))
            .map(medicine => createMissedNotification(medicine))
    },

    /**
     * Get all low stock notifications
     * @returns {Array} Array of low stock notification objects
     */
    getLowStockNotifications: () => {
        const medicines = useMedicineStore.getState().medicines

        return medicines
            .filter(medicine => isLowStock(medicine))
            .map(medicine => createLowStockNotification(medicine))
    },

    /**
     * Get tomorrow's appointment reminders
     * @returns {Array} Array of appointment notification objects
     */
    getAppointmentReminders: () => {
        try {
            const appointments = useAppointmentStore.getState().getAppointmentsDueTomorrow()

            return appointments.map(apt => ({
                id: `apt-tomorrow-${apt.id}`,
                type: 'appointment',
                priority: 3,
                icon: 'calendar',
                title: apt.title || apt.doctorName || 'Doctor Appointment',
                doctorName: apt.doctorName,
                location: apt.location,
                date: apt.date,
                time: formatTime(apt.date),
                dateFormatted: formatDate(apt.date),
                message: `Tomorrow: ${apt.doctorName || apt.title} at ${formatTime(apt.date)}`
            }))
        } catch (error) {
            console.warn('Could not fetch appointment reminders:', error)
            return []
        }
    },

    /**
     * Get today's appointment reminders
     * @returns {Array} Array of today's appointment notification objects
     */
    getTodaysAppointmentReminders: () => {
        try {
            const appointments = useAppointmentStore.getState().getTodaysAppointments()

            return appointments.map(apt => ({
                id: `apt-today-${apt.id}`,
                type: 'appointment-today',
                priority: 1,
                icon: 'calendar',
                title: apt.title || apt.doctorName || 'Doctor Appointment',
                doctorName: apt.doctorName,
                location: apt.location,
                date: apt.date,
                time: formatTime(apt.date),
                message: `Today: ${apt.doctorName || apt.title} at ${formatTime(apt.date)}`
            }))
        } catch (error) {
            console.warn('Could not fetch today\'s appointments:', error)
            return []
        }
    },

    /**
     * Get all notifications combined and sorted by priority
     * Priority: 1 = Today's appointments, 2 = Missed medicines, 3 = Tomorrow's appointments, 4 = Low stock
     * @returns {Array} Sorted array of all notifications
     */
    getAllNotifications: () => {
        const missed = get().getMissedMedicines()
        const lowStock = get().getLowStockNotifications()
        const appointmentsTomorrow = get().getAppointmentReminders()
        const appointmentsToday = get().getTodaysAppointmentReminders()

        const allNotifications = [
            ...appointmentsToday,
            ...missed,
            ...appointmentsTomorrow,
            ...lowStock
        ]

        return allNotifications.sort((a, b) => a.priority - b.priority)
    },

    /**
     * Get total notification count
     * @returns {number} Number of notifications
     */
    getNotificationCount: () => {
        return get().getAllNotifications().length
    }
}))
