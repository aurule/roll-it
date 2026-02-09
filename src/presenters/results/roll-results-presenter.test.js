import { i18n } from "../../locales/index.js"

import { presentOne, presentMany, detail } from "./roll-results-presenter.js"

describe("roll results presenter", () => {
  describe("presentOne", () => {
    const defaultArgs = {
      pool: 2,
      sides: 6,
      description: "test roll",
      raw: [[1, 4]],
      summed: [5],
      modifier: 2,
      t: i18n.getFixedT("en-US", "commands", "roll"),
    }

    it("highlights final sum", () => {
      const result = presentOne(defaultArgs)

      expect(result).toMatch("**7**")
    })

    it("includes description if present", () => {
      const result = presentOne(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.description}"`)
    })
  })

  describe("presentMany", () => {
    const defaultArgs = {
      pool: 2,
      sides: 6,
      description: "test roll",
      raw: [
        [1, 4],
        [2, 5],
      ],
      summed: [5],
      modifier: 2,
      t: i18n.getFixedT("en-US", "commands", "roll"),
    }

    it("highlights final sum", () => {
      const result = presentMany(defaultArgs)

      expect(result).toMatch("**7**")
    })

    it("includes description if present", () => {
      const result = presentMany(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.description}"`)
    })
  })

  describe("detail", () => {
    const defaultArgs = {
      pool: 2,
      sides: 6,
      raw: [1, 4],
      modifier: 2,
    }

    it("names the dice rolled as NdM", () => {
      const result = detail(defaultArgs)

      expect(result).toMatch("2d6")
    })

    it("shows the breakdown of the dice", () => {
      const result = detail(defaultArgs)

      expect(result).toMatch("[1, 4]")
    })

    it("shows the modifier if non-zero", () => {
      const result = detail(defaultArgs)

      expect(result).toMatch(" + 2")
    })

    it("excludes modifier if zero", () => {
      let args = defaultArgs
      args.modifier = 0
      const result = detail(args)

      expect(result).not.toMatch(" + ")
      expect(result).toMatch("]")
    })
  })
})
