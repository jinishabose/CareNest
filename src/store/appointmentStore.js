import { create } from 'zustand'
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

export const useAppointmentStore = create((set, get) => ({
    appointments: [],
    isLoading: true,
    unsubscribe: null,

    // Initialize real-time listener for appointments
    initAppointmentListener: () => {
        const user = auth.currentUser
        if (!user) {
            set({ appointments: [], isLoading: false })
            return
        }

        const appointmentsRef = collection(db, 'users', user.uid, 'appointments')
        const q = query(appointmentsRef, orderBy('date', 'asc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to Date
                date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
            }))
            set({ appointments, isLoading: false })
        }, (error) => {
            console.error('Appointment listener error:', error)
            set({ isLoading: false })
        })

        set({ unsubscribe })
    },

    // Cleanup listener
    cleanupListener: () => {
        const { unsubscribe } = get()
        if (unsubscribe) {
            unsubscribe()
            set({ unsubscribe: null })
        }
    },

    // Add new appointment
    addAppointment: async (appointment) => {
        const user = auth.currentUser
        if (!user) return null

        try {
            const appointmentsRef = collection(db, 'users', user.uid, 'appointments')
            const docRef = await addDoc(appointmentsRef, {
                ...appointment,
                date: appointment.date, // Should be a Date object or Timestamp
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
            return docRef.id
        } catch (error) {
            console.error('Add appointment error:', error)
            return null
        }
    },

    // Update appointment
    updateAppointment: async (id, updates) => {
        const user = auth.currentUser
        if (!user) return false

        try {
            const appointmentRef = doc(db, 'users', user.uid, 'appointments', id)
            await updateDoc(appointmentRef, {
                ...updates,
                updatedAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Update appointment error:', error)
            return false
        }
    },

    // Delete appointment
    deleteAppointment: async (id) => {
        const user = auth.currentUser
        if (!user) return false

        try {
            const appointmentRef = doc(db, 'users', user.uid, 'appointments', id)
            await deleteDoc(appointmentRef)
            return true
        } catch (error) {
            console.error('Delete appointment error:', error)
            return false
        }
    },

    // Get upcoming appointments (within next 7 days)
    getUpcomingAppointments: () => {
        const { appointments } = get()
        const now = new Date()
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        return appointments.filter(apt => {
            const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
            return aptDate >= now && aptDate <= oneWeekLater
        })
    },

    // Get appointments that are tomorrow (for reminders)
    getAppointmentsDueTomorrow: () => {
        const { appointments } = get()
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Set to start and end of tomorrow
        const tomorrowStart = new Date(tomorrow)
        tomorrowStart.setHours(0, 0, 0, 0)
        const tomorrowEnd = new Date(tomorrow)
        tomorrowEnd.setHours(23, 59, 59, 999)

        return appointments.filter(apt => {
            const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
            return aptDate >= tomorrowStart && aptDate <= tomorrowEnd
        })
    },

    // Get today's appointments
    getTodaysAppointments: () => {
        const { appointments } = get()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEnd = new Date(today)
        todayEnd.setHours(23, 59, 59, 999)

        return appointments.filter(apt => {
            const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
            return aptDate >= today && aptDate <= todayEnd
        })
    }
}))
