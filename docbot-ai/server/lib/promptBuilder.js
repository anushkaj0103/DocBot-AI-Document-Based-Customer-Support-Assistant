export function buildMessages(pdfText, question) {
  const system = [
    'You are a document assistant. You answer questions ONLY using the document provided below.',
    '',
    `<document>${pdfText}</document>`,
    '',
    'If the answer cannot be found in the document, respond with exactly: I could not find an answer to that question in the document.',
    '',
    'Do not use any knowledge outside the document.',
    '',
    'Do not include markdown formatting in your answers.',
  ].join('\n');

  const messages = [{ role: 'user', content: question }];

  return { system, messages };
}
