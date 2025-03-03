import type { Request, Response } from 'express';
import Budget from '../models/Budget';

export class BudgetController {
    static getAllBudgets = async (req: Request, res: Response) => {

    }

    static createBudget = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body);

            await budget.save();
            
            res.status(201).send({ ok: true, mesage: 'Presupuesto creado correctamente' })
        } catch (error) {
            console.log(error);
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }

    static getBudgetById = async (req: Request, res: Response) => {

    }

    static updateBudget = async (req: Request, res: Response) => {

    }

    static deleteBudget = async (req: Request, res: Response) => {

    }
}