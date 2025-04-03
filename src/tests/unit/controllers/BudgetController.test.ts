import { createRequest, createResponse } from 'node-mocks-http';
import { BudgetController } from '../../../controllers/BudgetController';
import Budget from '../../../models/Budget';
import Expense from '../../../models/Expense';
import { budgets } from '../../mocks/budgets';

jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}));

describe("BudgetController.getAllBudgets", () => {
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
    
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updateBudgets = budgets.filter(budget => budget.userId === options.where.userId);
    
            return Promise.resolve(updateBudgets);
        });
    });

    it("Should retrieve 2 budgets for user with ID 1", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        });

        const res = createResponse();

        await BudgetController.getAllBudgets(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budgets).toHaveLength(2);
    });
    
    it("Should retrieve 1 budget for user with ID 2", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 2 }
        });

        const res = createResponse();

        await BudgetController.getAllBudgets(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budgets).toHaveLength(1);
    });

    it("Should retrieve 0 budgets for user with ID 10", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 10 }
        });

        const res = createResponse();

        await BudgetController.getAllBudgets(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budgets).toHaveLength(0);
    });

    it("Should handle errors when fetching budgets", async () => {
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 10 }
        });

        const res = createResponse();
        
        await BudgetController.getAllBudgets(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: "¡Ocurrió un error en el servidor!" });
    });
});

describe("BudgetController.createBudget", () => {
    it("Should create a new budget", async () => {
        const mockBudget = {
            save: jest.fn()
        };

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: { name: "Budget TEST", amount: 1000 }
        });

        const res = createResponse();

        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);

        await BudgetController.createBudget(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(201);
        expect(data).toEqual({ ok: true, message: "Presupuesto creado correctamente" });
        expect(mockBudget.save).toHaveBeenCalled();
        expect(mockBudget.save).toHaveBeenCalledTimes(1);
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    });

    it("Should handle errors when creating a budget", async () => {
        const mockBudget = {
            save: jest.fn()
        };

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: {
                name: "Presupuesto prueba",
                amount: 1000
            }
        });

        const res = createResponse();

        (Budget.create as jest.Mock).mockRejectedValue(new Error);

        await BudgetController.createBudget(req, res);
        
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '¡Ocurrió un error en el servidor!' });
        expect(mockBudget.save).not.toHaveBeenCalled();
        expect(Budget.create).toHaveBeenCalledWith(req.body);
    });
});

describe("BudgetController.getBudgetById", () => {
    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockReset();
    
        (Budget.findByPk as jest.Mock).mockImplementation(id => {
            const budget = budgets.filter(budget => budget.id === id)[0];
    
            return Promise.resolve(budget);
        });
    });

    it("Should return a budget with ID 1 and 3 expenses", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 1 }
        });

        const res = createResponse();

        await BudgetController.getBudgetById(req, res);
        
        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budget.expenses).toHaveLength(3);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledTimes(1);
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, { include: [ Expense ]});
    });

    it("Should return a budget with ID 2 and 2 expenses", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 2 }
        });

        const res = createResponse();

        await BudgetController.getBudgetById(req, res);
        
        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budget.expenses).toHaveLength(2);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledTimes(1);
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, { include: [ Expense ]});
    });

    it("Should return a budget with ID 3 and 0 expenses", async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 3 }
        });

        const res = createResponse();

        await BudgetController.getBudgetById(req, res);
        
        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).toBe(true);
        expect(data.ok).not.toBe(false);
        expect(data.budget.expenses).toHaveLength(0);
        expect(Budget.findByPk).toHaveBeenCalled();
        expect(Budget.findByPk).toHaveBeenCalledTimes(1);
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, { include: [ Expense ]});
    });

    it("Should handle errors when getting a budget for your ID", async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId',
            budget: { id: 3 }
        });

        const res = createResponse();

        await BudgetController.getBudgetById(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '¡Ocurrió un error en el servidor!' });
    });
});

describe("BudgetController.updateBudget", () => {
    it("Should update the budget with ID 1", async () => {
        const mockBudget = {
            update: jest.fn()
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget: mockBudget,
            body: {
                name: "Presupuesto actualizado",
                amount: 5000
            }
        });

        const res = createResponse();

        await BudgetController.updateBudget(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).not.toBe(false);
        expect(data).toEqual({ ok: true, message: "Presupuesto actualizado correctamente" });
        expect(mockBudget.update).toHaveBeenCalled();
        expect(mockBudget.update).toHaveBeenCalledTimes(1);
        expect(mockBudget.update).toHaveBeenCalledWith(req.body);
    });

    it("Should handle errors when updating a budget", async () => {
        const mockBudget = {
            update: jest.fn().mockRejectedValue(new Error)
        };

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget: mockBudget,
            body: {
                name: "Presupuesto actualizado",
                amount: 5000
            }
        });

        const res = createResponse();

        await BudgetController.updateBudget(req, res);
        
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '¡Ocurrió un error en el servidor!' });
    });
});

describe("BudgetController.deleteBudget", () => {
    it("Should delete the budget with ID 1", async () => {
        const mockBudget = {
            destroy: jest.fn()
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: mockBudget
        });

        const res = createResponse();

        await BudgetController.deleteBudget(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).not.toBe(false);
        expect(data).toEqual({ ok: true, message: "Presupuesto eliminado correctamente" });
        expect(mockBudget.destroy).toHaveBeenCalled();
        expect(mockBudget.destroy).toHaveBeenCalledTimes(1);
    });

    it("Should handle errors when deleting a budget", async () => {
        const mockBudget = {
            destroy: jest.fn().mockRejectedValue(new Error)
        };

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: mockBudget,
        });

        const res = createResponse();

        await BudgetController.deleteBudget(req, res);
        
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: "¡Ocurrió un error en el servidor!" });
    });
});