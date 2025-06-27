const {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} = require("discord.js")

jest.mock("../services/api")

class PatchMeEnsure {
  channel = {
    id: "testchan",
  }

  reply(args) {
    return Promise.resolve(args)
  }

  explode(args) {
    return Promise.reject({
      code: 10062,
    })
  }
}

describe("ensure helper", () => {
  describe("patch", () => {
    const ensure = require("./ensure")

    it.concurrent.each([
      [CommandInteraction],
      [ModalSubmitInteraction],
      [ButtonInteraction],
      [UserSelectMenuInteraction],
      [StringSelectMenuInteraction],
      [Message],
    ])("patches %p by default", async (klass) => {
      ensure.patch()

      expect(klass.prototype.ensure).not.toBeUndefined()
    })
  })

  describe("ensure", () => {
    beforeAll(() => {
      require("./ensure").patch(PatchMeEnsure)
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
  })

})
