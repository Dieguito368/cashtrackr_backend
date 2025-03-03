import type { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
} 

export const validateParameterBudgetId = async (req: Request, res: Response, next: NextFunction) =>  {
    await param('budgetId').isInt({ min: 0 }).withMessage('ID de presupuesto no válido').run(req)

    let errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }

    next();
}

export const validateBodyBudgetFields = async (req: Request, res: Response, next: NextFunction) => {
    await body('name').notEmpty().withMessage('El nombre del presupuesto no puede ir vacio').run(req);

    await body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacio')
        .isNumeric().withMessage('La cantidad del presupuesto debe ser un número')
        .custom(value => value > 0).withMessage('La cantidad del presupuesto debe ser mayor a 0').run(req);

    let errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }

    next();
} 

export const validateBudgetExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params;

        const budget = await Budget.findByPk(budgetId);

        if(!budget) {
            const error = new Error('Presupuesto no encontrado');

            res.status(404).json({ ok: false, message: error.message });

            return;
        }

        req.budget = budget;

        next();
    } catch (error) {
        console.log({ error: `Error al obtener el presupuesto: ${error.mesage}` });
            
        res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })        
    }
    
}