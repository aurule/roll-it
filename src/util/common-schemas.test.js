import {
  descriptionSchema,
  rollsSchema,
  modifierSchema,
  utilSchema,
  poolSchema,
  untilSchema,
} from "../util/common-schemas.js"

import { schemaMessages } from "../../testing/schema-messages.js"

describe("shared option schemas", () => {
  describe("description", () => {
    it("is optional", () => {
      const desc_string = undefined

      const result = descriptionSchema.validate(desc_string, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("description")
    })

    it("allows at most 1500 characters", () => {
      const desc_string = "x".repeat(2000)

      const result = descriptionSchema.validate(desc_string, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("too long")
    })
  })

  describe("rolls", () => {
    it("is optional", () => {
      const rolls_value = undefined

      const result = rollsSchema.validate(rolls_value, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).not.toMatch("rolls")
    })

    it("is an integer", () => {
      const rolls_value = 1.5

      const result = rollsSchema.validate(rolls_value, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("whole number")
    })

    it("must be at least 1", () => {
      const rolls_value = 0

      const result = rollsSchema.validate(rolls_value, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("between")
    })

    it("must be at most 100", () => {
      const rolls_value = 101

      const result = rollsSchema.validate(rolls_value, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toMatch("between")
    })

    it.concurrent.each([[1], [15], [100]])("allows normal value %i", async (val) => {
      const rolls_value = val

      const result = rollsSchema.validate(rolls_value, {
        abortEarly: false,
      })

      expect(schemaMessages(result)).toBeFalsy()
    })
  })

  describe("modifier", () => {
    it("is optional", () => {
      const modifier_value = undefined

      const result = modifierSchema.validate(modifier_value)

      expect(schemaMessages(result)).not.toMatch("Modifier")
    })

    it("is an integer", () => {
      const modifier_value = 1.2

      const result = modifierSchema.validate(modifier_value)

      expect(schemaMessages(result)).toMatch("whole number")
    })
  })

  describe("until", () => {
    it("is optional", () => {
      const result = untilSchema.validate()

      expect(result.error).toBeFalsy()
    })

    it("is an int", () => {
      const result = untilSchema.validate(5.5)

      expect(result.error).toBeTruthy()
    })

    it("min of 1", () => {
      const result = untilSchema.validate(0)

      expect(result.error).toBeTruthy()
    })

    it("max of 100", () => {
      const result = untilSchema.validate(101)

      expect(result.error).toBeTruthy()
    })

    it("accepts expected values", () => {
      const result = untilSchema.validate(8)

      expect(result.error).toBeFalsy()
    })
  })

  describe("pool", () => {
    it("is required", () => {
      const result = poolSchema.validate()

      expect(result.error).toBeTruthy()
    })

    it("is an int", () => {
      const result = poolSchema.validate(4.2)

      expect(result.error).toBeTruthy()
    })

    it("min of zero", () => {
      const result = poolSchema.validate(-1)

      expect(result.error).toBeTruthy()
    })

    it("max of 1000", () => {
      const result = poolSchema.validate(1001)

      expect(result.error).toBeTruthy()
    })

    it("accepts expected values", () => {
      const result = poolSchema.validate(5)

      expect(result.error).toBeFalsy()
    })
  })
})
