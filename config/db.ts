import mysql from 'mysql2';
import dotenv from "dotenv";

dotenv.config();

const sslConfig = process.env.DB_SSL === 'true'
  ? {
      ssl: {
        rejectUnauthorized: false
      }
    }
  : undefined;

// Definimos el tipo de configuración
type PoolConfig = mysql.PoolOptions & {
  ssl?: {
    rejectUnauthorized: boolean;
  };
};

// Creamos la configuración con el tipo correcto
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig?.ssl,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Creamos el pool con la configuración tipada
const db = mysql.createPool(poolConfig);

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Successfully connected to database");
  connection.release();
});

export default db.promise();