import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import { authenticate, authorizeAdmin } from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, fetchAllUsers);
router.get('/:id', authenticate, getUserById);
router.patch('/:id', authenticate, updateUser); // Note: using patch here instead of put for partial updates
router.delete('/:id', authenticate, deleteUser);

export default router;
