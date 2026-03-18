
import express from 'express';
import { 
    fetchAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '#controllers/users.controller.js';  
const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser); // Note: using patch here instead of put for partial updates
router.delete('/:id', deleteUser);


export default router; 
