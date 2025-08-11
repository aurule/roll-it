const { throwOptions } = require("./met-throw-options")

describe("met throw options creator", () => {
  describe("throwOptions", () => {
    it("without bomb, omits bomb options", () => {
      const result = throwOptions("en-US", false)

      const values = result.map((r) => r.value)
      expect(values).not.toContain("bomb")
      expect(values).not.toContain("rand-bomb")
    })

    it("with bomb, includes bomb options", () => {
      const result = throwOptions("en-US", true)

      const values = result.map((r) => r.value)
      expect(values).toContain("bomb")
      expect(values).toContain("rand-bomb")
    })

    it("uses label for name", () => {
      const result = throwOptions("en-US")

      expect(result[0]).toMatchObject({ label: "⛰️ Rock" })
    })
  })
})
