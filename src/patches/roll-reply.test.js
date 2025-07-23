jest.mock("../util/message-builders")

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
  let fake

  beforeAll(() => {
    rollReply.patch(PatchMeRollReply)
  })

  beforeEach(() => {
    fake = new PatchMeRollReply()
  })

  it("sends a reply that includes the message", () => {
    const result = fake.rollReply("test message", false)

    expect(result.content).toMatch("test message")
  })

  it("without ephemeral, sends a normal reply", () => {
    const result = fake.rollReply("test message", false)

    expect(result.flags).not.toHaveFlag(MessageFlags.Ephemeral)
  })

  it("with ephemeral, sends an ephemeral reply", () => {
    const result = fake.rollReply("test message", true)

    expect(result.flags).toHaveFlag(MessageFlags.Ephemeral)
  })
})
