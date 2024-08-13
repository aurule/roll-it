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
  it("is optional", () => {
    const rolls_value = undefined

    const result = commonSchemas.rolls.validate(rolls_value, {
      abortEarly: false,
    })

    expect(schemaMessages(result)).not.toMatch("rolls")
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

  it.each([[1], [15], [100]])("allows normal value %i", (val) => {
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

describe("until", () => {
  const until_schema = commonSchemas.until

  it("is optional", () => {
    const result = until_schema.validate()

    expect(result.error).toBeFalsy()
  })

  it("is an int", () => {
    const result = until_schema.validate(5.5)

    expect(result.error).toBeTruthy()
  })

  it("min of 1", () => {
    const result = until_schema.validate(0)

    expect(result.error).toBeTruthy()
  })

  it("max of 100", () => {
    const result = until_schema.validate(101)

    expect(result.error).toBeTruthy()
  })

  it("accepts expected values", () => {
    const result = until_schema.validate(8)

    expect(result.error).toBeFalsy()
  })
})

describe("pool", () => {
  const pool_schema = commonSchemas.pool

  it("is required", () => {
    const result = pool_schema.validate()

    expect(result.error).toBeTruthy()
  })

  it("is an int", () => {
    const result = pool_schema.validate(4.2)

    expect(result.error).toBeTruthy()
  })

  it("min of zero", () => {
    const result = pool_schema.validate(-1)

    expect(result.error).toBeTruthy()
  })

  it("max of 1000", () => {
    const result = pool_schema.validate(1001)

    expect(result.error).toBeTruthy()
  })

  it("accepts expected values", () => {
    const result = pool_schema.validate(5)

    expect(result.error).toBeFalsy()
  })
})
