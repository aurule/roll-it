import { all } from "./command-completers.js"

describe("command name completers", () => {
  beforeEach(() => {
    vitest.mock(import("../commands/index.js"), async (importOriginal) => {
      const all_choices = new Array(30).fill({ name: "test", value: "test" })
      all_choices.push({ name: "wod20", value: "wod20" }, { name: "chop", value: "chop" })

      const actual = await importOriginal()
      return {
        ...actual,
        all_choices,
      }
    })
  })

  afterEach(() => {
    vitest.restoreAllMocks()
  })

  describe("all", () => {
    let choices

    beforeEach(() => {
      choices = new Array(30).fill({ name: "test", value: "test" })
      choices.push({ name: "wod20", value: "wod20" }, { name: "chop", value: "chop" })
    })

    it("searches command names by lowercase", () => {
      const result = all("WOD", choices)

      expect(result.length).toEqual(1)
    })

    it("sends command name as value", () => {
      const result = all("CHOP", choices)

      expect(result[0].value).toEqual("chop")
    })

    it("sends up to 25 options", () => {
      const result = all("", choices)

      expect(result.length).toEqual(25)
    })
  })
})
