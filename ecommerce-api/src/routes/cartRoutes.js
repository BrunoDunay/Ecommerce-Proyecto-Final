import express from 'express';
import {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
  removeFromCart
} from '../controllers/cartController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import Cart from '../models/cart.js';
import { selfOrAdmin, ownerOrAdmin, bindBodyUser } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

// Obtener todos los carritos (admin)
router.get('/cart', authMiddleware, isAdmin, getCarts);
// Obtener carrito por usuario
router.get('/cart/user/:id', authMiddleware, selfOrAdmin('id'), getCartByUser);

// Obtener carrito por ID
router.get('/cart/:id', authMiddleware, isAdmin, getCartById);



// Crear nuevo carrito
router.post('/cart', authMiddleware, bindBodyUser('user'), createCart);

// Agregar producto al carrito (función especial)
router.post('/cart/add-product', authMiddleware, bindBodyUser('userId'), addProductToCart);

router.delete(
  "/cart/remove-product",
  authMiddleware,
  bindBodyUser("userId"),
  removeFromCart
);

// Actualizar carrito completo
router.put('/cart/:id', authMiddleware, ownerOrAdmin(Cart), updateCart);

// Eliminar carrito
router.delete('/cart/:id', authMiddleware, ownerOrAdmin(Cart), deleteCart);

export default router;
