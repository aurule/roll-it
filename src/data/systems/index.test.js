const commands = require("../../commands")

const { systems } = require("../index")

describe("systems", () => {
  describe.each(systems.map((value, key) => [key, value]))("%s", (name, system) => {
    it("has a name", () => {
      expect(system.name).toBeTruthy()
    })

    it("references real commands", () => {
      for (const bucket in system.commands) {
        expect(commands.hasAll(bucket))
      }
    })
  })
})
