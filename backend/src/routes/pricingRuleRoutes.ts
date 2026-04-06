import express from 'express';
import { createPricingRule, getPricingRules, deletePricingRule } from '../controllers/pricingRuleController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin', 'staff'), getPricingRules);
router.post('/', authenticate, authorizeRoles('admin'), createPricingRule);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePricingRule);

export default router;
