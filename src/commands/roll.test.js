vitest.mock("../util/message-builders")

import { Roll } from "./roll.js"

describe("/roll command", () => {
  describe("schema", () => {
    describe("sides", () => {
      const sides_schema = Roll.schema.extract("sides")

      it("is required", () => {
        const result = sides_schema.validate()

        expect(result.error).toBeTruthy()
      })

      it("is an integer", () => {
        const result = sides_schema.validate(1.5)

        expect(result.error).toBeTruthy()
      })

      it("must be at least 2", () => {
        const result = sides_schema.validate(0)

        expect(result.error).toBeTruthy()
      })

      it("must be at most 100000", () => {
        const result = sides_schema.validate(100001)

        expect(result.error).toBeTruthy()
      })

      it("allows expected values", () => {
        const result = sides_schema.validate(30)

        expect(result.error).toBeFalsy()
      })
    })
  })
})
