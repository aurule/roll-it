const { Collection } = require("discord.js")
const commands = require("../commands")
const CommandNamePresenter = require("./command-name-presenter")

const test_subcommand = {
  parent: "test-command",
  name: "sub",
  description: "a test subcommand",
}

const test_command = {
  name: "test-command",
  description: "a test command",
  subcommands: new Collection([["sub", test_subcommand]]),
}

describe("present", () => {
  it("with a menu command, it uses the name directly", () => {
    const result = CommandNamePresenter.present({
      type: "menu",
      ...test_command,
    })

    expect(result).toEqual(`_${test_command.name}_`)
  })

  it("with a slash command, it prefixes the name with a slash", () => {
    const result = CommandNamePresenter.present(test_command)

    expect(result).toEqual(`\`/${test_command.name}\``)
  })

  describe("with a subcommand", () => {
    it("shows the parent name", () => {
      const result = CommandNamePresenter.present(test_subcommand)

      expect(result).toMatch(test_command.name)
    })

    it("shows the child name", () => {
      const result = CommandNamePresenter.present(test_subcommand)

      expect(result).toMatch(test_subcommand.name)
    })

    it("separates with a space", () => {
      const result = CommandNamePresenter.present(test_subcommand)

      expect(result).toMatch(`${test_command.name} ${test_subcommand.name}`)
    })
  })
})

describe("list", () => {
  it("shows commands", () => {
    const commands = new Collection([["test-command", test_command]])

    const result = CommandNamePresenter.list(commands)

    expect(result).toMatch(test_command.name)
  })

  it("shows subcommands", () => {
    const commands = new Collection([["test-command", test_command]])

    const result = CommandNamePresenter.list(commands)

    expect(result).toMatch(test_subcommand.name)
  })
})
