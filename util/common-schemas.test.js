const commonSchemas = require("../util/common-schemas")

const { schemaMessages } = require("../testing/schema-messages")

describe("description", () => {
  it("is optional", () => {
    const desc_string = undefined

    const result = commonSchemas.description.validate(desc_string, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).not.toMatch("description")
  })

  it("allows at most 1500 characters", () => {
    const desc_string = "x".repeat(2000)

    const result = commonSchemas.description.validate(desc_string, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toMatch("too long")
  })
})
