import express from 'express';
import bodyParser from 'body-parser';
import YAML from 'yamljs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import dotenv from "dotenv";

import presaleRoutes from './routes/presaleRoutes';
import salesRoutes from './routes/salesRoutes';
import refundRoutes from './routes/refundRoutes';
import invoiceDownload from './routes/invoiceDownloadRoutes';


dotenv.config();

const app = express().use(bodyParser.json());

//verificar si funciona el despliegue
app.get("/", (req, res) => {
  res.send("Backend en funcionamiento");
});

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));;

// Montar la documentación Swagger en la ruta `/api-docs`
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/', presaleRoutes);
app.use('/', salesRoutes);
app.use('/', refundRoutes);
app.use('/', invoiceDownload);

const PORT = process.env.WEBSITES_PORT || process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto: ", PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});