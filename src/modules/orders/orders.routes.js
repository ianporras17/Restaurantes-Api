import { Router } from 'express';
import { auth }   from '../../middlewares/authJWT.js';
import { createOrder, obtenerOrden } from './orders.controller.js';

const router = Router();

router.post('/', auth(), createOrder);
router.get("/:id", auth(), obtenerOrden);


export default router;