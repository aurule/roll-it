const featureHelpers = require("./feature-helpers")

describe("feature helpers", () => {
  describe("findbyCommands", () => {
    describe("feature with one required command", () => {
      it("includes if command is in array", () => {
        const command_names = ["coin", "d20"]

        const result = featureHelpers.findByCommands(...command_names)

        const feature_names = result.map((r) => r.name)
        expect(feature_names).toContain("coinflip")
      })

      it("excludes if command is not in array", () => {
        const command_names = ["fate"]

        const result = featureHelpers.findByCommands(...command_names)

        const feature_names = result.map((r) => r.name)
        expect(feature_names).not.toContain("coinflip")
      })
    })
  })
})
