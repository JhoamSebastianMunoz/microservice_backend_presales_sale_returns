import express from "express";
import invoiceDownloadController from "../controllers/invoiceDownloadController/invoiceDownloadController";
import verifyToken from "../middleware/verifyToken";

const router = express.Router();

router.post('/invoiceDownload/:id_preventa', verifyToken, invoiceDownloadController);

export default router;