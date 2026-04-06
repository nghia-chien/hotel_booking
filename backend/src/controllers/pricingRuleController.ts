import { Request, Response, NextFunction } from 'express';
import PricingRule from '../models/PricingRule.js';
import { createPricingRuleSchema, updatePricingRuleSchema } from '../validators/pricingRuleValidators.js';
import { buildPaginationOptions } from '../utils/pagination.js';
import Joi from 'joi';

const validate = <T>(schema: Joi.Schema, data: unknown): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err: any = new Error('Validation error');
    err.statusCode = 400;
    err.details = error.details;
    throw err;
  }
  return value as T;
};

export const createPricingRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validate(createPricingRuleSchema, req.body);
    const rule = await PricingRule.create(data as any);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const getPricingRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);
    const filter: any = {};
    if (req.query.roomType) filter.roomType = req.query.roomType as string;

    const [items, total] = await Promise.all([
      PricingRule.find(filter).populate('roomType').sort(sort).skip(skip).limit(limit),
      PricingRule.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const deletePricingRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Pricing rule not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Re-export for completeness
export { updatePricingRuleSchema };
