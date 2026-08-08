import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getCategories);

router.post(
  '/',
  protect,
  admin,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    validate
  ],
  createCategory
);

router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
