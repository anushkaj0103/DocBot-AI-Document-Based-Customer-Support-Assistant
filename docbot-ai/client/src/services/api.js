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
      throw new Error('Something went wrong. Please try again.')
    }

    return await response.json()
  } catch (err) {
    if (err.message === 'Something went wrong. Please try again.') {
      throw err
    }

    throw new Error(
      'Could not connect to the server. Please check your connection.'
    )
  }
}
