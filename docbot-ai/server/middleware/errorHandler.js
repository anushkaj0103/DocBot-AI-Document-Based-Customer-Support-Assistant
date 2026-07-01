import { getUserErrorMessage } from '../lib/errorMessages.js';

const STATUS_BY_CODE = {
  MISSING_QUESTION: 400,
  QUESTION_TOO_LONG: 400,
  PDF_LOAD_ERROR: 503,
  AI_ERROR: 502,
};

export default function errorHandler(err, req, res, next) {
  console.error(err);

  const code = err?.code || 'INTERNAL_SERVER_ERROR';
  const status = STATUS_BY_CODE[code] || 500;
  const message = getUserErrorMessage(code);

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
