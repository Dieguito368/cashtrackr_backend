import { createRequest, createResponse } from "node-mocks-http";
import { validateExpenseExists } from "../../../middleware/expense";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
    findByPk: jest.fn()
}));

describe("Expense Middleware - validateBudgetExists", () => {
    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation(id => {
            const expense = expenses.filter( exp => exp.id === id)[0] ?? null;

            return Promise.resolve(expense);
        });
    });

    it("Should handle a expense that does not exist or does not belong to a budget", async () => {
        const req = createRequest({
            params: { expenseId: 120 },
            budget: { id: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        const data = res._getJSONData();
        
        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ ok: false, message: "Gasto no encontrado" });
        expect(data.ok).not.toBe(true);
        expect(next).not.toHaveBeenCalled();
    });

    it("Should proced to next middleware if expense exists", async () => {
        const req = createRequest({
            params: { expenseId: 1 },
            budget: { id: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.expense).toEqual(expenses[0]);
    });

    it("Should handle errors when getting a expense for your ID", async () => {
        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            params: { expenseId: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateExpenseExists(req, res, next);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(500);
        expect(res.statusCode).not.toBe(200);
        expect(data).toEqual({ ok: false, message: "¡Ocurrió un error en el servidor!" });
        expect(data.ok).not.toBe(true);
        expect(next).not.toHaveBeenCalled();
    });
});