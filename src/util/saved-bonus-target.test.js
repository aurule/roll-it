import { saved_bonus_target } from "./saved-bonus-target.js"

describe("saved roll bonus field selector", () => {
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

      it("returns change when not found", () => {
        const result = saved_bonus_target(1, "leaf", ["modifier"])

        expect(result).toEqual("leaf")
      })
    })

    describe("without change", () => {
      it("returns default", () => {
        const result = saved_bonus_target(1, undefined, ["modifier"])

        expect(result).toEqual("modifier")
      })
    })
  })
})
