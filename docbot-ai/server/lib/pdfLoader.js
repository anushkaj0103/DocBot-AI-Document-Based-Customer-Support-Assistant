import 'dotenv/config';
import fs from 'node:fs';
import { PDFParse } from 'pdf-parse';

function createPdfLoadError(message, cause) {
  const error = new Error(message);
  error.code = 'PDF_LOAD_ERROR';
  if (cause) {
    error.cause = cause;
  }
  return error;
}

const pdfPath = process.env.PDF_PATH;

if (!pdfPath) {
  throw createPdfLoadError('PDF_PATH environment variable is not set');
}

if (!fs.existsSync(pdfPath)) {
  throw createPdfLoadError(`PDF file not found at: ${pdfPath}`);
}

let pdfText;

try {
  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  pdfText = result.text;
  console.log(`[pdfLoader] PDF loaded: ${pdfText.length} characters`);
} catch (err) {
  if (err.code === 'PDF_LOAD_ERROR') {
    throw err;
  }
  throw createPdfLoadError(
    `Failed to parse PDF at ${pdfPath}: ${err.message}`,
    err
  );
}

export { pdfText };
