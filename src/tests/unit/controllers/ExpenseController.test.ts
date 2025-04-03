import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpenseController } from "../../../controllers/ExpenseController";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
    create: jest.fn()
}));

describe("ExpenseController.createExpense", () => {
    it("Should create a new expense", async () => {
        const mockExpense = {
            save: jest.fn()
        };

        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            budget: { id: 1 },
            body: { name: "Expense TEST", amount: 500 }
        });

        const res = createResponse();

        (Expense.create as jest.Mock).mockResolvedValue(mockExpense);

        await ExpenseController.createExpense(req, res);

        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toEqual({ ok: true, message: "Gasto creado correctamente" });
        expect(mockExpense.save).toHaveBeenCalled();
        expect(mockExpense.save).toHaveBeenCalledTimes(1);
        expect(Expense.create).toHaveBeenCalledWith(req.body);
    });

    it("Should handle errors when creating a expense", async () => {
        const mockExpense = {
            save: jest.fn()
        };

        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            budget: { id: 1 },
            body: { name: "Expense TEST", amount: 500 }
        });

        const res = createResponse();

        (Expense.create as jest.Mock).mockRejectedValue(new Error);

        await ExpenseController.createExpense(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: "¡Ocurrió un error en el servidor!" });
        expect(mockExpense.save).not.toHaveBeenCalled();
        expect(Expense.create).toHaveBeenCalledWith(req.body);
    });
});

describe("ExpenseController.getExpenseById", () => {
    it("Should return a expense with ID 1", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets/:budgetId/expenses/expenseId",
            expense: expenses[1]
        });

        const res = createResponse();

        await ExpenseController.getExpenseById(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data).toEqual({ ok: true, expense: expenses[1] });
        expect(data.ok).not.toBe(false);
    });
});

describe("ExpenseController.updateExpense", () => {
    it("Should update the expense with ID 1", async () => {
        const mockExpense = {
            ...expenses[0],
            update: jest.fn()
        }

        const req = createRequest({
            method: "PUT",
            url: "/api/budgets/:budgetId/expenses/expenseId",
            expense: mockExpense,
            body: { name: "Updated Expense TEST", amount: 300 }
        });

        const res = createResponse();

        await ExpenseController.updateExpense(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).not.toBe(false);
        expect(data).toEqual({ ok: true, message: "Gasto actualizado correctamente" });
        expect(mockExpense.update).toHaveBeenCalled();
        expect(mockExpense.update).toHaveBeenCalledTimes(1);
        expect(mockExpense.update).toHaveBeenCalledWith(req.body);
    });

    it("Should handle errors when updating a expense", async () => {
        const mockExpense = {
            ...expenses[0],
            update: jest.fn().mockRejectedValue(new Error)
        };

        const req = createRequest({
            method: 'PUT',
            url: "/api/budgets/:budgetId/expenses/expenseId",
            expense: mockExpense,
            body: { name: "Updated Expense TEST", amount: 300 }
        });

        const res = createResponse();

        await ExpenseController.updateExpense(req, res);
        
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '¡Ocurrió un error en el servidor!' });
    });
});

describe("ExpenseController.deleteExpense", () => {
    it("Should delete the expense with ID 1", async () => {
        const mockExpense = {
            ...expenses[0],
            destroy: jest.fn()
        }

        const req = createRequest({
            method: "DELETE",
            url: "/api/budgets/:budgetId/expenses/expenseId",
            expense: mockExpense
        });

        const res = createResponse();

        await ExpenseController.deleteExpense(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(data.ok).not.toBe(false);
        expect(data).toEqual({ ok: true, message: "Gasto eliminado correctamente" });
        expect(mockExpense.destroy).toHaveBeenCalled();
        expect(mockExpense.destroy).toHaveBeenCalledTimes(1);
    });

    it("Should handle errors when deleting a expense", async () => {
        const mockExpense = {
            ...expenses[0],
            destroy: jest.fn().mockRejectedValue(new Error)
        };

        const req = createRequest({
            method: 'PUT',
            url: "/api/budgets/:budgetId/expenses/expenseId",
            expense: mockExpense
        });

        const res = createResponse();

        await ExpenseController.deleteExpense(req, res);
        
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: '¡Ocurrió un error en el servidor!' });
    });
});
