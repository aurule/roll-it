const { splitter, comparator } = require("./command-sorter")

describe("command sorter", () => {
  describe("splitter", () => {
    describe("with no numbers", () => {
      it("returns array of the name", () => {
        const result = splitter("asdf")

        expect(result).toEqual(["asdf"])
      })
    })

    describe("with trailing numbers", () => {
      it("returns array of letters, then numbers", () => {
        const result = splitter("asdf123")

        expect(result).toEqual(["asdf", "123"])
      })

      it("stringifies the numbers", () => {
        const result = splitter("asdf123")

        expect(result[1]).toEqual("123")
      })
    })

    describe("with leading numbers", () => {
      it("returns array of numbers, then letters", () => {
        const result = splitter("123asdf")

        expect(result).toEqual(["123", "asdf"])
      })
    })
  })

  describe("comparator", () => {
    it.concurrent.each([
      ["8ball", "ffrpg", -1],
      ["d100", "d12", 1],
      ["foo", "foo", 0],
      ["d4", "d10", -1],
      ["wod20", "d20", 1],
    ])("%s vs %s = %d", (first_name, second_name, order) => {
      const compare = comparator("en-US")

      const result = compare({name: first_name}, {name: second_name})

      expect(result).toEqual(order)
    })
  })
})
