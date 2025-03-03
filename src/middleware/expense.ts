import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const validateBodyExpenseFields = async (req: Request, res: Response, next: NextFunction) => {
    await body('name').notEmpty().withMessage('El nombre del gasto no puede ir vacio').run(req);

    await body('amount')
        .notEmpty().withMessage('La cantidad del gasto no puede ir vacio')
        .isNumeric().withMessage('La cantidad del presupuesto debe ser un número')
        .custom(value => value > 0).withMessage('La cantidad del presupuesto debe ser mayor a 0').run(req);

    let errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }

    next();
} 