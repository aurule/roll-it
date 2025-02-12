const rollReply = require("./roll-reply")

const { CommandInteraction, MessageFlags } = require("discord.js")

class PatchMeRollReply {
  reply(args) {
    return args
  }
}

describe("patch", () => {
  it("targets the base command class by default", () => {
    rollReply.patch()

    expect(CommandInteraction.prototype.rollReply).not.toBeUndefined()
  })
})

describe("rollReply", () => {
  beforeAll(() => {
    rollReply.patch(PatchMeRollReply)
  })

  it("sends a reply that includes the message", () => {
    const fake = new PatchMeRollReply()

    const result = fake.rollReply("test message", false)

    expect(result.content).toMatch("test message")
  })

  it("without ephemeral, sends a normal reply", () => {
    const fake = new PatchMeRollReply()

    const result = fake.rollReply("test message", false)

    expect(result.flags).not.toEqual(MessageFlags.Ephemeral)
  })

  it("with ephemeral, sends an ephemeral reply", () => {
    const fake = new PatchMeRollReply()

    const result = fake.rollReply("test message", true)

    expect(result.flags).toEqual(MessageFlags.Ephemeral)
  })
})
