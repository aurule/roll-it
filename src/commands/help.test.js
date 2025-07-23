jest.mock("../util/message-builders")

const help_command = require("./help")
const eightball_command = require("./8ball")

const { Interaction } = require("../../testing/interaction")

describe("/help command", () => {
  describe("execute", () => {
    describe("topic subcommand", () => {
      it("shows the topic", async () => {
        const interaction = new Interaction()
        interaction.command_options.subcommand_name = "topic"
        interaction.command_options.topic = "about"

        await help_command.execute(interaction)

        expect(interaction.replyContent).toMatch("passion project")
      })
    })

    describe("command subcommand", () => {
      it("shows the command", async () => {
        const interaction = new Interaction()
        interaction.command_options.subcommand_name = "command"
        interaction.command_options.command = "8ball"
        interaction.client.commands.set("8ball", eightball_command)

        await help_command.execute(interaction)

        expect(interaction.replyContent).toMatch("Get an answer")
      })
    })
  })

  describe("autocomplete", () => {
    it("delegates to the subcommand", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "command"
      interaction.partial_text = "ff"
      interaction.focused_option = "command"

      const result = await help_command.autocomplete(interaction)

      expect(result[0].name).toMatch("ffrpg")
    })
  })

  describe("help_data", () => {
    it("includes topic names", () => {
      const help_data = help_command.help_data({ locale: "en-US" })

      expect(help_data.topics.some((t) => t.includes("About Roll It"))).toBeTruthy()
    })

    it("includes command names", () => {
      const help_data = help_command.help_data({ locale: "en-US" })

      expect(help_data.commands.some((c) => c.includes("8ball"))).toBeTruthy()
    })
  })
})
