import { present } from "./coin-results-presenter.js"

import { simpleflake } from "simpleflakes"

describe("coin results presenter", () => {
  describe("present", () => {
    const defaultArgs = {
      static_test: false,
      bomb: false,
      description: "test roll",
      raw: [[1]],
      userFlake: simpleflake(),
    }

    it("includes the user placeholder", () => {
      const result = present(defaultArgs)

      expect(result).toMatch("{{userMention}}")
    })

    it("includes description if present", () => {
      const result = present(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.description}"`)
    })

    it("includes the call if present", () => {
      const result = present({
        ...defaultArgs,
        call: "1",
      })

      expect(result).toMatch("called *heads*")
    })
  })
})
