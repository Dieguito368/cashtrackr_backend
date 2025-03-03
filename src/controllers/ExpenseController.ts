import type { Request, Response } from 'express'
import Expense from '../models/Expense';

export class ExpenseController {
    static createExpense = async (req: Request, res: Response) => {
        try {
            const expense = new Expense(req.body);

            expense.bugetId = req.budget.id;

            await expense.save();
            
            res.status(201).send({ ok: true, mesage: 'Gasto creado correctamente' })
        } catch (error) {
            console.log({ error: `Error al crear el gasto: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }
  
    static getExpenseById = async (req: Request, res: Response) => {

    }

    static updateExpense = async (req: Request, res: Response) => {
 
    }
  
    static deleteExpense = async (req: Request, res: Response) => {

    }
}