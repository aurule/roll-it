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

describe("rolls", () => {
  it("is required", () => {
    const rolls_value = undefined

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toMatch("rolls")
  })

  it("is an integer", () => {
    const rolls_value = 1.5

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toMatch("whole number")
  })

  it("must be at least 1", () => {
    const rolls_value = 0

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toMatch("between")
  })

  it("must be at most 100", () => {
    const rolls_value = 101

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toMatch("between")
  })

  it.each([
    [1],
    [15],
    [100],
  ])("allows normal value %i", (val) => {
    const rolls_value = val

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).toBeFalsy()
  })
})

describe("modifier", () => {
  it("is optional", () => {
    const modifier_value = undefined

    const result = commonSchemas.modifier.validate(modifier_value)

    expect(schemaMessages(result)).not.toMatch("Modifier")
  })

  it("is an integer", () => {
    const modifier_value = 1.2

    const result = commonSchemas.modifier.validate(modifier_value)

    expect(schemaMessages(result)).toMatch("whole number")
  })
})
