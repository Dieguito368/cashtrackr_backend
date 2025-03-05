import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

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

export default router;