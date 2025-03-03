import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { ExpenseController } from "../controllers/ExpenseController";
import { validateParameterBudgetId, validateBodyBudgetFields, validateBudgetExist } from "../middleware/budget";
import { validateBodyExpenseFields } from "../middleware/expense";

const router = Router();


router.param('budgetId', validateParameterBudgetId);
router.param('budgetId', validateBudgetExist);

router.get('/', BudgetController.getAllBudgets);

router.post('/',
    validateBodyBudgetFields,
    BudgetController.createBudget
);

router.get('/:budgetId', BudgetController.getBudgetById);

router.put('/:budgetId', 
    validateBodyBudgetFields,
    BudgetController.updateBudget
);

router.delete('/:budgetId', BudgetController.deleteBudget);


/** Routes for expenses **/
router.post('/:budgetId/expenses', 
    validateBodyExpenseFields, 
    ExpenseController.createExpense
);

router.get('/:budgetId/expenses/:expenseId:', ExpenseController.getExpenseById);

router.put('/:budgetId/expenses/:expenseId', ExpenseController.updateExpense);

router.delete('/:budgetId/expenses/:expenseId', ExpenseController.deleteExpense);

export default router;