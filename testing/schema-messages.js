const { schemaErrors } = require("../util/schema-errors")

module.exports = {
  /**
   * Small testing helper to turn schema error results into a single string
   * @param  {object} schema_result Joi validation object
   * @return {str}                  String of all error details
   */
  schemaMessages(schema_result) {
    return schemaErrors(schema_result).join("\n")
  },
}
