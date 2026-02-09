import changeButton from "./change-button.js"

describe("installation change button", () => {
  describe("data", () => {
    it("has the change label", () => {
      const result = changeButton.data("en-US")

      expect(result.data.label).toMatch("Change Systems")
    })
  })
})
