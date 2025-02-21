import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import dotenv from "dotenv";
import path from 'path';
import fs from 'fs';

// Importa tus rutas
import presaleRoutes from './routes/presaleRoutes';
import salesRoutes from './routes/salesRoutes';
import refundRoutes from './routes/refundRoutes';
import invoiceDownload from './routes/invoiceDownloadRoutes';

dotenv.config();

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Ruta de prueba básica
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Middleware para body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Swagger
try {
  const swaggerPath = path.join(__dirname, '../swagger.yaml');
  console.log('Swagger path:', swaggerPath);
  const swaggerDocument = YAML.load(swaggerPath);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error('Error loading Swagger:', error);
}

// Rutas de la API
app.use('/', presaleRoutes);
app.use('/', salesRoutes);
app.use('/', refundRoutes);
app.use('/', invoiceDownload);

const PORT = process.env.WEBSITES_PORT || process.env.PORT || 10000;

// Inicio del servidor con mejor manejo de errores
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;