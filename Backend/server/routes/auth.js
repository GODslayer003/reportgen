import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../validators/authValidators.js';

const router = express.Router();

// Correct naming: /api/auth/register
router.post('/register', registerValidation, register);

// Correct naming: /api/auth/login
router.post('/login', loginValidation, login);

export default router;