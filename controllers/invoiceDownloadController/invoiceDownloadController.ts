import {Request, Response} from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

import PresaleService from '../../services/presaleService';
import DetailsPresaleDTO from '../../Dto/DtoPresale/detailsPresaleDto';
import DetailPresaleDTO from '../../Dto/DtoPresale/detailPresaleDto';
import ProductDTO from '../../Dto/DtoPresale/productDto';

let invoiceDownloadController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRole = req.body.role;
        const userId = req.body.id_usuario;
        const { id_preventa } = req.params;
        // console.log('ID INGRESADO: ', id_preventa);
        const result =
            userRole === "COLABORADOR"
                ? await PresaleService.get_idsPresaleColaborador(Number(id_preventa), userId)
                : await PresaleService.get_idsPresale(id_preventa);
        // const presale = await PresaleService.get_idsPresale(id_presale, userId);
        console.log('RESULR:', result);
        
        if (!result) {
            res.status(404).json({ error: 'Preventa no encontrada' });
            return;
        }

        const client = await axios.get(`${process.env.CLIENT_SERVICE_URL}${result.id_cliente}`);
        const ids = result.detalle.map((d: DetailsPresaleDTO) => d.id_producto).join(',');
        const products = await axios.get(`${process.env.PRODUCT_SERVICE_URL}${ids}`);
        
        const user = await axios.get(`${process.env.USER_SERVICE_URL}${result.id_colaborador}`);

        // Crea un documento PDF
        const doc = new PDFDocument();
        
        // Asegurarse de que el directorio existe
        const dirPath = path.join(__dirname, "../../public");
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const filePath = path.join(dirPath, "factura.pdf");
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // fecha actual
        const fechaActual = new Date();
        const fechaFormateada = `${fechaActual.getDate()}/${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()}`;

        // Encabezado del PDF
        doc.fontSize(24).fillColor("#F78220").text("FACTURA", 50, 50);
        
        // Descargar la imagen de la nube antes de usarla
        try {
            const logoUrl = "https://funcion141195adso.blob.core.windows.net/productimg/Tatsoft%20o.png?sp=r&st=2025-03-21T01:16:51Z&se=2025-03-21T09:16:51Z&spr=https&sv=2024-11-04&sr=b&sig=3xHYCkl5z3fA9gdUgzqeKE2PAodDgsGFw3aH%2FCdsYJ4%3D";
            const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
            doc.image(logoResponse.data, 450, 40, { width: 80 });
        } catch (logoError: any) {
            console.error("Error al cargar el logo:", logoError.message);
            // Continuar sin logo si hay error
        }

        // Datos de la empresa
        doc.fontSize(10).fillColor("black").text("Nombre Distribuidora", 50, 90);
        doc.text("Dirección Distribuidora", 50, 105);
        doc.text("tel.(606)752000", 50, 120);

        // Datos COLABORADOR
        doc.fontSize(12).fillColor("#F78220").text("COLABORADOR", 50, 160);
        doc.fillColor("black").fontSize(10).text(`${user.data.nombreCompleto}`, 50, 175);

        doc.fontSize(12).fillColor("#F78220").text("ENVIAR A", 220, 160);
        doc.fillColor("black").fontSize(10).text(`${client.data.nombre_completo_cliente}`, 220, 175);
        doc.text(`${client.data.razon_social}`, 220, 190);
        doc.text(`${client.data.direccion}`, 220, 205);
        doc.text(`${client.data.telefono}`, 220, 220);

        doc.fontSize(12).fillColor("#F78220").text("N° DE FACTURA", 420, 160);
        doc.fillColor("black").fontSize(10).text(`${result.id_preventa}`, 530, 162);

        doc.fontSize(12).fillColor("#F78220").text("FECHA", 420, 178);
        doc.fillColor("black").text(`${fechaFormateada}`, 486, 178);

        // Línea separadora
        doc.moveTo(50, 280).lineTo(550, 280).stroke();

        // Tabla de productos
        doc.fontSize(10).fillColor("#F78220").text("CANT.", 50, 300);
        doc.text("NOMBRE", 100, 300);
        doc.text("PRECIO", 350, 300);
        doc.text("SUBTOTAL", 450, 300);

        doc.fillColor("black");

        let y = 320;

        result.detalle.forEach((d: DetailPresaleDTO) => {
            const producto = products.data.find((p: ProductDTO) => p.id_producto === d.id_producto);
            console.log(producto);
            
            doc.text(`${d.cantidad}`.toString(), 50, y);
            doc.text(`${producto?.nombre_producto}`, 100, y, { width: 200 });
            doc.text(`${producto?.precio || '0.00'}`, 350, y);
            doc.text(`${d.subtotal}`, 450, y);
            y += 20;
        });

        // Resumen
        doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
        doc.fillColor("#F78220").text("Subtotal", 350, y + 20);
        doc.fillColor("black").text(`${result.total}`, 450, y + 20);

        doc.fillColor("#F78220").text("IVA 19%", 350, y + 40);
        const iva = Number(result.total) * 0.19;
        console.log('IVA:', iva);
        doc.fillColor("black").text(`${iva}`, 450, y + 40);
        const total = iva + Number(result.total);
        doc.fillColor("#F78220").fontSize(14).text("TOTAL", 350, y + 70);
        doc.fillColor("black").text(`${total}`, 450, y + 70);

        // Finalizar PDF y esperar a que se escriba en disco
        doc.end();

        writeStream.on("finish", () => {
            // Enviar el archivo PDF como descarga con nombre personalizado
            const nombreArchivo = `factura_${result.id_preventa}_${fechaFormateada.replace(/\//g, '-')}.pdf`;
            res.download(filePath, nombreArchivo, (err) => {
                if (err) {
                    console.error("Error al descargar el archivo:", err);
                    res.status(500).send("Error al descargar el archivo");
                }
            });
        });
        } catch (error) {
            console.log(error);
            if (!res.headersSent) {
                res.status(500).send("Error en el servidor");
            }
        }
}

export default invoiceDownloadController;