import type { Request, Response, NextFunction } from "express";
import { param, validationResult } from 'express-validator';

export const validateParameterBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    await param('id')
        .isNumeric().withMessage('ID de presupuesto no válido')
        .custom(value => value >= 0).withMessage('ID de presupuesto no válido')
        .run(req)
    
    let errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }

    next();
}