import 'dotenv/config';

const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

function createAiError(cause) {
  const error = new Error('AI provider request failed');
  error.code = 'AI_ERROR';
  if (cause) {
    error.cause = cause;
  }
  return error;
}

export async function getAnswer(system, messages) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw createAiError();
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    let providerMessage = '';
    try {
      const errorBody = await response.json();
      providerMessage = errorBody?.error?.message || '';
    } catch {
      // Ignore JSON parse failures for error responses.
    }

    console.error(
      '[groqClient] Request failed:',
      response.status,
      providerMessage || 'No provider message'
    );
    throw createAiError();
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    console.error('[groqClient] Empty response from provider');
    throw createAiError();
  }

  return text;
}
