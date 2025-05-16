import { Router } from 'express';
import { searchProducts, searchByCategory, reindexProducts } from './search.controller.js';

const router = Router();

router.get('/products', searchProducts);                     // ?q=texto
router.get('/products/category/:category', searchByCategory);
router.post('/reindex', reindexProducts);

export default router;
