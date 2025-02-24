import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import dotenv from "dotenv";
import path from 'path';
import cors from 'cors';

// Rutas
import presaleRoutes from './routes/presaleRoutes';
import salesRoutes from './routes/salesRoutes';
import refundRoutes from './routes/refundRoutes';
import invoiceDownload from './routes/invoiceDownloadRoutes';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:10000',
  'https://backendpresalessalereturns-g2cghudwf2emhnf4.eastus-01.azurewebsites.net'
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas API
app.use('/', presaleRoutes);
app.use('/', salesRoutes);
app.use('/', refundRoutes);
app.use('/', invoiceDownload);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto: ${PORT}`);
}).on("error", (error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});

export default app;