import Joi from "joi"

export default Joi.object({
  name: Joi.string().required(),
  inline: Joi.boolean().optional(),
  value: Joi.string().required(),
})
