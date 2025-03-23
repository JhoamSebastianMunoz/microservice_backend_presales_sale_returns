import { Request, Response } from "express";
import ReportsService from "../../services/reportsService";


let topClientes = async (req: Request, res: Response): Promise<void> => {
        try {
            const fechaInicio = req.query.fechaInicio as string;
            const fechaFin = req.query.fechaFin as string;
            // const limite = parseInt(req.query.limite as string) || 10;
            const clientesData = await ReportsService.getTopClientes(fechaInicio, fechaFin);

            // if (isNaN(limite) || limite <= 0) {
            //     res.status(400).json({ error: "El límite debe ser un número entero positivo" });
            // }

            if (!clientesData || clientesData.length === 0) {
                res.status(404).json({ error: 'No se encontraron ventas en el período especificado' });
            }
            
            res.json(clientesData);
        }catch(error:any) {
            console.error('Error en reporte de top productos vendidos:', error);
            res.status(500).json({ 
                error: 'Error al generar reporte de top productos', 
                details: error.message 
            });
        }
}

export default topClientes;
