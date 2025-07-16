const { saved_bonus_target } = require("./saved-bonus-target")

describe("saved_bonus_target", () => {
  describe("with no bonus", () => {
    it("returns null for undefined", () => {
      const result = saved_bonus_target(undefined, "modifier", ["modifier"])

      expect(result).toBe(null)
    })

    it("returns null for zero", () => {
      const result = saved_bonus_target(0, "modifier", ["modifier"])

      expect(result).toBe(null)
    })
  })

  describe("with change", () => {
    it("returns change when it exists", () => {
      const result = saved_bonus_target(1, "modifier", ["modifier"])

      expect(result).toEqual("modifier")
    })

    it("returns default when not found", () => {
      const result = saved_bonus_target(1, "leaf", ["modifier"])

      expect(result).toEqual("modifier")
    })
  })

  describe("without change", () => {
    it("returns default", () => {
      const result = saved_bonus_target(1, undefined, ["modifier"])

      expect(result).toEqual("modifier")
    })
  })
})
