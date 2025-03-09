import type { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';

export class BudgetController {
    static getAllBudgets = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                where: { userId: req.user.id },
                order: [ [ 'createdAt', 'DESC' ] ],
            });
            
            res.status(200).json({ ok: true, budgets });
        } catch (error) {
            console.log({ error: `Error al obtener los presupuestos: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }

    static createBudget = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body);

            budget.userId = req.user.id; 

            await budget.save();
            
            res.status(201).json({ ok: true, mesage: 'Presupuesto creado correctamente' });
        } catch (error) {
            console.log({ error: `Error al crear el presupuesto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
    
    static getBudgetById = async (req: Request, res: Response) => {
        try {
            const budget = await Budget.findByPk(req.budget.id, {
                include: [ Expense ]
            });
            
            res.status(200).json({ ok: true, budget });
        } catch (error) {
            console.log({ error: `Error al obtener el full presupuesto: ${error.mesage}` });
                
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });  
        }
    }

    static updateBudget = async (req: Request, res: Response) => {
        try {
            await req.budget.update(req.body);

            res.status(200).json({ ok: true, message: 'Presupuesto actualizado correctamente' });
        } catch (error) {
            console.log({ error: `Error al actualizar el presupuesto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }

    static deleteBudget = async (req: Request, res: Response) => {
        try {
            await req.budget.destroy();

            res.status(200).json({ ok: true, message: 'Presupuesto eliminado correctamente' });
        } catch (error) {
            console.log({ error: `Error al eliminar el presupuesto: ${error.mesage}` });
            
            res.status(500).json({ ok: false, mesage: '!Ocurrio un error en el servidor!' });
        }
    }
}