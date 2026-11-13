// Debe ir primero: app.js lee FRONT_APP_URL (CORS) al importarse.
import 'dotenv/config';
import dbConnection from './src/config/database.js';
import setupGlobalErrorHandlers from './src/middlewares/globalErrorHandler.js';
import initializeData from './src/config/initializeData.js';
import app from './app.js';

setupGlobalErrorHandlers();

const startServer = async () => {
  await dbConnection();

  if (process.env.INITIAL_DATA === "development") {
    console.log("Development environment, creating mocking data...");
    await initializeData();
  }

  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
};

startServer();
