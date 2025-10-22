const { i18n } = require("../locales")

const { splitter, normalize, comparator, cache_id } = require("./command-sorter")

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

    describe("with split numbers", () => {
      it("returns array of nums, letters, nums", () => {
        const result = splitter("123asdf456")

        expect(result).toEqual(["123", "asdf", "456"])
      })
    })
  })

  describe("normalize", () => {
    let t

    beforeAll(() => {
      t = i18n.getFixedT("en-US", "commands")
    })

    describe("with top-level command", () => {
      it("returns the translated name", () => {
        const result = normalize({ name: "swn" }, t)

        expect(result).toMatch("swn")
      })
    })

    describe("with subcommand", () => {
      it("includes translated parent name", () => {
        const result = normalize({ name: "static", parent: "met" }, t)

        expect(result).toMatch("met")
      })

      it("includes translated subcommand name", () => {
        const result = normalize({ name: "static", parent: "met" }, t)

        expect(result).toMatch("static")
      })
    })
  })

  describe("cache_id", () => {
    describe("with top-level command", () => {
      it("returns canonical name", () => {
        const result = cache_id({ name: "thing" })

        expect(result).toMatch("thing")
      })
    })

    describe("with subcommand", () => {
      it("includes canonical parent name", () => {
        const result = cache_id({ name: "child", parent: "parent" })

        expect(result).toMatch("parent")
      })

      it("includes canonical subcommand name", () => {
        const result = cache_id({ name: "child", parent: "parent" })

        expect(result).toMatch("child")
      })
    })
  })

  describe("comparator", () => {
    describe("spot tests", () => {
      it.concurrent.each([
        ["8ball", "ffrpg", -1],
        ["d100", "d12", 1],
        ["foo", "foo", 0],
        ["du", "foo", -1],
        ["d4", "d10", -1],
        ["wod20", "d20", 1],
      ])("%s vs %s = %d", (first_name, second_name, order) => {
        const compare = comparator("en-US")

        const result = compare({ name: first_name }, { name: second_name })

        expect(result).toEqual(order)
      })
    })

    describe("en-US comparator", () => {
      let compare

      beforeEach(() => {
        compare = comparator("en-US")
      })

      it("met before met opposed", () => {
        const met = require("../commands/met")
        const opposed = require("../commands/met/opposed")

        const result = compare(met, opposed)

        expect(result).toEqual(-1)
      })

      it("table before table add", () => {
        const table = require("../commands/table")
        const add = require("../commands/table/add")

        const result = compare(table, add)

        expect(result).toEqual(-1)
      })

      it("help before help topic", () => {
        const help = require("../commands/help")
        const topic = require("../commands/help/topic")

        const result = compare(help, topic)

        expect(result).toEqual(-1)
      })
    })
  })
})
