import { validateOptions } from "./parser-helpers.js"
import { D6 } from "../commands/d6.js"

describe("option schema validation helper", () => {
  describe("validateOptions", () => {
    it("with valid options, returns sanitized values", async () => {
      const options = {
        pool: "6",
      }

      const result = await validateOptions(options, D6)

      expect(result).toMatchObject({
        pool: 6,
      })
    })

    it("with invalid options, throws error", async () => {
      const options = {
        pool: "0",
      }

      await expect(validateOptions(options, D6)).rejects.toThrow()
    })
  })
})
