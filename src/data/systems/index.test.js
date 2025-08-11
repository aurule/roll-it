const commands = require("../../commands")

const { systems } = require("../index")

describe("systems data files", () => {
  describe.each(systems.map((value, key) => [key, value]))("%s", (_name, system) => {
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
