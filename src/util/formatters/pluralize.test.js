const { pluralize } = require("./pluralize")

describe("pluralize helper", () => {
  describe("with normal word", () => {
    it("with number 1, returns the word", () => {
      const result = pluralize("wall", 1)

      expect(result).toEqual("wall")
    })

    it("with number higher, returns the word with s", () => {
      const result = pluralize("wall", 2)

      expect(result).toEqual("walls")
    })

    it("with negative number 1, returns the word", () => {
      const result = pluralize("wall", -1)

      expect(result).toEqual("wall")
    })

    it("with negative number higher, returns the word with s", () => {
      const result = pluralize("wall", -2)

      expect(result).toEqual("walls")
    })
  })

  describe("with an exception", () => {
    it("with number 1, returns the word", () => {
      const result = pluralize("die", 1)

      expect(result).toEqual("die")
    })

    it("with number higher, returns the variant", () => {
      const result = pluralize("die", 2)

      expect(result).toEqual("dice")
    })

    it("with negative number 1, returns the word", () => {
      const result = pluralize("die", -1)

      expect(result).toEqual("die")
    })

    it("with negative number higher, returns the variant", () => {
      const result = pluralize("die", -2)

      expect(result).toEqual("dice")
    })
  })
})
