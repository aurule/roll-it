const { Interaction } = require("../../../testing/interaction")
const { test_secret_option } = require("../../../testing/shared/execute-secret")

const met_static_command = require("./static")

describe("perform", () => {
  it("rolls a single result", () => {
    const result = met_static_command.perform({})

    expect(result).toMatch("rolled")
  })

  it("rolls multiple results", () => {
    const result = met_static_command.perform({
      rolls: 2,
    })

    expect(result).toMatch("2 times")
  })

  it("shows description if present", () => {
    const result = met_static_command.perform({
      description: "a test",
    })

    expect(result).toMatch("a test")
  })
})

describe("execute", () => {
  var interaction

  beforeEach(() => {
    interaction = new Interaction()
    interaction.command_options.subcommand_name = "static"
  })

  test_secret_option(met_static_command)
})
