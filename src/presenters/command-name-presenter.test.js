import { Collection } from "discord.js"
import { Magic8Ball } from "../commands/8ball.js"
import { ReportThisRoll } from "../commands/report-this-roll.js"
import { List } from "../commands/saved/list.js"
import { SaveThisRoll } from "../commands/save-this-roll.js"
import { Saved } from "../commands/saved.js"

import { present, list } from "./command-name-presenter.js"

describe("command name presenter", () => {
  describe("present", () => {
    describe("with a menu command", () => {
      it("uses the name directly", () => {
        const result = present(SaveThisRoll, "en-US")

        expect(result).toEqual(`*Save this roll...*`)
      })

      it("with unformatted true, strips md formatting", () => {
        const result = present(SaveThisRoll, "en-US", {
          unformatted: true,
        })

        expect(result).toEqual(`Save this roll...`)
      })
    })

    describe("with a slash command", () => {
      it("prefixes the name with a slash", () => {
        const result = present(Magic8Ball, "en-US")

        expect(result).toEqual("`/8ball`")
      })

      it("with unformatted true, strips md formatting", () => {
        const result = present(Magic8Ball, "en-US", {
          unformatted: true,
        })

        expect(result).toEqual("/8ball")
      })
    })

    describe("with a subcommand", () => {
      it("returns an accurate invocation", () => {
        const result = present(List, "en-US")

        expect(result).toMatch("`/saved list`")
      })

      it("with unformatted true, strips md formatting", () => {
        const result = present(List, "en-US", {
          unformatted: true,
        })

        expect(result).toMatch("/saved list")
      })
    })
  })

  describe("list", () => {
    const commands = new Collection([
      ["8ball", Magic8Ball],
      ["saved", Saved],
      ["saved list", List],
      ["report-this-roll", ReportThisRoll],
    ])

    it("shows commands", () => {
      const result = list(commands, "en-US")

      expect(result.some((r) => r.includes("8ball"))).toBeTruthy()
    })

    it("shows subcommands", () => {
      const result = list(commands, "en-US")

      expect(result.some((r) => r.includes("saved list"))).toBeTruthy()
    })

    it("shows context commands", () => {
      const result = list(commands, "en-US")

      expect(result.some((r) => r.includes("Report this roll"))).toBeTruthy()
    })

    it("marks installed commands", () => {
      const installed = new Set(["8ball"])
      const result = list(commands, "en-US", installed)

      expect(result.some((r) => r.includes("**`/8ball`**"))).toBeTruthy()
    })
  })
})
