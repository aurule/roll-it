import { hasTrigger } from "./sacrifice.js"

describe("sacrifice easter egg", () => {
  describe("hasTrigger", () => {
    it("returns true when one trigger appears", () => {
      const message = "a sacrifice"

      const result = hasTrigger(message)

      expect(result).toEqual(true)
    })

    it("returns true when multiple triggers appears", () => {
      const message = "a sacrifice for sacrificing"

      const result = hasTrigger(message)

      expect(result).toEqual(true)
    })

    it("returns false with no triggers", () => {
      const message = "something else"

      const result = hasTrigger(message)

      expect(result).toEqual(false)
    })
  })
})
