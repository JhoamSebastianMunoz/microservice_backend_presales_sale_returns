// src/repositories/StatisticsRepository.ts
import { RowDataPacket } from "mysql2";
import db from "../config/db";
import VentaColaboradorDTO from "../Dto/DtoReports/VentasColaboradorDto";

class ReportsRepository {
  static async getVentasPorColaborador(fechaInicio: string, fechaFin: string) {
    const query = `
        SELECT 
            p.id_colaborador,
            COUNT(p.id_preventa) AS cantidad_ventas,
            SUM(p.total) AS total_ventas
        FROM preventas p
        WHERE p.estado = 'Confirmada'
        AND p.fecha_confirmacion BETWEEN ? AND ?
        GROUP BY p.id_colaborador;
    `;
    const [results] = await db.query(query, [fechaInicio, fechaFin]);
    return results as VentaColaboradorDTO[];
  }

  static async getTopClientes(fechaInicio: string, fechaFin: string) {
    try {
        // Validar y convertir las fechas
        if (!fechaInicio || !fechaFin || isNaN(Date.parse(fechaInicio)) || isNaN(Date.parse(fechaFin))) {
            throw new Error("Formato de fecha inválido. Usa el formato YYYY-MM-DD.");
        }

        const fechaInicioAjustada = new Date(fechaInicio).toISOString().slice(0, 19).replace("T", " ");
        const fechaFinAjustada = new Date(fechaFin).toISOString().slice(0, 19).replace("T", " ");


        const sql = `
          SELECT 
            p.id_cliente,
            COUNT(DISTINCT p.id_preventa) AS total_compras,
            SUM(p.total) AS monto_total
          FROM preventas p
          WHERE p.estado = 'Confirmada'
          AND p.fecha_confirmacion BETWEEN ? AND ?
          GROUP BY p.id_cliente
          ORDER BY monto_total DESC
          LIMIT 10
        `;

        console.log("Consulta SQL:", sql);
        console.log("Parámetros:", [fechaInicioAjustada, fechaFinAjustada]);

        const [rows] = await db.execute<RowDataPacket[]>(sql, [
            fechaInicioAjustada,
            fechaFinAjustada
        ]);

        return rows;
    } catch (error) {
        console.error("Error en getTopClientes:", error);
        throw new Error("Error al obtener los clientes principales");
    }
}




  static async getTopProductosVendidos(fechaInicio: string, fechaFin: string, limite: number = 10, orden: string = 'desc') {
    if (!fechaInicio || !fechaFin || isNaN(Date.parse(fechaInicio)) || isNaN(Date.parse(fechaFin))) {
        throw new Error("Formato de fecha inválido. Usa el formato YYYY-MM-DD.");
    }

    const fechaInicioAjustada = new Date(fechaInicio).toISOString().slice(0, 19).replace("T", " ");
    const fechaFinAjustada = new Date(fechaFin).toISOString().slice(0, 19).replace("T", " ");

    const sql = `
      SELECT 
        dp.id_producto,
        SUM(dp.cantidad) AS cantidad_vendida,
        SUM(dp.subtotal) AS monto_total
      FROM detalle_preventa dp
      JOIN preventas p ON dp.id_preventa = p.id_preventa
      WHERE p.estado = 'Confirmada' 
      AND dp.estado = 'vendido'
      AND p.fecha_confirmacion BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY dp.id_producto
      ORDER BY cantidad_vendida ${orden === 'asc' ? 'ASC' : 'DESC'}
      LIMIT 10
    `;
    
    const [rows] = await db.execute<RowDataPacket[]>(sql, [fechaInicioAjustada, fechaFinAjustada]);
    return rows;
  }
}

export default ReportsRepository;