// src/controllers/reports/topProductosVendidosController.ts
import { Request, Response } from "express";
import axios from "axios";
import dotenv from 'dotenv';
import PresaleRepository from "../../repositories/presaleRepository";
import VentaDetalleDTO from "../../Dto/DtoReports/VentaDetalleDto";
import ReportsService from "../../services/reportsService";

dotenv.config();

  
  interface Producto {
    id_producto: number;
    nombre_producto: string;
  }

const topProductosVendidos = async (req: Request, res: Response) => {
  try {
    const fechaInicio = req.query.fechaInicio as string || '2025-01-01';
    const fechaFin = req.query.fechaFin as string || new Date().toISOString().split('T')[0];
    // 1. Obtener todos los detalles de ventas confirmadas
    const rows: VentaDetalleDTO[] = await ReportsService.getTopProductosVendidos(fechaInicio, fechaFin);
    
    // 2. Agrupar ventas por producto
    const ventasPorProducto = new Map();
    
    // 3. Obtener datos de todos los productos a la vez (más eficiente)
    const idsProductos = [...new Set(rows.map(row => row.id_producto))];
    const idsString = idsProductos.join(',');
    const productosResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}${idsString}`);
    const productos = productosResponse.data;
    
    // 4. Creamos un mapa para acceder rápidamente a productos
    const productosMap: Record<number, Producto> = {};
    productos.forEach((p: Producto) => {
      productosMap[p.id_producto] = p;
    });
    
    // 5. Procesamos cada detalle de venta
    for (const row of rows) {
        const idProducto:any = row.id_producto;
        const producto = productosMap[idProducto];
        
        if (!ventasPorProducto.has(idProducto) && producto) {
          ventasPorProducto.set(idProducto, {
            id_producto: idProducto,
            nombre_producto: producto.nombre_producto,
            cantidad_vendida: 0,
            monto_total: 0
          });
        }
        
        if (ventasPorProducto.has(idProducto)) {
          const productoVenta = ventasPorProducto.get(idProducto)!;  // Se usa "!" para indicar que nunca será undefined
          productoVenta.cantidad_vendida += parseInt(row.cantidad.toString());
          productoVenta.monto_total += parseFloat(row.subtotal.toString());
        }
      }
  
    
    // 6. Convertir a array, ordenar y limitar
    const limite = parseInt(req.query.limite as string) || 10;
    const orden = (req.query.orden as string) === 'asc' ? 'asc' : 'desc';
    
    let resultado = Array.from(ventasPorProducto.values());
    
    if (orden === 'asc') {
      resultado.sort((a, b) => a.cantidad_vendida - b.cantidad_vendida);
    } else {
      resultado.sort((a, b) => b.cantidad_vendida - a.cantidad_vendida);
    }
    
    resultado = resultado.slice(0, limite);
    
    res.json(resultado);
    
  } catch (error:any) {
    console.error('Error en reporte de top productos vendidos:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de top productos', 
      details: error.message 
    });
  }
};

export default topProductosVendidos;