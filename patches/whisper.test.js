const whisper = require("./whisper")

const { CommandInteraction } = require("discord.js")

class PatchMeWhisper {
  reply(args) {
    return args
  }
}

describe("patch", () => {
  it("targets the base command class by default", () => {
    whisper.patch()

    expect(CommandInteraction.prototype.whisper).not.toBeUndefined()
  })
})

describe("whisper", () => {
  beforeAll(() => {
    whisper.patch(PatchMeWhisper)
  })

  it("sends a reply that includes the message", () => {
    const fake = new PatchMeWhisper()

    const result = fake.whisper("test message")

    expect(result.content).toMatch("test message")
  })

  it("sends an ephemeral reply", () => {
    const fake = new PatchMeWhisper()

    const result = fake.whisper("test message")

    expect(result.ephemeral).toEqual(true)
  })
})
