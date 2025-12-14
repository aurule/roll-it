const cancelButton = require("./systems-button")

describe("installation systems button", () => {
  describe("data", () => {
    it("has the systems label", () => {
      const result = cancelButton.data("en-US")

      expect(result.data.label).toMatch("Change Systems")
    })
  })
})
