const { Interaction } = require("../../testing/interaction")
const { test_secret_option } = require("../../testing/shared/execute-secret")

const met_static_command = require("./static")

describe("execute", () => {
  var interaction

  beforeEach(() => {
    interaction = new Interaction()
    interaction.command_options.subcommand_name = "static"
  })

  it("rolls a single result", async () => {
    await met_static_command.execute(interaction)

    expect(interaction.replyContent).toMatch("rolled")
  })

  it("rolls multiple results", async () => {
    interaction.command_options.rolls = 2

    await met_static_command.execute(interaction)

    expect(interaction.replyContent).toMatch("2 times")
  })

  it("shows description if present", async () => {
    interaction.command_options.description = "a test"

    await met_static_command.execute(interaction)

    expect(interaction.replyContent).toMatch("a test")
  })

  test_secret_option(met_static_command)
})
