import {
  USER_ERROR_MESSAGES,
  getUserErrorMessage,
} from '../constants/errorMessages.js'

export async function sendQuestion(question) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      }
    )

    if (!response.ok) {
      let message = USER_ERROR_MESSAGES.GENERIC_ERROR

      try {
        const errorBody = await response.json()
        if (errorBody?.error?.code) {
          message = getUserErrorMessage(errorBody.error.code)
        }
      } catch {
        // Keep the default message if the error body is not JSON.
      }

      throw new Error(message)
    }

    return await response.json()
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(USER_ERROR_MESSAGES.NETWORK_ERROR)
    }

    if (err instanceof Error && err.message) {
      throw err
    }

    throw new Error(USER_ERROR_MESSAGES.NETWORK_ERROR)
  }
}
