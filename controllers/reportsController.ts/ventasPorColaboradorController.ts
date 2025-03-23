// src/controllers/reports/ventasPorColaboradorController.ts
import { Request, Response } from "express";
import dotenv from 'dotenv';
import ReportsService from "../../services/reportsService";

dotenv.config();

const ventasPorColaborador = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
          res.status(400).json({ message: "Debe proporcionar fechaInicio y fechaFin en formato YYYY-MM-DD." });
          return;
      }

      const ventas = await ReportsService.getVentasPorColaborador(fechaInicio as string, fechaFin as string);

      res.json(ventas);
    } catch (error:any) {
        console.error('Error en reporte de ventas por colaborador:', error);
        res.status(500).json({ 
            error: 'Error al generar reporte de ventas por colaborador', 
            details: error.message 
        });
    }
};

export default ventasPorColaborador;