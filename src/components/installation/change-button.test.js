const change_button = require("./change-button")

describe("installation change button", () => {
  describe("data", () => {
    it("has the change label", () => {
      const result = change_button.data("en-US")

      expect(result.data.label).toMatch("Change Systems")
    })
  })
})
