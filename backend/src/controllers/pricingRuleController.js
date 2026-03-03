import PricingRule from "../models/PricingRule.js";
import {
  createPricingRuleSchema,
  updatePricingRuleSchema
} from "../validators/pricingRuleValidators.js";
import { buildPaginationOptions } from "../utils/pagination.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error("Validation error");
    err.statusCode = 400;
    err.details = error.details;
    throw err;
  }
  return value;
};

export const createPricingRule = async (req, res, next) => {
  try {
    const data = validate(createPricingRuleSchema, req.body);
    const rule = await PricingRule.create(data);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

export const getPricingRules = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = buildPaginationOptions(req);
    const filter = {};

    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }

    const [items, total] = await Promise.all([
      PricingRule.find(filter)
        .populate("roomType")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      PricingRule.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deletePricingRule = async (req, res, next) => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Pricing rule not found"
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

