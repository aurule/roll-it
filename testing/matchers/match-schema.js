/**
 * Test whether the given value matches the given Joi schema
 *
 * @param  {any}     actual The value to test
 * @param  {Joi.any} schema The schema to test against
 * @return {obj}            Jest matcher result object
 */
function toMatchSchema(actual, schema) {
  const hint_options = {
    comment: "Joi schema validation",
    isNot: this.isNot,
    promise: this.promise,
  }

  const result = schema.validate(actual, { abortEarly: false, errors: { wrap: { label: "`" } } })
  const pass = result.error === undefined

  const message = pass
    ? () =>
        this.utils.matcherHint("toMatchSchema", undefined, undefined, hint_options) +
        "\n\n" +
        "Expected data not to match the schema"
    : () =>
        this.utils.matcherHint("toMatchSchema", undefined, undefined, hint_options) +
        "\n\n" +
        "Expected data to match the schema\n" +
        "Errors:" +
        result.error.details.map((d) => `\n- ${this.utils.printExpected(d.message)}`)

  return { actual, message, pass }
}

module.exports = {
  toMatchSchema,
}
