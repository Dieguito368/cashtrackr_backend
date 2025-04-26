import { createRequest, createResponse } from "node-mocks-http";
import { validateBudgetExists } from "../../../middleware/budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/budgets";

jest.mock("../../../models/Budget", () => ({
    findByPk: jest.fn()
}));

describe("budget - validateBudgetExists", () => {
    it("Should handle a budget that does not exist or does not belong to a user", async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null);

        const req = createRequest({
            params: { budgetId: 10 },
            user: { id: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateBudgetExists(req, res, next);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ ok: false, message: "Presupuesto no encontrado" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Should proced to next middleware if budget exists", async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

        const req = createRequest({
            params: { budgetId: 1 },
            user: { id: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateBudgetExists(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.budget).toEqual(budgets[0]);
    });

    it("Should handle errors when getting a budget for your ID", async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error);

        const req = createRequest({
            params: { budgetId: 1 },
            user: { id: 1 }
        });

        const res = createResponse();

        const next = jest.fn();

        await validateBudgetExists(req, res, next);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ ok: false, message: "¡Ocurrió un error en el servidor!" });
        expect(next).not.toHaveBeenCalled();
    });
});