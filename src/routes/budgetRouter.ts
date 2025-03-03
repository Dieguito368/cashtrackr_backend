import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { body, param } from 'express-validator';
import { handleInputErrors } from "../middleware/validation";
import { validateParameterBudgetId } from "../middleware/budget";

const router = Router();

router.get('/', BudgetController.getAllBudgets);
router.post('/', 
    body('name').notEmpty().withMessage('El nombre del presupuesto no puede ir vacio'),
    body('ammount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacio')
        .isNumeric().withMessage('La cantidad del presupuesto debe ser un número')
        .custom(value => value > 0).withMessage('La cantidad del presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.createBudget
);
router.get('/:id', 
    validateParameterBudgetId,
    BudgetController.getBudgetById
);
router.put('/:id', 
    validateParameterBudgetId,
    body('name').notEmpty().withMessage('El nombre del presupuesto no puede ir vacio'),
    body('ammount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacio')
        .isNumeric().withMessage('La cantidad del presupuesto debe ser un número')
        .custom(value => value > 0).withMessage('La cantidad del presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.updateBudget
);
router.delete('/:id', 
    validateParameterBudgetId,
    BudgetController.deleteBudget
);

export default router;