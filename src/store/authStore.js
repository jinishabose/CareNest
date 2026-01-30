import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            // Initialize auth listener
            initAuth: () => {
                onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        // Get additional user data from Firestore (with error handling)
                        let userData = {}
                        try {
                            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                            userData = userDoc.exists() ? userDoc.data() : {}
                        } catch (error) {
                            console.warn('Could not fetch user data from Firestore:', error.message)
                            // Continue without Firestore data - user can still use the app
                        }

                        set({
                            user: {
                                id: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: firebaseUser.displayName || userData.name || firebaseUser.email?.split('@')[0],
                                role: userData.role || 'guardian',
                                avatar: firebaseUser.photoURL,
                                createdAt: userData.createdAt || new Date().toISOString()
                            },
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        })
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        })
                    }
                })
            },

            // Email/Password Login
            login: async (email, password, role) => {
                set({ isLoading: true, error: null })

                try {
                    const result = await signInWithEmailAndPassword(auth, email, password)

                    // Update role in Firestore if provided
                    if (role) {
                        await setDoc(doc(db, 'users', result.user.uid), { role }, { merge: true })
                    }

                    set({ isLoading: false })
                    return { success: true }
                } catch (error) {
                    const errorMessage = getAuthErrorMessage(error.code)
                    set({ isLoading: false, error: errorMessage })
                    return { success: false, error: errorMessage }
                }
            },

            // Email/Password Register
            register: async (name, email, password, role) => {
                set({ isLoading: true, error: null })

                try {
                    const result = await createUserWithEmailAndPassword(auth, email, password)

                    // Update display name
                    await updateProfile(result.user, { displayName: name })

                    // Store user data in Firestore (non-blocking - continue if fails)
                    try {
                        await setDoc(doc(db, 'users', result.user.uid), {
                            name,
                            email,
                            role: role || 'guardian',
                            createdAt: new Date().toISOString()
                        })
                    } catch (firestoreError) {
                        console.warn('Could not save user profile to Firestore:', firestoreError.message)
                        // User is still registered via Firebase Auth, just missing Firestore profile
                    }

                    set({ isLoading: false })
                    return { success: true }
                } catch (error) {
                    console.error('Registration error:', error)
                    const errorMessage = getAuthErrorMessage(error.code)
                    set({ isLoading: false, error: errorMessage })
                    return { success: false, error: errorMessage }
                }
            },

            // Google Sign In
            loginWithGoogle: async (role) => {
                set({ isLoading: true, error: null })

                try {
                    const result = await signInWithPopup(auth, googleProvider)

                    // Check if user exists in Firestore
                    const userDoc = await getDoc(doc(db, 'users', result.user.uid))

                    if (!userDoc.exists()) {
                        // New user - create profile
                        await setDoc(doc(db, 'users', result.user.uid), {
                            name: result.user.displayName,
                            email: result.user.email,
                            role: role || 'guardian',
                            createdAt: new Date().toISOString()
                        })
                    }

                    set({ isLoading: false })
                    return { success: true }
                } catch (error) {
                    const errorMessage = getAuthErrorMessage(error.code)
                    set({ isLoading: false, error: errorMessage })
                    return { success: false, error: errorMessage }
                }
            },

            // Logout
            logout: async () => {
                try {
                    await signOut(auth)
                    set({ user: null, isAuthenticated: false })
                } catch (error) {
                    console.error('Logout error:', error)
                }
            },

            // Update user profile
            updateUserProfile: async (updates) => {
                const { user } = get()
                if (!user) return

                try {
                    // Update Firestore
                    await setDoc(doc(db, 'users', user.id), updates, { merge: true })

                    set({ user: { ...user, ...updates } })
                } catch (error) {
                    console.error('Profile update error:', error)
                }
            },

            // Clear error
            clearError: () => set({ error: null })
        }),
        {
            name: 'carenest-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

// Helper function for error messages
function getAuthErrorMessage(code) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password is too weak (min 6 characters)',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/popup-closed-by-user': 'Sign-in popup was closed',
        'auth/network-request-failed': 'Network error. Please check your connection'
    }
    return errorMessages[code] || 'An error occurred. Please try again.'
}
