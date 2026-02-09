import cancelButton from "./cancel-button.js"

describe("installation cancel button", () => {
  describe("data", () => {
    it("has the cancel label", () => {
      const result = cancelButton.data("en-US")

      expect(result.data.label).toMatch("Cancel")
    })
  })
})
