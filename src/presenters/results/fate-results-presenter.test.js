import { i18n } from "../../locales/index.js"

import { presentOne, presentMany, detail } from "./fate-results-presenter.js"

describe("fate results presenter", () => {
  describe("presentOne", () => {
    const defaultArgs = {
      raw: [[1, 1, 2, 3]],
      summed: [-1],
      modifier: 2,
      t: i18n.getFixedT("en-US", "commands", "fate"),
    }

    it("includes the ladder word for the sum", () => {
      const result = presentOne(defaultArgs)

      expect(result).toMatch("Average")
    })

    it("shows the sum", () => {
      const result = presentOne(defaultArgs)

      expect(result).toMatch("+1")
    })

    it("includes description if present", () => {
      const result = presentOne({
        description: "test roll",
        ...defaultArgs,
      })

      expect(result).toMatch('"test roll"')
    })
  })

  describe("presentMany", () => {
    const defaultArgs = {
      raw: [
        [1, 2, 3, 3],
        [2, 1, 3, 2],
      ],
      summed: [2, 0],
      modifier: 5,
      t: i18n.getFixedT("en-US", "commands", "fate"),
    }

    it("highlights final sum", () => {
      const result = presentMany(defaultArgs)

      expect(result).toMatch("+7")
    })

    it("includes the ladder word for the final sum", () => {
      const result = presentMany(defaultArgs)

      expect(result).toMatch("Epic")
    })

    it("includes description if present", () => {
      const result = presentMany({
        description: "test roll",
        ...defaultArgs,
      })

      expect(result).toMatch('"test roll"')
    })
  })

  describe("detail", () => {
    const default_raw = [1, 1, 2, 3]
    const default_modifier = 2

    it("shows the breakdown of the dice", () => {
      const result = detail(default_raw, default_modifier)

      expect(result).toMatch("fateneg")
      expect(result).toMatch("fatezero")
      expect(result).toMatch("fatepos")
    })

    it("shows the modifier if non-zero", () => {
      const result = detail(default_raw, default_modifier)

      expect(result).toMatch(" + 2")
    })

    it("excludes modifier if zero", () => {
      const result = detail(default_raw, 0)

      expect(result).not.toMatch(" + ")
    })
  })
})
