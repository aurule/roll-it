import {
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} from "discord.js"

vitest.mock("../services/api")

import { patch, patchDiscord } from "./ensure.js"

/**
 * Dummy class to test ensure helper
 */
class PatchMeEnsure {
  channel = {
    id: "testchan",
  }

  reply(args) {
    return Promise.resolve(args)
  }

  explode(_args) {
    return Promise.reject({
      code: 10062,
    })
  }

  die(_args) {
    return Promise.reject("nah")
  }
}

describe("ensure helper", () => {
  describe("default patches", () => {
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
      expect(klass.prototype.ensure).not.toBeUndefined()
    })
  })

  describe("ensure", () => {
    beforeAll(() => {
      patch(PatchMeEnsure)
    })

    it("calls the named function", async () => {
      const fake = new PatchMeEnsure()

      const result = await fake.ensure("reply", "test message")

      expect(result).toMatch("test message")
    })

    describe("on unknown interaction error", () => {
      it("sends a plain message", async () => {
        const fake = new PatchMeEnsure()

        const result = await fake.ensure("explode", "test message")

        expect(result.payload).toMatch("test message")
      })
    })

    describe("on other errors", () => {
      it("throws the error", async () => {
        const fake = new PatchMeEnsure()

        await expect(fake.ensure("die", "test message")).rejects.toMatch("nah")
      })
    })
  })
})
