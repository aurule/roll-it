const eightball_command = require("../commands/8ball")
const save_this_roll_command = require("../commands/save-this-roll")
const table_list_command = require("../commands/table/list")
const commands = require("../commands")

const CommandNamePresenter = require("./command-name-presenter")

describe("command name presenter", () => {
  describe("present", () => {
    describe("with a menu command", () => {
      it("uses the name directly", () => {
        const result = CommandNamePresenter.present(save_this_roll_command, "en-US")

        expect(result).toEqual(`*Save this roll*`)
      })

      it("with unformatted true, strips md formatting", () => {
        const result = CommandNamePresenter.present(save_this_roll_command, "en-US", {
          unformatted: true,
        })

        expect(result).toEqual(`Save this roll`)
      })
    })

    describe("with a slash command", () => {
      it("prefixes the name with a slash", () => {
        const result = CommandNamePresenter.present(eightball_command, "en-US")

        expect(result).toEqual("`/8ball`")
      })

      it("with unformatted true, strips md formatting", () => {
        const result = CommandNamePresenter.present(eightball_command, "en-US", {
          unformatted: true,
        })

        expect(result).toEqual("/8ball")
      })
    })

    describe("with a subcommand", () => {
      it("returns an accurate invocation", () => {
        const result = CommandNamePresenter.present(table_list_command, "en-US")

        expect(result).toMatch("`/table list`")
      })

      it("with unformatted true, strips md formatting", () => {
        const result = CommandNamePresenter.present(table_list_command, "en-US", {
          unformatted: true,
        })

        expect(result).toMatch("/table list")
      })
    })
  })

  describe("list", () => {
    it("shows commands", () => {
      const result = CommandNamePresenter.list(commands.sorted.get("en-US"))

      expect(result.some((r) => r.includes("8ball"))).toBeTruthy()
    })

    it("shows subcommands", () => {
      const result = CommandNamePresenter.list(commands.sorted.get("en-US"))

      expect(result.some((r) => r.includes("saved list"))).toBeTruthy()
    })
  })
})
