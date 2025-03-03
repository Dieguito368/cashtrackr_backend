import type { Request, Response } from 'express';
import Budget from '../models/Budget';

export class BudgetController {
    static getAllBudgets = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({
                order: [
                    [ 'createdAt', 'DESC' ]
                ],

                // TODO: Filtrar por el usuario autenticado
            });
            
            res.status(200).send({ ok: true, budgets })
        } catch (error) {
            console.log({ error: `Error al obtener los presupuestos: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }

    static createBudget = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body);

            await budget.save();
            
            res.status(201).send({ ok: true, mesage: 'Presupuesto creado correctamente' })
        } catch (error) {
            console.log({ error: `Error al crear el presupuesto: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }
    
    static getBudgetById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const budget = await Budget.findByPk(id);

            if(!budget) {
                const error = new Error('Presupuesto no encontrado');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            res.status(200).send({ ok: true, budget })
        } catch (error) {
            console.log({ error: `Error al obtener el presupuesto: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }

    static updateBudget = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, ammount } = req.body;

            const budget = await Budget.findByPk(id);
            
            if(!budget) {
                const error = new Error('Presupuesto no encontrado');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            budget.name = name;
            budget.ammount = ammount;

            await budget.save();

            res.status(200).send({ ok: true, message: 'Presupuesto actualizado correctamente' })
        } catch (error) {
            console.log({ error: `Error al actualizar el presupuesto: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }

    static deleteBudget = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const budget = await Budget.findByPk(id);
            
            if(!budget) {
                const error = new Error('Presupuesto no encontrado');

                res.status(404).json({ ok: false, message: error.message });

                return;
            }

            await budget.destroy();

            res.status(200).send({ ok: true, message: 'Presupuesto eliminado correctamente' })
        } catch (error) {
            console.log({ error: `Error al eliminar el presupuesto: ${error.mesage}` });
            
            res.status(201).send({ ok: false, mesage: '!Ocurrio un error en el servidor!' })
        }
    }
}