// server/routes/auth.js

import express from 'express';
import { register, login } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../validators/authValidators.js';

const router = express.Router();

// Register
router.post('/register', registerValidation, register);

// Login
router.post('/login', loginValidation, login);

export default router;
