// Entrada para Vercel (funciones sin servidor). En local se sigue usando server.js.
// Conecta a MongoDB en la primera petición; si la base está vacía, carga los datos de muestra una sola vez.
import mongoose from 'mongoose';
import dbConnection from '../src/config/database.js';
import initializeData from '../src/config/initializeData.js';
import app from '../app.js';

let ready = null;

const prepare = async () => {
  await dbConnection();
  if (mongoose.connection.readyState !== 1) throw new Error('MongoDB no está conectado');
  const users = await mongoose.connection.db.collection('users').countDocuments();
  if (users === 0) await initializeData();
};

export default async function handler(req, res) {
  try {
    ready ??= prepare().catch((error) => {
      ready = null;
      throw error;
    });
    await ready;
  } catch (error) {
    console.error('No se pudo preparar el servidor:', error.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'El servidor se está preparando. Intenta de nuevo en unos segundos.' }));
    return;
  }
  return app(req, res);
}
