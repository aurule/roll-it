const Joi = require("joi")

module.exports = {
  description: Joi.string()
    .trim()
    .optional()
    .max(1500)
    .message("The description is too long. Keep it under 1500 characters."),
  rolls: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(100)
    .default(1)
    .messages({
      "any.required": "There must be a value for rolls.",
      "number.integer": "Rolls must be a whole number.",
      "number.min": "Rolls must be between 1 and 100.",
      "number.max": "Rolls must be between 1 and 100.",
    }),
  modifier: Joi.number()
    .optional()
    .integer()
    .messages({
      "number.integer": "Modifier must be a whole number."
    }),
  until: Joi.number()
    .optional()
    .integer()
    .min(1)
    .max(100),
  pool: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(1000),
}
