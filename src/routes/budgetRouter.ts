import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { ExpenseController } from "../controllers/ExpenseController";
import { validateParameterBudgetId, validateBodyBudgetFields, validateBudgetExists } from "../middleware/budget";
import { validateBodyExpenseFields, validateExpenseExists, validateParameterExpenseId } from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();


router.use(authenticate);

router.param('budgetId', validateParameterBudgetId);
router.param('budgetId', validateBudgetExists);

router.param('expenseId', validateParameterExpenseId);
router.param('expenseId', validateExpenseExists);

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

router.get('/:budgetId/expenses/:expenseId', ExpenseController.getExpenseById);

router.put('/:budgetId/expenses/:expenseId', 
    validateBodyExpenseFields,    
    ExpenseController.updateExpense
);

router.delete('/:budgetId/expenses/:expenseId', ExpenseController.deleteExpense);

export default router;