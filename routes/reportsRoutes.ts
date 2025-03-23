import express from 'express';
import ventasPorColaborador from '../controllers/reportsController.ts/ventasPorColaboradorController';
import topClientes from '../controllers/reportsController.ts/topClientesController';
import topProductosVendidos from '../controllers/reportsController.ts/topProductosVendidosController';

const router = express.Router();

// Ventas por colaborador
router.get('/ventas-por-colaborador', ventasPorColaborador);

// Top 10 clientes
router.get('/top-clientes', topClientes);

// Top productos más vendidos
router.get('/top-productos-vendidos', topProductosVendidos);

// Top productos menos vendidos
router.get('/top-productos-menos-vendidos', (req, res) => {
    req.query.orden = 'asc';
    topProductosVendidos(req, res);
});

export default router;