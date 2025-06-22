import express from 'express';
import { getCurrentUser, login, logout, register } from '../controllers/auth/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

router.use(authenticate, authorize(['ADMIN']));
router.get('/me', getCurrentUser);

export default router;
