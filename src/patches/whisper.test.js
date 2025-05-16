const whisper = require("./whisper")

const {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} = require("discord.js")

class PatchMeWhisper {
  reply(args) {
    return args
  }
}

describe("patch", () => {
  it.each([
    [CommandInteraction],
    [ModalSubmitInteraction],
    [ButtonInteraction],
    [UserSelectMenuInteraction],
    [StringSelectMenuInteraction],
    [Message],
  ])("patches %p by default", (klass) => {
    whisper.patch()

    expect(klass.prototype.whisper).not.toBeUndefined()
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

    expect(result.flags).toEqual(MessageFlags.Ephemeral)
  })
})
