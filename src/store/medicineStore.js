import { create } from 'zustand'
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDocs,
    where,
    Timestamp
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

export const useMedicineStore = create((set, get) => ({
    medicines: [],
    reminders: [],
    isLoading: true,
    unsubscribe: null,

    // Initialize real-time listener
    initMedicineListener: () => {
        const user = auth.currentUser
        if (!user) {
            set({ medicines: [], isLoading: false })
            return
        }

        const medicinesRef = collection(db, 'users', user.uid, 'medicines')
        const q = query(medicinesRef, orderBy('createdAt', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const medicines = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            set({ medicines, isLoading: false })
        }, (error) => {
            console.error('Medicine listener error:', error)
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

    // Add medicine
    addMedicine: async (medicine) => {
        const user = auth.currentUser
        if (!user) return null

        try {
            const medicinesRef = collection(db, 'users', user.uid, 'medicines')
            const docRef = await addDoc(medicinesRef, {
                ...medicine,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
            return docRef.id
        } catch (error) {
            console.error('Add medicine error:', error)
            return null
        }
    },

    // Update medicine
    updateMedicine: async (id, updates) => {
        const user = auth.currentUser
        if (!user) return false

        try {
            const medicineRef = doc(db, 'users', user.uid, 'medicines', id)
            await updateDoc(medicineRef, {
                ...updates,
                updatedAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Update medicine error:', error)
            return false
        }
    },

    // Delete medicine
    deleteMedicine: async (id) => {
        const user = auth.currentUser
        if (!user) return false

        try {
            const medicineRef = doc(db, 'users', user.uid, 'medicines', id)
            await deleteDoc(medicineRef)
            return true
        } catch (error) {
            console.error('Delete medicine error:', error)
            return false
        }
    },

    // Mark medicine as taken (decrements pill count and records the action in history)
    markAsTaken: async (id) => {
        const user = auth.currentUser
        if (!user) return false

        const { medicines } = get()
        const medicine = medicines.find(m => m.id === id)
        if (!medicine) return false

        try {
            const medicineRef = doc(db, 'users', user.uid, 'medicines', id)
            const newPillCount = Math.max(0, (medicine.pillsRemaining || 0) - 1)

            // Update medicine document
            await updateDoc(medicineRef, {
                pillsRemaining: newPillCount,
                lastTaken: serverTimestamp(),
                updatedAt: serverTimestamp()
            })

            // Record in medicine history for tracking
            const historyRef = collection(db, 'users', user.uid, 'medicineHistory')
            await addDoc(historyRef, {
                medicineId: id,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                timeSlot: medicine.time,
                takenAt: serverTimestamp(),
                pillsRemainingAfter: newPillCount
            })

            return true
        } catch (error) {
            console.error('Mark as taken error:', error)
            return false
        }
    },

    // Decrement pills (mark as taken)
    decrementPills: async (id, amount = 1) => {
        const { medicines } = get()
        const medicine = medicines.find(m => m.id === id)
        if (!medicine) return false

        const newCount = Math.max(0, (medicine.pillsRemaining || 0) - amount)
        return get().updateMedicine(id, { pillsRemaining: newCount })
    },

    // Refill medicine
    refillMedicine: async (id, amount) => {
        const { medicines } = get()
        const medicine = medicines.find(m => m.id === id)
        if (!medicine) return false

        const newCount = (medicine.pillsRemaining || 0) + amount
        return get().updateMedicine(id, {
            pillsRemaining: newCount,
            totalPills: Math.max(medicine.totalPills || 0, newCount)
        })
    },

    // Get low stock medicines (below threshold)
    getLowStockMedicines: () => {
        const { medicines } = get()
        return medicines.filter(m =>
            (m.pillsRemaining || 0) <= (m.refillThreshold || 10)
        )
    },

    // Get medicines by time slot
    getMedicinesByTime: (time) => {
        const { medicines } = get()
        return medicines.filter(m => m.time === time)
    },

    // Get weekly medicine history from Firestore
    getWeeklyHistory: async () => {
        const user = auth.currentUser
        if (!user) return []

        try {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            const weekAgoTimestamp = Timestamp.fromDate(oneWeekAgo)

            const historyRef = collection(db, 'users', user.uid, 'medicineHistory')
            const q = query(
                historyRef,
                where('takenAt', '>=', weekAgoTimestamp),
                orderBy('takenAt', 'desc')
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                takenAt: doc.data().takenAt?.toDate?.() || doc.data().takenAt
            }))
        } catch (error) {
            console.error('Get weekly history error:', error)
            return []
        }
    },

    // Get patient history events from Firestore
    getPatientHistory: async () => {
        const user = auth.currentUser
        if (!user) return []

        try {
            const historyRef = collection(db, 'users', user.uid, 'patientHistory')
            const q = query(historyRef, orderBy('createdAt', 'desc'))

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || doc.data().date,
                createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
            }))
        } catch (error) {
            console.error('Get patient history error:', error)
            return []
        }
    }
}))
