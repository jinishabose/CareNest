/**
 * Gemini 1.5 Flash Service for Prescription Scanning
 * Uses Google's Generative AI API to extract medicine information from prescription images
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

/**
 * Converts a File to base64 string
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
    })
}

/**
 * Extract medicine information from a prescription image using Gemini 1.5 Flash
 * @param {File} imageFile - The prescription image file
 * @returns {Promise<Array>} - Array of extracted medicines
 */
export async function extractPrescriptionData(imageFile) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
    }

    try {
        const base64Image = await fileToBase64(imageFile)
        const mimeType = imageFile.type || 'image/jpeg'

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: `You are a medical prescription analyzer. Analyze this prescription image and extract all medicine information.

Return ONLY a valid JSON array with the following structure for each medicine found:
[
  {
    "name": "Medicine Name",
    "dosage": "Dosage (e.g., 500mg)",
    "frequency": "How often to take (e.g., Twice daily, Once daily)",
    "duration": "How long to take (e.g., 7 days, 1 month)",
    "instructions": "Special instructions if any (e.g., Take after meals)",
    "confidence": 85
  }
]

The confidence should be a number from 0-100 indicating how confident you are in the extraction.
If you cannot extract any medicines or the image is not a prescription, return an empty array: []
Do not include any markdown formatting or explanation, just the raw JSON array.`
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 32,
                topP: 1,
                maxOutputTokens: 4096,
            }
        }

        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Failed to analyze prescription')
        }

        const data = await response.json()

        // Extract the text response
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!textResponse) {
            throw new Error('No response from Gemini API')
        }

        // Parse the JSON response
        try {
            // Clean up the response in case it has markdown code blocks
            let cleanedResponse = textResponse.trim()
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.slice(7)
            }
            if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.slice(3)
            }
            if (cleanedResponse.endsWith('```')) {
                cleanedResponse = cleanedResponse.slice(0, -3)
            }

            const medicines = JSON.parse(cleanedResponse.trim())
            return Array.isArray(medicines) ? medicines : []
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', textResponse)
            throw new Error('Failed to parse prescription data')
        }

    } catch (error) {
        console.error('Prescription extraction error:', error)
        throw error
    }
}

/**
 * Validate if the API key is configured
 */
export function isGeminiConfigured() {
    return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'
}
