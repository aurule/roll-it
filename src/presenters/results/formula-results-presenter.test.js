import { i18n } from "../../locales/index.js"

import { detail, presentOne, presentMany, limitedEvaluate } from "./formula-results-presenter.js"

describe("formula results presenter", () => {
  describe("presentOne", () => {
    const default_opts = {
      formula: "1d4 + 5",
      description: "test roll",
      results: [
        {
          rolledFormula: "2 + 5",
          pools: ["1d4"],
          raw: [[2]],
          summed: [2],
          labels: [undefined],
        },
      ],
      t: i18n.getFixedT("en-US", "commands", "formula"),
    }

    it("includes the original formula", () => {
      const result = presentOne(default_opts)

      expect(result).toMatch("1d4 + 5")
    })

    it("includes the rolled formula", () => {
      const result = presentOne(default_opts)

      expect(result).toMatch("2 + 5")
    })

    it("breaks down each pool in the roll", () => {
      const result = presentOne(default_opts)

      expect(result).toMatch("2 from 1d4 [2]")
    })

    it("shows the final total", () => {
      const result = presentOne(default_opts)

      expect(result).toMatch("**7**")
    })

    it("includes the description if present", () => {
      const result = presentOne(default_opts)

      expect(result).toMatch("test roll")
    })

    it("warns on disabled mathjs function", () => {
      const options = {
        ...default_opts,
        formula: "evaluate(1d4 + 3) + 3",
      }
      options.results[0].rolledFormula = "evaluate(4 + 3) + 3"

      const result = presentOne(options)

      expect(result).toMatch("`evaluate` is disabled")
    })
  })

  describe("presentMany", () => {
    const default_opts = {
      rolls: 2,
      formula: "1d6 + 2",
      results: [
        {
          rolledFormula: "3 + 2",
          pools: ["1d6"],
          raw: [[3]],
          summed: [3],
          labels: [undefined],
        },
        {
          rolledFormula: "4 + 2",
          pools: ["1d6"],
          raw: [[4]],
          summed: [4],
          labels: [undefined],
        },
      ],
      t: i18n.getFixedT("en-US", "commands", "formula"),
    }

    it("includes the original formula", () => {
      const result = presentMany(default_opts)

      expect(result).toMatch("1d6 + 2")
    })

    it("includes each rolled formula", () => {
      const result = presentMany(default_opts)

      expect(result).toMatch("3 + 2")
      expect(result).toMatch("4 + 2")
    })

    it("breaks down each pool in a roll", () => {
      const result = presentMany(default_opts)

      expect(result).toMatch("3 from 1d6")
    })

    it("shows each final total", () => {
      const result = presentMany(default_opts)

      expect(result).toMatch("5")
      expect(result).toMatch("6")
    })

    it("includes the description if present", () => {
      const options = {
        ...default_opts,
        description: "test roll",
      }
      const result = presentMany(options)

      expect(result).toMatch("test roll")
    })

    it("warns on disabled mathjs function", () => {
      const options = {
        ...default_opts,
        formula: "evaluate(1d4 + 3) + 3",
      }
      options.results[0].rolledFormula = "evaluate(4 + 3) + 3"

      const result = presentMany(options)

      expect(result).toMatch("`evaluate` is disabled")
    })
  })

  describe("limitedEvaluate", () => {
    it.concurrent.each([
      ["import"],
      ["createUnit"],
      ["evaluate"],
      ["parse"],
      ["simplify"],
      ["derivative"],
    ])("disables %s", async (fn_name) => {
      expect(() => {
        limitedEvaluate(`${fn_name}()`)
      }).toThrow(`${fn_name} is disabled`)
    })
  })

  describe("detail", () => {
    const default_opts = {
      pools: ["1d3", "1d4"],
      raw: [[2], [1]],
      summed: [2, 1],
      labels: [undefined, undefined],
      t: i18n.getFixedT("en-US", "commands", "formula"),
    }

    it("shows every pool", () => {
      const result = detail(default_opts)

      expect(result).toMatch("1d3")
      expect(result).toMatch("1d4")
    })

    it("shows the sum", () => {
      const result = detail(default_opts)

      expect(result).toMatch("2")
    })

    it("shows the label if present", () => {
      const opts = {
        ...default_opts,
        labels: ["thing", undefined],
      }
      const result = detail(opts)

      expect(result).toMatch("thing")
    })

    it("shows raw die results", () => {
      const result = detail(default_opts)

      expect(result).toMatch("[2]")
    })
  })
})
