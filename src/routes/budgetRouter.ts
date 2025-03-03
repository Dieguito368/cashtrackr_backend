import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";

const router = Router();

router.get('/', BudgetController.getAllBudgets);
router.post('/', BudgetController.createBudget);
router.get('/:id', BudgetController.getBudgetById);
router.put('/:id', BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;