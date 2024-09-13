const whisper = require("./whisper")

const { CommandInteraction } = require("discord.js")

describe("patch", () => {
  it("adds the whisper method to the base command class", () => {
    whisper.patch()

    expect(CommandInteraction.prototype.whisper).not.toBeUndefined()
  })
})
