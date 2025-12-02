const commands = require("../../commands")

const { features } = require("../index")

describe("features data files", () => {
  describe.each(features.map((value, key) => [key, value]))("%s", (_name, feature) => {
    it("has a name", () => {
      expect(feature.name).toBeTruthy()
    })

    it("references real commands", () => {
      for (const bucket in feature.commands) {
        expect(commands.hasAll(bucket))
      }
    })
  })
})
