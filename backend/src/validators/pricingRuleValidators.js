import Joi from "joi";

export const createPricingRuleSchema = Joi.object({
  roomType: Joi.string().hex().length(24).required(),
  name: Joi.string().min(2).max(100).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  priceType: Joi.string().valid("fixed", "percentage").default("percentage"),
  value: Joi.number().required(),
  applyWeekend: Joi.boolean().default(false),
  applyHolidays: Joi.boolean().default(false)
}).unknown(false);

export const updatePricingRuleSchema = createPricingRuleSchema.fork(
  ["roomType", "name", "startDate", "endDate", "value"],
  (schema) => schema.optional()
).unknown(false);

