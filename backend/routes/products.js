import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { 
  getAllProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);             
router.post('/', authenticate, authorize('superadmin'), upload, createProduct);
router.put('/:id', authenticate, authorize('admin','superadmin'), upload, updateProduct);
router.delete('/:id', authenticate, authorize('superadmin'), deleteProduct);

export default router;
