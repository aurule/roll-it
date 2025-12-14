const cancelButton = require("./features-button")

describe("installation features button", () => {
  describe("data", () => {
    it("has the features label", () => {
      const result = cancelButton.data("en-US")

      expect(result.data.label).toMatch("Change Features")
    })
  })
})
