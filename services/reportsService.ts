// src/services/StatisticsService.ts
import axios from 'axios';
import dotenv from 'dotenv';
import ReportsRepository from '../repositories/reportsRepository';
import VentaDetalleDTO from '../Dto/DtoReports/VentaDetalleDto';
import VentaColaboradorDTO from '../Dto/DtoReports/VentasColaboradorDto';

dotenv.config();

class ReportsService {
  static async getVentasPorColaborador(fechaInicio: string, fechaFin: string) {
    // Obtener las ventas desde la base de datos
    const ventas = await ReportsRepository.getVentasPorColaborador(fechaInicio, fechaFin);

    // Verificamos que haya ventas para consultar
    if (ventas.length === 0) {
        return [];
    }

    // Extraemos los IDs únicos de colaboradores
    const colaboradoresIds = [...new Set(ventas.map((venta: VentaColaboradorDTO) => venta.id_colaborador))];
    
    // Para almacenar la información de todos los colaboradores
    const colaboradoresInfo: Record<number, any> = {};
    
    // Realizamos consultas individuales para cada colaborador
    for (const idColaborador of colaboradoresIds) {
        try {
            // Verificamos que el ID sea numérico
            if (!idColaborador || isNaN(Number(idColaborador))) {
                console.log(`ID de colaborador inválido: ${idColaborador}`);
                continue;
            }
            
            // Quitamos la barra al final de la URL si existe
            let userServiceUrl = process.env.USER_SERVICE_URL || '';
            userServiceUrl = userServiceUrl.endsWith('/') 
                ? userServiceUrl.slice(0, -1) 
                : userServiceUrl;
            
            // Llamamos a la API para cada ID individual
            const endpoint = `${userServiceUrl}/${idColaborador}`;
            console.log(`Consultando colaborador con ID: ${idColaborador} - URL: ${endpoint}`);
            
            try {
                const { data } = await axios.get(endpoint);
                if (data) {
                    colaboradoresInfo[idColaborador] = data;
                    console.log(`Información obtenida para colaborador: ${idColaborador}`);
                }
            } catch (error: any) {
                console.error(`Error consultando colaborador ${idColaborador}: ${error.message}`);
                // Continuamos con el siguiente colaborador
            }
        } catch (error: any) {
            console.error(`Error procesando colaborador ${idColaborador}: ${error.message}`);
        }
    }

    // Mapear las ventas con los nombres de los colaboradores
    return ventas.map((venta: any) => {
        const colaborador = colaboradoresInfo[venta.id_colaborador];
        return {
            id_colaborador: venta.id_colaborador,
            nombre_colaborador: colaborador ? colaborador.nombreCompleto : "Desconocido",
            cantidad_ventas: venta.cantidad_ventas,
            total_ventas: venta.total_ventas
        };
    });
}

  static async getTopClientes(fechaInicio: string, fechaFin: string) {
    const clientes = await ReportsRepository.getTopClientes(fechaInicio, fechaFin);
    
    // Obtener datos adicionales de los clientes
    const clientesEnriquecidos = [];
    
    for (const cliente of clientes) {
      try {
        const clientData = await axios.get(`${process.env.CLIENT_SERVICE_URL}${cliente.id_cliente}`);
        
        clientesEnriquecidos.push({
          id_cliente: cliente.id_cliente,
          nombre_cliente: clientData.data.nombre_completo_cliente,
          total_compras: cliente.total_compras,
          monto_total: cliente.monto_total
        });
      } catch (error) {
        console.error("Error al obtener datos del cliente:", error);
        clientesEnriquecidos.push({
          id_cliente: cliente.id_cliente,
          nombre_cliente: "Desconocido",
          total_compras: cliente.total_compras,
          monto_total: cliente.monto_total
        });
      }
    }
    
    return clientesEnriquecidos;
  }

  static async getTopProductosVendidos(fechaInicio: string, fechaFin: string, limite: number = 10, orden: string = 'desc'): Promise<VentaDetalleDTO[]> {
    const productos = await ReportsRepository.getTopProductosVendidos(fechaInicio, fechaFin, limite, orden);

    const productosEnriquecidos: VentaDetalleDTO[] = [];
    const ids = productos.map(p => p.id_producto).join(',');

    try {
        const productosResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}${ids}`);
        const productosData: { id_producto: number; nombre_producto: string }[] = productosResponse.data;

        const productosMap: Record<number, { id_producto: number; nombre_producto: string }> = {};
        productosData.forEach(p => {
            productosMap[p.id_producto] = p;
        });

        for (const producto of productos) {
            const productoInfo = productosMap[producto.id_producto];

            productosEnriquecidos.push(
                new VentaDetalleDTO(
                    producto.id_producto.toString(), 
                    producto.cantidad_vendida.toString(), 
                    parseFloat(producto.monto_total.toString())
                )
            );
        }
    } catch (error) {
        console.error("Error al obtener datos de productos:", error);

        for (const producto of productos) {
            productosEnriquecidos.push(
                new VentaDetalleDTO(
                    producto.id_producto.toString(), 
                    producto.cantidad_vendida.toString(), 
                    parseFloat(producto.monto_total.toString())
                )
            );
        }
    }

    return productosEnriquecidos;
}
}

export default ReportsService;