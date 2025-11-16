jest.mock("../util/message-builders")

const { Interaction } = require("../../testing/interaction")

const dnd_command = require("./dnd")

let interaction

beforeEach(() => {
  interaction = new Interaction()
})

describe("/dnd command", () => {
  describe("execute", () => {
    it("delegates to subcommand", async () => {
      interaction.command_options.subcommand_name = "skill"

      await dnd_command.execute(interaction)

      expect(interaction.replyContent).toMatch("rolled")
    })
  })
})
