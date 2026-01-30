/**
 * Notification Utilities
 * Helper functions for medicine and appointment notifications
 */

import { getISTDate, getISTHour, isSameDay } from './timeUtils'

/**
 * Parse time string to 24-hour decimal format
 * Supports formats: "8:00 AM", "14:00", "2:00 PM", "morning", "afternoon", etc.
 * 
 * @param {string} timeStr - Time string to parse
 * @returns {number|null} Hours in decimal (e.g., 14.5 for 2:30 PM) or null if invalid
 * 
 * @example
 * parseTimeString("8:00 AM")  // returns 8
 * parseTimeString("2:30 PM")  // returns 14.5
 * parseTimeString("morning")  // returns 8
 */
export const parseTimeString = (timeStr) => {
    if (!timeStr) return null

    // Handle slot names (morning, afternoon, evening, night)
    const slotMap = {
        'morning': 8,      // 8 AM
        'afternoon': 14,   // 2 PM
        'evening': 20,     // 8 PM
        'night': 21        // 9 PM
    }

    const lowerTime = timeStr.toLowerCase().trim()
    if (slotMap[lowerTime] !== undefined) {
        return slotMap[lowerTime]
    }

    // Parse time strings like "8:00 AM", "14:00", "2:00 PM"
    const timeRegex = /(\d{1,2}):?(\d{0,2})?\s*(am|pm)?/i
    const match = timeStr.match(timeRegex)

    if (!match) return null

    let hours = parseInt(match[1], 10)
    const minutes = match[2] ? parseInt(match[2], 10) : 0
    const period = match[3]?.toLowerCase()

    // Convert to 24-hour format
    if (period === 'pm' && hours < 12) {
        hours += 12
    } else if (period === 'am' && hours === 12) {
        hours = 0
    }

    return hours + (minutes / 60) // Return as decimal hours
}

/**
 * Check if a scheduled time has passed (in IST)
 * 
 * @param {string} timeStr - Scheduled time string (e.g., "8:00 AM")
 * @returns {boolean} True if the time has passed today
 * 
 * @example
 * // At 11:00 PM:
 * hasTimePassed("8:00 AM")   // true
 * hasTimePassed("11:30 PM")  // false
 */
export const hasTimePassed = (timeStr) => {
    const scheduledHour = parseTimeString(timeStr)
    if (scheduledHour === null) return false

    const istDate = getISTDate()
    const currentDecimalHour = istDate.getHours() + (istDate.getMinutes() / 60)

    // Time has passed if current time is greater than scheduled time
    return currentDecimalHour > scheduledHour
}

/**
 * Get a friendly time period label from a time string
 * 
 * @param {string} timeStr - Time string to categorize
 * @returns {string} Period label (Morning, Afternoon, Evening, Night)
 * 
 * @example
 * getTimeLabel("8:00 AM")  // "Morning"
 * getTimeLabel("2:00 PM")  // "Afternoon"
 * getTimeLabel("8:00 PM")  // "Evening"
 */
export const getTimeLabel = (timeStr) => {
    if (!timeStr) return 'Scheduled'

    const scheduledHour = parseTimeString(timeStr)
    if (scheduledHour === null) return timeStr

    if (scheduledHour >= 5 && scheduledHour < 12) return 'Morning'
    if (scheduledHour >= 12 && scheduledHour < 17) return 'Afternoon'
    if (scheduledHour >= 17 && scheduledHour < 21) return 'Evening'
    return 'Night'
}

/**
 * Check if a medicine was taken today
 * 
 * @param {Object} medicine - Medicine object with lastTaken property
 * @returns {boolean} True if medicine was taken today
 */
export const wasTakenToday = (medicine) => {
    if (!medicine.lastTaken) return false

    // Handle Firestore Timestamp or Date
    const lastTaken = medicine.lastTaken?.toDate
        ? medicine.lastTaken.toDate()
        : new Date(medicine.lastTaken)

    const todayIST = getISTDate()

    return isSameDay(lastTaken, todayIST)
}

/**
 * Check if a medicine is missed (time passed and not taken today)
 * 
 * @param {Object} medicine - Medicine object with time and lastTaken properties
 * @returns {boolean} True if medicine is missed
 */
export const isMedicineMissed = (medicine) => {
    const timeStr = medicine.time || medicine.scheduledTime
    if (!timeStr) return false

    return hasTimePassed(timeStr) && !wasTakenToday(medicine)
}

/**
 * Check if medicine stock is low
 * 
 * @param {Object} medicine - Medicine object with pillsRemaining and refillThreshold
 * @returns {boolean} True if stock is low
 */
export const isLowStock = (medicine) => {
    const pills = medicine.pillsRemaining || 0
    const threshold = medicine.refillThreshold || 10
    return pills <= threshold
}

/**
 * Create a missed medicine notification object
 * 
 * @param {Object} medicine - Medicine object
 * @returns {Object} Notification object
 */
export const createMissedNotification = (medicine) => {
    const timeStr = medicine.time || medicine.scheduledTime
    const timeLabel = getTimeLabel(timeStr)

    return {
        id: medicine.id,
        name: medicine.name,
        dosage: medicine.dosage,
        time: timeStr,
        timeLabel: timeLabel,
        type: 'missed',
        priority: 2,
        icon: 'pill',
        message: `${timeLabel} pill missed: ${medicine.name} (${timeStr})`
    }
}

/**
 * Create a low stock notification object
 * 
 * @param {Object} medicine - Medicine object
 * @returns {Object} Notification object
 */
export const createLowStockNotification = (medicine) => {
    return {
        id: `low-stock-${medicine.id}`,
        name: medicine.name,
        type: 'low-stock',
        priority: 4,
        icon: 'alert',
        pillsRemaining: medicine.pillsRemaining || 0,
        message: `Low stock: ${medicine.name} (${medicine.pillsRemaining || 0} pills left)`
    }
}
