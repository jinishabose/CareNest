import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
    persist(
        (set, get) => ({
            // Notification preferences
            notifications: {
                reminders: true,
                refills: true,
                updates: false
            },

            // Appearance
            darkMode: false,

            // Update notification preferences
            setNotificationPreference: (key, value) => {
                set(state => ({
                    notifications: {
                        ...state.notifications,
                        [key]: value
                    }
                }))
            },

            // Toggle dark mode
            toggleDarkMode: () => {
                const newValue = !get().darkMode
                set({ darkMode: newValue })

                // Apply dark mode to document
                if (newValue) {
                    document.documentElement.classList.add('dark-mode')
                } else {
                    document.documentElement.classList.remove('dark-mode')
                }
            },

            // Set dark mode directly
            setDarkMode: (value) => {
                set({ darkMode: value })
                if (value) {
                    document.documentElement.classList.add('dark-mode')
                } else {
                    document.documentElement.classList.remove('dark-mode')
                }
            },

            // Initialize dark mode on app load
            initDarkMode: () => {
                const { darkMode } = get()
                if (darkMode) {
                    document.documentElement.classList.add('dark-mode')
                }
            }
        }),
        {
            name: 'carenest-settings',
            partialize: (state) => ({
                notifications: state.notifications,
                darkMode: state.darkMode
            })
        }
    )
)
