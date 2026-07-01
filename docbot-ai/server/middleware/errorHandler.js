const STATUS_BY_CODE = {
  MISSING_QUESTION: 400,
  QUESTION_TOO_LONG: 400,
  PDF_LOAD_ERROR: 503,
  AI_ERROR: 502,
}

function getSafeMessage(err) {
  switch (err?.code) {
    case 'MISSING_QUESTION':
      return 'Please enter a question before sending.'
    case 'QUESTION_TOO_LONG':
      return 'Your question is too long. Please keep it under 500 characters.'
    case 'PDF_LOAD_ERROR':
      return 'The document is not available right now. Please try again later.'
    case 'AI_ERROR':
      return 'The assistant could not generate a response right now. Please try again.'
    default:
      return 'Something went wrong. Please try again later.'
  }
}

export default function errorHandler(err, req, res, next) {
  console.error(err)

  const code = err?.code || 'INTERNAL_SERVER_ERROR'
  const status = STATUS_BY_CODE[code] || 500
  const message = getSafeMessage(err)

  res.status(status).json({
    error: {
      code,
      message,
    },
  })
}
