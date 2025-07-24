jest.mock("../util/message-builders")

const ensure = require("./ensure")
const rollReply = require("./roll-reply")

const { CommandInteraction, MessageFlags } = require("discord.js")

class PatchMeRollReply {
  async reply(args) {
    return args
  }
}

describe("patch", () => {
  it("targets the base command class by default", () => {
    rollReply.patch()

    expect(CommandInteraction.prototype.rollReply).not.toBeUndefined()
  })
})

describe("rollReply helper", () => {
  let fake

  beforeAll(() => {
    rollReply.patch(PatchMeRollReply)
    ensure.patch(PatchMeRollReply)
  })

  beforeEach(() => {
    fake = new PatchMeRollReply()
  })

  it("sends a reply that includes the message", async () => {
    const result = await fake.rollReply("test message", false)

    expect(result.content).toMatch("test message")
  })

  it("with secret false, sends a normal reply", async () => {
    const result = await fake.rollReply("test message", false)

    expect(result.flags).not.toHaveFlag(MessageFlags.Ephemeral)
  })

  it("with secret true, sends an ephemeral reply", async () => {
    const result = await fake.rollReply("test message", true)

    expect(result.flags).toHaveFlag(MessageFlags.Ephemeral)
  })
})
