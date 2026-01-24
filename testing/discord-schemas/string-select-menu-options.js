import Joi from "joi"

export default Joi.array().items(
  Joi.object({
    label: Joi.string().required().min(1),
    value: Joi.string().required().min(1),
    description: Joi.string().optional().min(1),
    default: Joi.boolean().optional(),
  }),
)
