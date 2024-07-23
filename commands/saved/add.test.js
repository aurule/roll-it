const { GuildRollables } = require("../../db/rollable")
const { Interaction } = require("../../testing/interaction")
const { Attachment } = require("../../testing/attachment")
const attachment_lines = require("../../util/attachment-lines")

describe("execute", () => {
  it.todo("warns on name collision")
  it.todo("warns on unknown command")
  it.todo("adds a saved roll for the interaction's guild and user")
  it.todo("instructs about next step")
})
