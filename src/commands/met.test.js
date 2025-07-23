jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")

const met_command = require("./met")

let interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("/met command", () => {
  describe("execute", () => {
    it("delegates to subcommand", async () => {
      interaction.command_options.subcommand_name = "static"

      await met_command.execute(interaction)

      expect(interaction.replyContent).toMatch("rolled")
    })
  })
})
