const authorize = require("./authorize")

const {
  ButtonInteraction,
  UserSelectMenuInteraction,
  StringSelectMenuInteraction,
} = require("discord.js")

class PatchMeAuthorize {
  user

  constructor(user_id) {
    this.user = {
      id: user_id,
    }
  }

  reply(args) {
    return args
  }
}

describe("authorize helper", () => {
  describe("patch", () => {
    it.concurrent.each([
      [ButtonInteraction],
      [UserSelectMenuInteraction],
      [StringSelectMenuInteraction],
    ])("patches %p by default", async (klass) => {
      authorize.patch()

      expect(klass.prototype.authorize).not.toBeUndefined()
    })
  })

  describe("authorize", () => {
    beforeAll(() => {
      authorize.patch(PatchMeAuthorize)
    })

    describe("with an allowed user", () => {
      it("is a noop", () => {
        const fake = new PatchMeAuthorize("test user")

        expect(() => fake.authorize("test user", "also me")).not.toThrow()
      })
    })

    describe("with a non-allowed user", () => {
      it("throws an error", () => {
        const fake = new PatchMeAuthorize("test user")

        expect(() => fake.authorize("only me")).toThrow("not allowed")
      })
    })
  })
})
