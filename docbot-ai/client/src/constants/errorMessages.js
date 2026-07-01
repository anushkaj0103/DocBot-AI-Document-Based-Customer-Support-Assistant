export const USER_ERROR_MESSAGES = {
  EMPTY_QUESTION: 'Please enter a question.',
  MISSING_QUESTION: 'Please enter a question before sending.',
  QUESTION_TOO_LONG: 'Your question is too long. Please keep it under 500 characters.',
  PDF_LOAD_ERROR: 'The document is not available right now. Please try again later.',
  AI_ERROR: 'The assistant could not generate a response right now. Please try again.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Could not connect to the server. Please check your connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

export function getUserErrorMessage(code) {
  return USER_ERROR_MESSAGES[code] || USER_ERROR_MESSAGES.GENERIC_ERROR;
}
