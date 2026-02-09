import { hasTrigger, qualified, spotted } from "./hummingbird.js"

describe("hummingbird easter egg", () => {
  describe("hasTrigger", () => {
    it("returns true when one trigger appears", () => {
      const message = "perception"

      const result = hasTrigger(message)

      expect(result).toEqual(true)
    })

    it("returns true when multiple triggers appears", () => {
      const message = "perceiving for a look"

      const result = hasTrigger(message)

      expect(result).toEqual(true)
    })

    it("returns false with no triggers", () => {
      const message = "something else"

      const result = hasTrigger(message)

      expect(result).toEqual(false)
    })
  })

  describe("qualified", () => {
    it("returns true with 11 successes", () => {
      const result = qualified(11)

      expect(result).toEqual(true)
    })

    it("returns false with other successes", () => {
      const result = qualified(10)

      expect(result).toEqual(false)
    })
  })

  describe("spotted", () => {
    it("returns the localized message", () => {
      const result = spotted("en-US")

      expect(result).toMatch("You saw the hummingbird")
    })
  })
})
