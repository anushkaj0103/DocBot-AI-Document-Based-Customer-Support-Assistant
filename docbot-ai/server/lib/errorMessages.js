export const USER_ERROR_MESSAGES = {
  MISSING_QUESTION: 'Please enter a question before sending.',
  QUESTION_TOO_LONG: 'Your question is too long. Please keep it under 500 characters.',
  PDF_LOAD_ERROR: 'The document is not available right now. Please try again later.',
  AI_ERROR: 'The assistant could not generate a response right now. Please try again.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
};

export function getUserErrorMessage(code) {
  return USER_ERROR_MESSAGES[code] || USER_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
}
