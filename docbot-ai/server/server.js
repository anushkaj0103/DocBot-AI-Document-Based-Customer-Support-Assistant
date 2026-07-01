import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { pdfText } from './lib/pdfLoader.js';
import errorHandler from './middleware/errorHandler.js';
import chatRouter from './routes/chat.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    pdfLoaded: Boolean(pdfText),
  });
});

app.use('/api/chat', chatRouter);
app.use(errorHandler);

const server = app.listen(port);

server.on('listening', () => {
  console.log(`[server] Listening on port ${port}`);
  console.log('[server] Press Ctrl+C to stop');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[server] Port ${port} is already in use. Another backend is already running.`
    );
    console.error('[server] Stop the other process first, or use a different PORT in .env');
  } else {
    console.error(`[server] Failed to start: ${err.message}`);
  }
  process.exit(1);
});
