import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorHandler = (err, req, res, next) => {
  const dateTime = new Date();
  // En Vercel solo se puede escribir en /tmp; si falla, el error queda en consola.
  const logFilePath = process.env.VERCEL
    ? path.join(os.tmpdir(), 'logs', 'error.log')
    : path.join(__dirname, '../../logs/error.log');
  const logMessage = `${dateTime.toISOString()} | ${req.method} ${req.url} | ${err.message} | ${err.stack}\n`;

  try {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFile(logFilePath, logMessage, (fsErr) => {
      if (fsErr) console.error('Failed to write into log file:', fsErr);
    });
  } catch (fsErr) {
    console.error(logMessage, fsErr.message);
  }

  // No enviar respuesta si ya se envió
  if (!res.headersSent) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }

};

export default errorHandler;