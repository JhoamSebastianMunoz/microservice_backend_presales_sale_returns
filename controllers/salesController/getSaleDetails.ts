import { Request, Response } from 'express';
import SalesService from '../../services/salesService';
import axios from 'axios';
import DetailSaleDTO from '../../Dto/DtoSales/detailSaleDto';
import ProductDTO from '../../Dto/DtoSales/ProductDTO';

const getSaleDetails = async (req: Request, res: Response) => {
    try {
        const userRole = req.body.role;
        const userId = req.body.id_usuario;
        const { id_presale } = req.params;
        console.log('ID INGRESADO: ', id_presale);

        const result =
            userRole === "COLABORADOR"
                ? await SalesService.getSaleDetailsColaborador(id_presale, userId)
                : await SalesService.getSaleDetails(id_presale);

        if (!result) {
            res.status(404).json({ error: 'Venta no encontrada' });
            return;
        }

        console.log('RESPUESTA PRESALE: ', result);

        if (!result.id_cliente || !result.id_colaborador) {
            res.status(400).json({ error: 'Datos de la venta incompletos' });
            return;
        }

        // Obtener datos del cliente
        const client = await axios.get(`${process.env.CLIENT_SERVICE_URL}${result.id_cliente}`);
        console.log('CLIENTE: ', client.data);
        
        // Obtener datos del colaborador-usuario
        const user = await axios.get(`${process.env.USER_SERVICE_URL}${result.id_colaborador}`);
        console.log('USER: ', user.data);
        
        // Obtener datos de todos los productos
        const ids = result.detalle.map((d: DetailSaleDTO) => d.id_producto).join(',');
        const products = await axios.get(`${process.env.PRODUCT_SERVICE_URL}${ids}`);
        console.log('PRODUCTOS: ', products.data);
        
        // Construir la respuesta final
        res.status(200).json({
            id_preventa: result.id_preventa,
            cliente: {
                nombre: client.data.nombre_completo_cliente,
                direccion: client.data.direccion,
                telefono: client.data.telefono,
                razon_social: client.data.razon_social,
            },
            colaborador: {
                nombre: user.data.nombreCompleto,
            },
            productos: result.detalle.map((d: DetailSaleDTO) => {
                const producto = products.data.find((p: ProductDTO) => p.id_producto === d.id_producto);
                console.log('PRODUCTOS: result.DETALLE.MAP: ', producto);
                
                return {
                    nombre: producto?.nombre_producto || 'Producto no encontrado',
                    precio: d.precio_unitario || producto?.precio || 0,
                    cantidad: d.cantidad,
                    subtotal: d.subtotal,
                };
            }),
            total: result.total,
            estado: result.estado,
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

export default getSaleDetails;
