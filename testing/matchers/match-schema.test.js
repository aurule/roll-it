import { expect, it, describe } from "@jest/globals"
import Joi from "joi"

import { toMatchSchema } from "./match-schema.js"

describe("toMatchSchema", () => {
  const test_schema = Joi.string()

  it("has a valid subject", () => {
    const result = toMatchSchema("test", test_schema)

    expect(result.pass).toBe(true)
  })

  it("has an invalid subject", () => {
    const result = toMatchSchema(5, test_schema)

    expect(result.pass).toBe(false)
  })
})
