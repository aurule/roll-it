module.exports = {
  /**
   * Small testing helper to turn schema error results into a single string
   *
   * @param  {object} schema_result Joi validation object
   * @return {str}                  String of all error details
   */
  schemaMessages(schema_result) {
    const errors = schema_result.error ?? { details: [] }
    return errors.details.map((d) => d.message).join("\n")
  },
}
