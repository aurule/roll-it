vitest.mock("../util/message-builders")

import { CommandInteraction, MessageFlags } from "discord.js"

import { patch as patchEnsure } from "./ensure.js"
import { patch, patchDiscord } from "./roll-reply.js"

class PatchMeRollReply {
  async reply(args) {
    return args
  }
}

describe("default patches", () => {
  beforeAll(() => {
    patchDiscord()
  })

  it("targets the base command class by default", () => {
    expect(CommandInteraction.prototype.rollReply).not.toBeUndefined()
  })
})

describe("rollReply helper", () => {
  let fake

  beforeAll(() => {
    patch(PatchMeRollReply)
    patchEnsure(PatchMeRollReply)
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
