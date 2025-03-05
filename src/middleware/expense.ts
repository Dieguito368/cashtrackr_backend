import type { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Expense from "../models/Expense";

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
} 

export const validateParameterExpenseId = async (req: Request, res: Response, next: NextFunction) =>  {
    await param('expenseId').isInt({ min: 0 }).withMessage('ID de gasto no válido').run(req)

    let errors = validationResult(req);
        
    if(!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return 
    }

    next();
}

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

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params;

        const expense = await Expense.findByPk(expenseId);

        if(!expense) {
            const error = new Error('Gasto no encontrado');

            res.status(404).json({ ok: false, message: error.message });

            return;
        }

        req.expense = expense;

        next();
    } catch (error) {
        console.log({ error: `Error al obtener el gasto: ${error.mesage}` });
            
        res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })        
    }
    
}