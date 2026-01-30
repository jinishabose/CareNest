/**
 * Time Utilities for IST (Indian Standard Time)
 * This file contains all time-related helper functions
 */

/**
 * Get current date in IST
 * @returns {Date} Current date/time in IST
 */
export const getISTDate = () => {
    const now = new Date()
    const istOffset = 5.5 * 60 // IST is UTC+5:30 in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    return new Date(utc + (istOffset * 60000))
}

/**
 * Get current hour in IST (0-23)
 * @returns {number} Current hour in IST
 */
export const getISTHour = () => {
    return getISTDate().getHours()
}

/**
 * Get current minute in IST (0-59)
 * @returns {number} Current minute in IST
 */
export const getISTMinute = () => {
    return getISTDate().getMinutes()
}

/**
 * Get greeting based on current IST time
 * @returns {string} Appropriate greeting message
 */
export const getGreeting = () => {
    const hour = getISTHour()
    if (hour >= 5 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    if (hour >= 17 && hour < 21) return 'Good Evening'
    return 'Good Night'
}

/**
 * Format time to display string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (date) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })
}

/**
 * Format date to display string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "30 Jan 2026")
 */
export const formatDate = (date) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
}

/**
 * Get formatted current time in IST for display
 * @returns {string} Formatted time with IST suffix
 */
export const getCurrentTimeDisplay = () => {
    const istTime = getISTDate()
    const hours = istTime.getHours()
    const minutes = istTime.getMinutes().toString().padStart(2, '0')
    const seconds = istTime.getSeconds().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12

    return `${displayHours}:${minutes}:${seconds} ${ampm} IST`
}
