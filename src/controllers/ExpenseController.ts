import type { Request, Response } from 'express'
import Expense from '../models/Expense';

export class ExpenseController {
    static createExpense = async (req: Request, res: Response) => {
        try {
            const expense = new Expense(req.body);

            expense.budgetId = req.budget.id;

            await expense.save();
            
            res.status(201).json({ ok: true, mesage: 'Gasto creado correctamente' });
        } catch (error) {
            console.log({ error: `Error al crear el gasto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
  
    static getExpenseById = async (req: Request, res: Response) => {
        res.status(200).json({ ok: true, expense: req.expense });
    }

    static updateExpense = async (req: Request, res: Response) => {
        try {
            await req.expense.update(req.body);

            res.status(200).json({ ok: true, message: 'Gasto actualizado correctamente' });
        } catch (error) {
            console.log({ error: `Error al actualizar el gasto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
  
    static deleteExpense = async (req: Request, res: Response) => {
        try {
            await req.expense.destroy();

            res.status(200).json({ ok: true, message: 'Gasto eliminado correctamente' });
        } catch (error) {
            console.log({ error: `Error al eliminar el gasto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
}