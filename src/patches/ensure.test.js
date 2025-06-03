const ensure = require("./ensure")

const {
  MessageFlags,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
  Message,
} = require("discord.js")

class PatchMeEnsure {
  reply(args) {
    return Promise.resolve(args)
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
    ensure.patch()

    expect(klass.prototype.ensure).not.toBeUndefined()
  })
})

describe("ensure", () => {
  beforeAll(() => {
    ensure.patch(PatchMeEnsure)
  })

  it("calls the named function", async () => {
    const fake = new PatchMeEnsure()

    const result = await fake.ensure("reply", "test message")

    expect(result).toMatch("test message")
  })
})
