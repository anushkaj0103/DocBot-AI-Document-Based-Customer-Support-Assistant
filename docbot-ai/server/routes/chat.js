import { Router } from 'express';
import { getUserErrorMessage } from '../lib/errorMessages.js';
import { pdfText } from '../lib/pdfLoader.js';
import { buildMessages } from '../lib/promptBuilder.js';
import { getAnswer } from '../lib/geminiClient.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { question } = req.body;

    if (
      question === undefined ||
      question === null ||
      typeof question !== 'string' ||
      question.trim() === ''
    ) {
      return res.status(400).json({
        error: {
          code: 'MISSING_QUESTION',
          message: getUserErrorMessage('MISSING_QUESTION'),
        },
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        error: {
          code: 'QUESTION_TOO_LONG',
          message: getUserErrorMessage('QUESTION_TOO_LONG'),
        },
      });
    }

    const { system, messages } = buildMessages(pdfText, question);
    const answer = await getAnswer(system, messages);
    const source = answer.includes('I could not find an answer') ? 'not_found' : 'document';

    return res.status(200).json({ answer, source });
  } catch (err) {
    next(err);
  }
});

export default router;
