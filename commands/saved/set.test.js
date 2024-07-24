const { GuildRollables } = require("../../db/rollable")
const { Interaction } = require("../../testing/interaction")

const set_command = require("./set")

describe("execute", () => {
  it.todo("warns on name collision")
  it.todo("warns on unknown command")
  it.todo("adds a saved roll for the interaction's guild and user")
  it.todo("instructs about next step")
})
