module.exports = {
  /**
   * Extract the readable error messages from Joi validation results
   * @param  {object} schema_result Joi validation result
   * @return {str[]}                Array of error descriptions
   */
  schemaErrors(schema_result) {
    const errors = schema_result.error ?? { details: [] }
    return errors.details.map((d) => d.message)
  },
}
