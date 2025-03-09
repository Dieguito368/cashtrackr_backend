import { createRequest, createResponse } from 'node-mocks-http';
import { BudgetController } from '../../controllers/BudgetController';
import Budget from '../../models/Budget';
import { budgets } from '../mocks/budgets';

jest.mock('../../models/Budget', () => ({
    findAll: jest.fn()
}));

beforeEach(() => {
    (Budget.findAll as jest.Mock).mockImplementation((options) => {
        (Budget.findAll as jest.Mock).mockReset();

        const updateBudgets = budgets.filter(budget => budget.userId === options.where.userId);

        return Promise.resolve(updateBudgets);
    });

});

describe("BudgetController.getALL", () => {
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
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 10 }
        });

        const res = createResponse();

        (Budget.findAll as jest.Mock).mockRejectedValue(new Error);
        
        await BudgetController.getAllBudgets(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '!Ocurrió un error en el servidor!' });
    });
});