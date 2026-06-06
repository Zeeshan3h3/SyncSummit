import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
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
router.post('/', authenticate, authorize('admin','superadmin'), createProduct);
router.put('/:id', authenticate, authorize('admin','superadmin'), updateProduct);
router.delete('/:id', authenticate, authorize('superadmin'), deleteProduct);

export default router;
