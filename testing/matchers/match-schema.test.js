const { expect, it } = require("@jest/globals")
const Joi = require("joi")

const { toMatchSchema } = require("./match-schema")

describe("toMatchSchema", () => {
  const test_schema = Joi.string()

  it("has a valid subject", () => {
    expect("test").toMatchSchema(test_schema)
  })

  it("has an invalid subject", () => {
    expect(5).not.toMatchSchema(test_schema)
  })
})
