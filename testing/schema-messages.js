module.exports = {
  schemaMessages(schema_result) {
    const errors = schema_result.error ?? {details: []}
    return errors.details.map(d => d.message).join("\n")
  }
}
