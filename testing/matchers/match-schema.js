/**
 * Test whether the given value matches the given Joi schema
 *
 * @param  {any}     actual The value to test
 * @param  {Joi.any} schema The schema to test against
 * @return {obj}            Jest matcher result object
 */
function toMatchSchema(actual, schema) {
  const result = schema.validate(actual, { errors: { wrap: { label: "`" } } })

  if (result.error === undefined) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(actual)} not to match the schema. Errors:\n${result.error.details.map(d => `- ${this.utils.printExpected(d.message)}`)}`,
      pass: true,
    }
  } else {
    return {
      message: () =>
        `expected ${this.utils.printReceived(actual)} to match the schema. Errors:\n${result.error.details.map(d => `- ${this.utils.printExpected(d.message)}`)}`,
      pass: false,
    }
  }
}

module.exports = {
  toMatchSchema,
}
