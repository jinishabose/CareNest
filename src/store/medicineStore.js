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
    serverTimestamp
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
    }
}))
