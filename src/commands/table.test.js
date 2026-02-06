jest.mock("../util/message-builders")

import { GuildRollables } from "../db/rollable.js"
import { Interaction } from "../../testing/interaction.js"
import { Attachment } from "../../testing/attachment.js"
const table_command = require("./table")

describe("/table command", () => {
  describe("execute", () => {
    it("calls roll subcommand", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "roll"
      const contents = ["first"]
      rollables = new GuildRollables(interaction.guildId)
      const insertion = rollables.create("test", "a test", contents)
      interaction.command_options.table = insertion.lastInsertRowid.toString()

      await table_command.execute(interaction)

      expect(interaction.replyContent).toMatch("first")
    })

    it("calls list subcommand", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "list"
      const contents = ["first"]
      rollables = new GuildRollables(interaction.guildId)
      rollables.create("test", "a test", contents)

      await table_command.execute(interaction)

      expect(interaction.replyContent).toMatch("a test")
    })

    it("calls add subcommand", async () => {
      const fetchMock = vitest.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          text: () => "hello\nthere",
        }),
      )

      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "add"
      interaction.command_options.name = "test"
      interaction.command_options.description = "a test table"
      interaction.command_options.file = new Attachment({
        contentType: "text/plain",
        contents: "first\nsecond\nthird",
      })

      await table_command.execute(interaction)

      expect(interaction.replyContent).toMatch("created the table")

      fetchMock.mockRestore()
    })

    it("calls manage subcommand", async () => {
      const interaction = new Interaction()
      interaction.command_options.subcommand_name = "manage"
      const contents = ["first"]
      rollables = new GuildRollables(interaction.guildId)
      const insertion = rollables.create("test", "a test", contents)
      interaction.command_options.table = insertion.lastInsertRowid.toString()
      const prompt = interaction.message

      await table_command.execute(interaction)

      expect(interaction.replyContent).toMatch("test")
      prompt.componentEvents.timeout()
    })
  })
})
