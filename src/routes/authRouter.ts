import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";

const router = Router();

router.post('/create-account', 
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email')
        .notEmpty().withMessage('El email no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio')
        .isLength({ min: 8 }).withMessage('El password es muy corto, debe tener al menos 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account', 
    limiter,
    body('token')
        .notEmpty().withMessage('El token no puede ir vacio')
        .isInt().isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    handleInputErrors,
    AuthController.confirmAccount
);

router.post('/login', 
    limiter,
    body('email')
        .notEmpty().withMessage('El email no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('El password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
);

router.post('/forgot-password', 
    limiter,
    body('email')
        .notEmpty().withMessage('El email no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token', 
    limiter,
    body('token')
        .notEmpty().withMessage('El token no puede ir vacio')
        .isInt().isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    handleInputErrors,
    AuthController.validateToken
);

router.post('/reset-password/:token', 
    limiter,
    param('token')
        .notEmpty().withMessage('El token no puede ir vacio')
        .isInt().isLength({ min: 6, max: 6 }).withMessage('Token no válido'),
    handleInputErrors,
    body('password')
        .notEmpty().withMessage('El password no puede ir vacio')
        .isLength({ min: 8 }).withMessage('El password es muy corto, debe tener al menos 8 caracteres'),    
    handleInputErrors,
    AuthController.resetPasswordWithToken
);

export default router;