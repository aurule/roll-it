const Joi = require("joi")

module.exports = {
  description: Joi.string()
  .trim()
  .optional()
  .max(1500)
  .message("The description is too long. Keep it under 1500 characters."),
}
