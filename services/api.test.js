const api = require("./api")

/**
 * Only the functional helper is tested, as the other functions are bare-bones wrappers around
 * api calls and are pointless to test without hitting the actual APIs.
 */
describe("api", () => {
  describe("commandsToJSON", () => {
    const test_command = {
      test: "test",
      data() {return {
        test: this.test,
        toJSON() { return JSON.stringify(this.test) },
      }},
    }

    it("creates json from data()", () => {
      const result = api.commandsToJSON([test_command])

      expect(result[0]).toEqual('"test"')
    })

    it("makes one json object per command", () => {
      const inputs = [test_command]

      const result = api.commandsToJSON(inputs)

      expect(result.length).toEqual(inputs.length)
    })
  })
})
