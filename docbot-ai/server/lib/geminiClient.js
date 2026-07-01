import 'dotenv/config';

const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export async function getAnswer(system, messages) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('Gemini API key is not configured');
    error.code = 'AI_ERROR';
    throw error;
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const error = new Error(`Gemini API request failed with status ${response.status}`);
    error.code = 'AI_ERROR';
    throw error;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const error = new Error('Gemini API returned an empty response');
    error.code = 'AI_ERROR';
    throw error;
  }

  return text;
}
