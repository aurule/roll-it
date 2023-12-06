const chooser_command = require("./roll-chooser")

const { Interaction } = require("../testing/interaction")

var interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("execute", () => {
  // not sure how to test this yet, since it relies extremely heavily on user interaction
})

describe("data", () => {
  // This test is very bare-bones because we're really just
  // testing that the various calls to discord.js functions
  // were executed properly.
  it("returns something", () => {
    const command_data = chooser_command.data()

    expect(command_data).toBeTruthy()
  })

  it("uses the command's name", () => {
    const command_data = chooser_command.data()

    expect(command_data.name).toEqual(chooser_command.name)
  })
})

describe("help", () => {
  it("includes the command name in the output", () => {
    const help_text = chooser_command.help({ command_name: "sillyness" })

    expect(help_text).toMatch("sillyness")
  })
})
