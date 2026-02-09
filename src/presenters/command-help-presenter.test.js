import { Magic8Ball } from "../commands/8ball.js"
import { Saved } from "../commands/saved.js"
import { SetupRollIt } from "../commands/setup-roll-it.js"
import { SaveThisRoll } from "../commands/save-this-roll.js"

import { present } from "./command-help-presenter.js"

describe("command help presenter", () => {
  describe("present", () => {
    it("names the command", () => {
      const result = present(Magic8Ball, "en-US")

      expect(result).toMatch("`/8ball`")
    })

    it("gets translated help text", () => {
      const result = present(Magic8Ball, "en-US")

      expect(result).toMatch("asks a question")
    })

    describe("with options", () => {
      it("names the options", () => {
        const result = present(Magic8Ball, "en-US")

        expect(result).toMatch("`question`")
      })

      it("describes the options", () => {
        const result = present(Magic8Ball, "en-US")

        expect(result).toMatch("The question")
      })

      it("marks required options", () => {
        const result = present(Magic8Ball, "en-US")

        expect(result).toMatch("`question` (required)")
      })
    })

    describe("with subcommands", () => {
      it("uses correct label", () => {
        const result = present(Saved, "en-US")

        expect(result).toMatch("Subcommands:")
      })

      it("shows the subcommands", () => {
        const result = present(Saved, "en-US")

        expect(result).toMatch("grow")
        expect(result).toMatch("list")
      })
    })

    describe("with no options or subcommands", () => {
      it("has no args section", () => {
        const result = present(SetupRollIt, "en-US")

        expect(result).not.toMatch("Args:")
      })

      it("has no subcommands section", () => {
        const result = present(SetupRollIt, "en-US")

        expect(result).not.toMatch("Subcommands:")
      })
    })

    describe("with a context command", () => {
      it("has no args section", () => {
        const result = present(SaveThisRoll, "en-US")

        expect(result).not.toMatch("Args:")
      })
    })
  })
})
