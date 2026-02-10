import { Magic8Ball } from "../commands/8ball.js"
import { SaveThisRoll } from "../commands/save-this-roll.js"
import { List } from "../commands/table/list.js"
import { sortedCommands } from "../commands/index.js"

import "../commands/saved.js"
import "../commands/report-this-roll.js"

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

        expect(result).toMatch("`/table list`")
      })

      it("with unformatted true, strips md formatting", () => {
        const result = present(List, "en-US", {
          unformatted: true,
        })

        expect(result).toMatch("/table list")
      })
    })
  })

  describe("list", () => {
    it("shows commands", () => {
      const result = list(sortedCommands("en-US").commands)

      expect(result.some((r) => r.includes("8ball"))).toBeTruthy()
    })

    it("shows subcommands", () => {
      const result = list(sortedCommands("en-US").commands)

      expect(result.some((r) => r.includes("saved list"))).toBeTruthy()
    })

    it("shows context commands", () => {
      const result = list(sortedCommands("en-US").commands)

      expect(result.some((r) => r.includes("Report this roll"))).toBeTruthy()
    })
  })
})
