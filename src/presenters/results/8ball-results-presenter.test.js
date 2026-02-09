import { present } from "./8ball-results-presenter.js"

describe("8ball results presenter", () => {
  describe("present", () => {
    const defaultArgs = {
      doit: false,
      question: "test roll",
      raw: [[1]],
    }

    it("includes the user placeholder", () => {
      const result = present(defaultArgs)

      expect(result).toMatch("{{userMention}}")
    })

    it("includes the question", () => {
      const result = present(defaultArgs)

      expect(result).toMatch(`"${defaultArgs.question}"`)
    })

    it("honors doit override", () => {
      let args = defaultArgs
      args.doit = true

      const result = present(args)

      expect(result).toMatch("Do it")
    })
  })
})
