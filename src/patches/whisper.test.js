vitest.mock("../util/message-builders")

import { patch, patchDiscord } from "./whisper"

import {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} from "discord.js"

class PatchMeWhisper {
  reply(args) {
    return args
  }
}

describe("whisper helper", () => {
  describe("patch", () => {
    beforeAll(() => {
      patchDiscord()
    })

    it.concurrent.each([
      [CommandInteraction],
      [ModalSubmitInteraction],
      [ButtonInteraction],
      [UserSelectMenuInteraction],
      [StringSelectMenuInteraction],
      [Message],
    ])("patches %p by default", async (klass) => {
      expect(klass.prototype.whisper).not.toBeUndefined()
    })
  })

  describe("whisper", () => {
    beforeAll(() => {
      patch(PatchMeWhisper)
    })

    it("sends a reply that includes the message", () => {
      const fake = new PatchMeWhisper()

      const result = fake.whisper("test message")

      expect(result.content).toMatch("test message")
    })

    it("sends an ephemeral reply", () => {
      const fake = new PatchMeWhisper()

      const result = fake.whisper("test message")

      expect(result.flags).toHaveFlag(MessageFlags.Ephemeral)
    })
  })
})
