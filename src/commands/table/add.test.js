import { GuildRollables } from "../../db/rollable.js"
import { Interaction } from "../../../testing/interaction.js"
import { Attachment } from "../../../testing/attachment.js"

import { Add, MAX_ENTRY_LENGTH } from "./add.js"

describe("/table add", () => {
  /**
   * @type Interaction
   */
  let interaction

  /**
   * @type GuildRollables
   */
  let rollables

  beforeEach(() => {
    interaction = new Interaction()
    interaction.command_options.subcommand_name = "add"
    rollables = new GuildRollables(interaction.guildId)
  })

  beforeAll(() => {
    vitest.mock(import("../../util/attachment-lines.js"), async (importOriginal) => {
      const actual = await importOriginal()
      return {
        ...actual,
        fetchLines: (attachment) => attachment.contents.split(/\n/)
      }
    })
  })

  afterAll(() => {
    vitest.restoreAllMocks()
  })

  describe("validate_options", () => {
    it("requires unique name", () => {
      rollables.create("test", "a test", ["first"])
      interaction.command_options = {
        name: "test",
        description: "blah",
      }
      const table_add_command = new Add(interaction)

      const result = table_add_command.validate_options()

      expect(result).toMatch("already have a table named")
    })

    it("requires text/plain MIME type", () => {
      interaction.command_options = {
        name: "test",
        description: "a test",
        file: new Attachment({
          contentType: "nope/alope",
          contents: "",
        })
      }
      const table_add_command = new Add(interaction)

      const result = table_add_command.validate_options()

      expect(result).toMatch("doesn't look like a plain text")
    })

    it("requires file size < max upload size", () => {
      interaction.command_options = {
        name: "test",
        description: "a test",
        file: new Attachment({
          contentType: "text/plain",
          contents: "first\nsecond",
          size: 25_000_000,
        })
      }
      const table_add_command = new Add(interaction)

      const result = table_add_command.validate_options()

      expect(result).toMatch("too large")
    })
  })

  describe("validate_contents", () => {
    beforeEach(() => {
      interaction.command_options = {
        name: "test",
        description: "a test",
      }
    })
    it("requires at least two lines", async () => {
      interaction.command_options.file = new Attachment({
        contentType: "text/plain",
        contents: "first",
      })
      const table_add_command = new Add(interaction)
      table_add_command.contents = ["first"]

      const result = await table_add_command.validate_contents()

      expect(result).toMatch("not have enough lines")
    })

    it("requires line length < max entry len", async () => {
      interaction.command_options.file = new Attachment({
        contentType: "text/plain",
        contents: "first",
      })
      const table_add_command = new Add(interaction)
      table_add_command.contents = ["first", "x".repeat(2000)]

      const result = await table_add_command.validate_contents()

      expect(result).toMatch("one of the table entries is too long")
    })
  })

  describe("help_data", () => {
    it("includes max entry length", () => {
      const result = Add.help_data({})

      expect(result.entry_length).toEqual(MAX_ENTRY_LENGTH)
    })
  })

  describe("execute", () => {
    beforeEach(() => {
      interaction.command_options = {
        name: "test",
        description: "a test",
        file: new Attachment({
          contentType: "text/plain",
          contents: "first\nsecond\nthird",
        })
      }
    })

    it("adds a table for the interaction's guild", async () => {
      const table_add_command = new Add(interaction)

      await table_add_command.execute()

      const table = rollables.detail(undefined, "test")
      expect(table).toBeTruthy()
    })

    it("announces the new table", async () => {
      const table_add_command = new Add(interaction)

      await table_add_command.execute()

      expect(interaction.replyContent).toMatch("created the table")
    })

    it("announcement is ephemeral if secret", async () => {
      interaction.command_options.secret = true
      const table_add_command = new Add(interaction)

      await table_add_command.execute()

      expect(interaction.replies[0].ephemeral).toBeTruthy()
    })
  })
})
