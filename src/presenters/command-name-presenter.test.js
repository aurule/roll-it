const { Collection } = require("discord.js")
const eightball_command = require("../commands/8ball")
const save_this_roll_command = require("../commands/save-this-roll")
const table_list_command = require("../commands/table/list")
const commands = require("../commands")

const CommandNamePresenter = require("./command-name-presenter")

describe("present", () => {
  it("with a menu command, it uses the name directly", () => {
    const result = CommandNamePresenter.present(save_this_roll_command, "en-US")

    expect(result).toEqual(`*Save this roll*`)
  })

  it("with a slash command, it prefixes the name with a slash", () => {
    const result = CommandNamePresenter.present(eightball_command, "en-US")

    expect(result).toEqual("`/8ball`")
  })

  describe("with a subcommand", () => {
    it("returns an accurate invocation", () => {
      const result = CommandNamePresenter.present(table_list_command, "en-US")

      expect(result).toMatch("`/table list`")
    })
  })
})

describe("list", () => {
  it("shows commands", () => {
    const result = CommandNamePresenter.list(commands)

    expect(result.some(r => r.includes("8ball"))).toBeTruthy()
  })

  it("shows subcommands", () => {
    const result = CommandNamePresenter.list(commands)

    expect(result.some(r => r.includes("saved list"))).toBeTruthy()
  })
})
