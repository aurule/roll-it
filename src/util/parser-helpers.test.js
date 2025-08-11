const helpers = require("./parser-helpers")

describe("option schema validation helper", () => {
  describe("validateOptions", () => {
    it("with valid options, returns sanitized values", async () => {
      const command = require("../commands/nwod")
      const options = {
        pool: "6",
      }

      const result = await helpers.validateOptions(options, command)

      expect(result).toMatchObject({
        pool: 6,
      })
    })

    it("with invalid options, throws error", async () => {
      const command = require("../commands/nwod")
      const options = {
        pool: "0",
      }

      await expect(helpers.validateOptions(options, command)).rejects.toThrow()
    })
  })
})
