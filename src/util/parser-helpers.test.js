import { validateOptions } from "./parser-helpers"
import { Nwod } from "../commands/nwod"

describe("option schema validation helper", () => {
  describe("validateOptions", () => {
    it("with valid options, returns sanitized values", async () => {
      const options = {
        pool: "6",
      }

      const result = await validateOptions(options, Nwod)

      expect(result).toMatchObject({
        pool: 6,
      })
    })

    it("with invalid options, throws error", async () => {
      const options = {
        pool: "0",
      }

      await expect(validateOptions(options, Nwod)).rejects.toThrow()
    })
  })
})
