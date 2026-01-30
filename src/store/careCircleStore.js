import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCareCircleStore = create(
    persist(
        (set, get) => ({
            // Current active patient (for guardians managing multiple patients)
            activePatientId: null,

            // Patients linked to this guardian
            patients: [],

            // Guardians linked to this patient (if user is a patient)
            guardians: [],

            // Set active patient
            setActivePatient: (patientId) => {
                set({ activePatientId: patientId })
            },

            // Add a patient to care circle
            addPatient: (patient) => {
                const newPatient = {
                    id: `patient_${Date.now()}`,
                    ...patient,
                    linkedAt: new Date().toISOString()
                }
                set(state => ({
                    patients: [...state.patients, newPatient],
                    activePatientId: state.activePatientId || newPatient.id
                }))
                return newPatient
            },

            // Remove a patient from care circle
            removePatient: (patientId) => {
                set(state => {
                    const newPatients = state.patients.filter(p => p.id !== patientId)
                    return {
                        patients: newPatients,
                        activePatientId: state.activePatientId === patientId
                            ? newPatients[0]?.id || null
                            : state.activePatientId
                    }
                })
            },

            // Update patient info
            updatePatient: (patientId, updates) => {
                set(state => ({
                    patients: state.patients.map(p =>
                        p.id === patientId ? { ...p, ...updates } : p
                    )
                }))
            },

            // Add a guardian (for patients)
            addGuardian: (guardian) => {
                const newGuardian = {
                    id: `guardian_${Date.now()}`,
                    ...guardian,
                    linkedAt: new Date().toISOString()
                }
                set(state => ({
                    guardians: [...state.guardians, newGuardian]
                }))
                return newGuardian
            },

            // Remove a guardian
            removeGuardian: (guardianId) => {
                set(state => ({
                    guardians: state.guardians.filter(g => g.id !== guardianId)
                }))
            },

            // Get active patient details
            getActivePatient: () => {
                const { patients, activePatientId } = get()
                return patients.find(p => p.id === activePatientId) || null
            },

            // Switch between "Personal" and "Elderly" mode
            getPatientMode: () => {
                const { activePatientId, patients } = get()
                const activePatient = patients.find(p => p.id === activePatientId)
                return activePatient?.mode || 'personal'
            }
        }),
        {
            name: 'carenest-care-circle'
        }
    )
)
